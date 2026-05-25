'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import ClockWidget from './components/ClockWidget';
import WeatherWidget from './components/WeatherWidget';
import FocusWidget from './components/FocusWidget';
import TasksWidget from './components/TasksWidget';
import NewsWidget from './components/NewsWidget';
import CalendarWidget from './components/CalendarWidget';
import Onboarding from './components/Onboarding';
import { getSettings, saveSettings, resetOnboarding } from './lib/storage';
import type { Settings } from './lib/storage';

const DAYS_S = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS_S = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

interface WidgetDef { id: string; name: string; col: number; order: number; visible: boolean; }

const DEFAULT_WIDGETS: WidgetDef[] = [
  { id: 'weather',  name: 'Conditions', col: 0, order: 0, visible: true },
  { id: 'focus',    name: 'Intention',  col: 0, order: 1, visible: true },
  { id: 'calendar', name: 'Schedule',   col: 0, order: 2, visible: true },
  { id: 'tasks',    name: 'Tasks',      col: 1, order: 0, visible: true },
  { id: 'news',     name: 'Headlines',  col: 2, order: 0, visible: true },
];

function getWidgets(): WidgetDef[] {
  if (typeof window === 'undefined') return DEFAULT_WIDGETS;
  try {
    const raw = localStorage.getItem('hexbrief_widgets');
    return raw ? JSON.parse(raw) : DEFAULT_WIDGETS;
  } catch { return DEFAULT_WIDGETS; }
}

function saveWidgets(w: WidgetDef[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('hexbrief_widgets', JSON.stringify(w));
}

export default function Home() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [widgets, setWidgets] = useState<WidgetDef[]>(DEFAULT_WIDGETS);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const dragSrc = useRef<string | null>(null);

  const load = useCallback(() => {
    setSettings(getSettings());
    setWidgets(getWidgets());
  }, []);

  useEffect(() => {
    load();
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, [load]);

  if (!settings) return null;
  if (!settings.onboardingDone) return <Onboarding onDone={load} />;

  const mastDate = now ? `${DAYS_S[now.getDay()]} ${now.getDate()} ${MONTHS_S[now.getMonth()]} ${now.getFullYear()}` : '';

  // Build columns
  const cols: WidgetDef[][] = [[], [], []];
  widgets.filter(w => w.visible).sort((a, b) => a.order - b.order).forEach(w => {
    if (cols[w.col]) cols[w.col].push(w);
  });

  function renderWidget(id: string) {
    switch (id) {
      case 'weather':  return <WeatherWidget city={settings!.weatherCity} />;
      case 'focus':    return <FocusWidget />;
      case 'calendar': return <CalendarWidget icalUrl={settings!.icalUrl} />;
      case 'tasks':    return <TasksWidget />;
      case 'news':     return <NewsWidget feeds={settings!.newsFeeds} />;
      default: return null;
    }
  }

  function onDragStart(id: string) { dragSrc.current = id; }

  function onDrop(targetId: string, targetCol: number, targetOrder: number) {
    if (!dragSrc.current || dragSrc.current === targetId) return;
    const src = dragSrc.current;
    setWidgets(prev => {
      const next = prev.map(w => {
        if (w.id === src) return { ...w, col: targetCol, order: targetOrder - 0.5 };
        return w;
      });
      // Reindex orders within each col
      const reindexed = [...next].sort((a, b) => a.order - b.order);
      const colCounters = [0, 0, 0];
      return reindexed.map(w => ({ ...w, order: colCounters[w.col]++ }));
    });
    dragSrc.current = null;
  }

  function persistWidgets(w: WidgetDef[]) {
    setWidgets(w);
    saveWidgets(w);
  }

  const colStyle: React.CSSProperties = {
    padding: '26px 28px',
    borderRight: '1px solid var(--rule)',
    display: 'flex',
    flexDirection: 'column',
    gap: 28,
    minWidth: 0,
  };

  const handleStyle: React.CSSProperties = {
    display: editMode ? 'flex' : 'none',
    position: 'absolute',
    top: 8, right: 8,
    cursor: 'grab',
    color: 'var(--dim)',
    padding: 4,
    background: 'var(--ink2)',
    border: '1px solid var(--rule)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  };

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Edit mode banner */}
      {editMode && (
        <div style={{ background: 'var(--red)', padding: '8px 36px', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--paper)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Drag widgets to rearrange</span>
          <button onClick={() => { persistWidgets(widgets); setEditMode(false); }}
            style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'transparent', border: '1px solid rgba(255,255,255,0.5)', color: 'var(--paper)', padding: '3px 12px', cursor: 'pointer' }}>
            Done
          </button>
        </div>
      )}

      {/* Masthead */}
      <header style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '16px 36px', borderBottom: '2px solid var(--paper)', gap: 16 }} className="rise">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.14em', color: 'var(--muted)', textTransform: 'uppercase', border: '1px solid var(--rule2)', padding: '3px 8px' }}>Morning Brief</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.08em', color: 'var(--muted)', textTransform: 'uppercase' }}>{mastDate}</span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 26, letterSpacing: '0.18em', color: 'var(--paper)', lineHeight: 1 }}>
            HEX<span style={{ color: 'var(--red)' }}>B</span>RIEF
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.16em', color: 'var(--muted)', textTransform: 'uppercase', marginTop: 2 }}>Personal daily dispatch</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', animation: 'pulse-red 2s infinite', flexShrink: 0 }} />
          <button onClick={() => setEditMode(true)}
            style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', cursor: 'pointer', border: '1px solid var(--rule2)', padding: '4px 12px', background: 'transparent', transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--paper)'; e.currentTarget.style.borderColor = 'var(--paper)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--rule2)'; }}>
            Arrange
          </button>
          <button onClick={() => setShowSettings(true)}
            style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', cursor: 'pointer', border: '1px solid var(--rule2)', padding: '4px 12px', background: 'transparent', transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--paper)'; e.currentTarget.style.borderColor = 'var(--paper)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--rule2)'; }}>
            Configure
          </button>
        </div>
      </header>

      {/* Clock */}
      <div className="rise-1"><ClockWidget userName={settings.userName} /></div>

      {/* Widget grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 280px', flex: 1, borderBottom: '1px solid var(--rule)' }} className="rise-2">
        {cols.map((colWidgets, ci) => (
          <div key={ci} style={{ ...colStyle, borderRight: ci < 2 ? '1px solid var(--rule)' : 'none' }}>
            {colWidgets.map(w => (
              <div key={w.id}
                draggable={editMode}
                onDragStart={() => onDragStart(w.id)}
                onDragOver={e => e.preventDefault()}
                onDrop={() => onDrop(w.id, w.col, w.order)}
                style={{ position: 'relative', opacity: editMode ? 0.9 : 1, outline: editMode ? '1px dashed var(--rule2)' : 'none', padding: editMode ? '12px' : '0', transition: 'all .2s', cursor: editMode ? 'grab' : 'default' }}>
                <div style={handleStyle}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="3.5" cy="3" r="1" fill="currentColor"/>
                    <circle cx="8.5" cy="3" r="1" fill="currentColor"/>
                    <circle cx="3.5" cy="6" r="1" fill="currentColor"/>
                    <circle cx="8.5" cy="6" r="1" fill="currentColor"/>
                    <circle cx="3.5" cy="9" r="1" fill="currentColor"/>
                    <circle cx="8.5" cy="9" r="1" fill="currentColor"/>
                  </svg>
                </div>
                {renderWidget(w.id)}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 36px', borderTop: '1px solid var(--rule)', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>HexBrief v1.0.0 · Open source · No tracking · No accounts</span>
        <a href="https://github.com/happygream/hexbrief" target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>GitHub</a>
      </footer>

      {/* Settings modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          widgets={widgets}
          onClose={() => setShowSettings(false)}
          onSave={load}
          onWidgetChange={persistWidgets}
          onResetOnboarding={() => { resetOnboarding(); load(); setShowSettings(false); }}
          tab={settingsTab}
          setTab={setSettingsTab}
        />
      )}
    </div>
  );
}

const PRESETS = [
  { id: 'bbc',      name: 'BBC News',     url: 'https://feeds.bbci.co.uk/news/rss.xml',       cat: 'News' },
  { id: 'hn',       name: 'Hacker News',  url: 'https://hnrss.org/frontpage',                 cat: 'Tech' },
  { id: 'guardian', name: 'The Guardian', url: 'https://www.theguardian.com/uk/rss',           cat: 'News' },
  { id: 'register', name: 'The Register', url: 'https://www.theregister.com/headlines.atom',   cat: 'Tech' },
  { id: 'tc',       name: 'TechCrunch',   url: 'https://techcrunch.com/feed/',                cat: 'Tech' },
  { id: 'wired',    name: 'Wired',        url: 'https://www.wired.com/feed/rss',              cat: 'Tech' },
  { id: 'reuters',  name: 'Reuters',      url: 'https://feeds.reuters.com/reuters/topNews',    cat: 'News' },
  { id: 'ft',       name: 'FT',           url: 'https://www.ft.com/rss/home',                 cat: 'Finance' },
];

const ALL_WIDGETS = [
  { id: 'weather',  name: 'Conditions', desc: 'Live weather for your location' },
  { id: 'focus',    name: 'Intention',  desc: 'Daily focus, resets each morning' },
  { id: 'calendar', name: 'Schedule',   desc: "Today's events from iCal" },
  { id: 'tasks',    name: 'Tasks',      desc: 'To-do list with progress bar' },
  { id: 'news',     name: 'Headlines',  desc: 'Top stories from your RSS feeds' },
];

function CheckSVG() {
  return <svg width="7" height="5" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="#f4f5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function SettingsModal({ settings, widgets, onClose, onSave, onWidgetChange, onResetOnboarding, tab, setTab }: {
  settings: Settings; widgets: { id: string; name: string; col: number; order: number; visible: boolean }[];
  onClose: () => void; onSave: () => void;
  onWidgetChange: (w: { id: string; name: string; col: number; order: number; visible: boolean }[]) => void;
  onResetOnboarding: () => void;
  tab: string; setTab: (t: string) => void;
}) {
  const [s, setS] = useState({ ...settings });
  const [feedInput, setFeedInput] = useState('');
  const [localWidgets, setLocalWidgets] = useState([...widgets]);

  const TABS = ['profile', 'weather', 'news', 'calendar', 'widgets'];

  function save() { saveSettings(s); onSave(); onClose(); }

  function togglePreset(url: string) {
    setS(prev => ({
      ...prev,
      newsFeeds: prev.newsFeeds.includes(url) ? prev.newsFeeds.filter(f => f !== url) : [...prev.newsFeeds, url]
    }));
  }

  function addCustomFeed() {
    if (!feedInput.trim()) return;
    setS(prev => ({ ...prev, newsFeeds: [...prev.newsFeeds, feedInput.trim()] }));
    setFeedInput('');
  }

  function toggleWidget(id: string) {
    setLocalWidgets(prev => prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
  }

  function changeCol(id: string, col: number) {
    setLocalWidgets(prev => {
      const updated = prev.map(w => w.id === id ? { ...w, col } : w);
      const reindexed = [...updated].sort((a, b) => a.order - b.order);
      const counters = [0, 0, 0];
      return reindexed.map(w => ({ ...w, order: counters[w.col]++ }));
    });
  }

  function applyLayout() {
    onWidgetChange(localWidgets);
    save();
  }

  const mono: React.CSSProperties = { fontFamily: 'JetBrains Mono, monospace' };
  const label: React.CSSProperties = { ...mono, fontSize: 9, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 };
  const hint: React.CSSProperties = { ...mono, fontSize: 9, color: 'var(--dim)', letterSpacing: '0.06em', marginTop: 4 };
  const field: React.CSSProperties = { marginBottom: 16 };
  const saveBtnStyle: React.CSSProperties = { width: '100%', background: 'var(--red)', border: 'none', color: 'var(--paper)', fontFamily: 'Bebas Neue, sans-serif', fontSize: 15, letterSpacing: '0.18em', padding: 13, cursor: 'pointer', marginTop: 8 };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,8,18,0.92)', backdropFilter: 'blur(12px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'var(--ink2)', border: '1px solid var(--rule2)', borderTop: '2px solid var(--red)', width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 28px 18px', borderBottom: '1px solid var(--rule)', position: 'sticky', top: 0, background: 'var(--ink2)', zIndex: 10 }}>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, letterSpacing: '0.12em', color: 'var(--paper)' }}>Configure</span>
          <button onClick={onClose} style={{ ...mono, fontSize: 10, color: 'var(--muted)', letterSpacing: '0.14em', textTransform: 'uppercase', background: 'none', border: '1px solid var(--rule2)', padding: '5px 12px', cursor: 'pointer' }}>Close</button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--rule)', padding: '0 28px', overflowX: 'auto' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ ...mono, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: tab === t ? 'var(--paper)' : 'var(--muted)', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t ? 'var(--red)' : 'transparent'}`, padding: '12px 0', marginRight: 22, cursor: 'pointer', whiteSpace: 'nowrap' }}>{t}</button>
          ))}
        </div>

        <div style={{ padding: '24px 28px' }}>

          {tab === 'profile' && (
            <div>
              <div style={field}>
                <div style={label}>Your name</div>
                <input type="text" value={s.userName} onChange={e => setS({ ...s, userName: e.target.value })} placeholder="e.g. Mike" />
              </div>
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--rule)' }}>
                <div style={{ ...mono, fontSize: 9, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Reset</div>
                <button onClick={onResetOnboarding} style={{ ...mono, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'transparent', border: '1px solid var(--rule2)', color: 'var(--muted)', padding: '8px 14px', cursor: 'pointer', width: '100%' }}>
                  Show news source picker again
                </button>
                <div style={{ ...hint, marginTop: 6 }}>Clears your saved news sources and shows the first-launch picker</div>
              </div>
              <button onClick={save} style={saveBtnStyle}>Save</button>
            </div>
          )}

          {tab === 'weather' && (
            <div>
              <div style={{ ...mono, fontSize: 11, color: 'var(--muted)', letterSpacing: '0.06em', marginBottom: 16, lineHeight: 1.7, background: 'var(--ink3)', padding: '10px 14px', border: '1px solid var(--rule)' }}>
                Weather uses Open-Meteo — no API key needed. Leave city blank to auto-detect from your IP.
              </div>
              <div style={field}>
                <div style={label}>City (optional)</div>
                <input type="text" value={s.weatherCity} onChange={e => setS({ ...s, weatherCity: e.target.value })} placeholder="e.g. London" />
                <div style={hint}>Leave blank to use your current location</div>
              </div>
              <button onClick={save} style={saveBtnStyle}>Save</button>
            </div>
          )}

          {tab === 'news' && (
            <div>
              <div style={{ ...mono, fontSize: 9, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Preset sources</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 20 }}>
                {PRESETS.map(p => {
                  const on = s.newsFeeds.includes(p.url);
                  return (
                    <div key={p.id} onClick={() => togglePreset(p.url)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: on ? 'rgba(232,65,42,0.06)' : 'transparent', border: `1px solid ${on ? 'var(--red)' : 'var(--rule)'}`, cursor: 'pointer', transition: 'all .15s' }}>
                      <div style={{ width: 13, height: 13, border: `1px solid ${on ? 'var(--red)' : 'var(--rule2)'}`, background: on ? 'var(--red)' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {on && <CheckSVG />}
                      </div>
                      <span style={{ ...mono, fontSize: 12, color: 'var(--paper)', flex: 1 }}>{p.name}</span>
                      <span style={{ ...mono, fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{p.cat}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ ...label, marginBottom: 10 }}>Custom RSS feed</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input type="url" value={feedInput} onChange={e => setFeedInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomFeed()} placeholder="https://example.com/feed.rss" />
                <button onClick={addCustomFeed} style={{ ...mono, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(232,65,42,0.1)', border: '1px solid rgba(232,65,42,0.3)', color: 'var(--red)', padding: '0 14px', cursor: 'pointer', flexShrink: 0 }}>Add</button>
              </div>
              {s.newsFeeds.filter(f => !PRESETS.map(p => p.url).includes(f)).map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'var(--ink3)', border: '1px solid var(--rule)', marginBottom: 4 }}>
                  <span style={{ ...mono, fontSize: 10, color: 'var(--muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f}</span>
                  <button onClick={() => setS(prev => ({ ...prev, newsFeeds: prev.newsFeeds.filter(x => x !== f) }))} style={{ ...mono, fontSize: 10, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px' }}>Remove</button>
                </div>
              ))}
              <button onClick={save} style={saveBtnStyle}>Save</button>
            </div>
          )}

          {tab === 'calendar' && (
            <div>
              <div style={field}>
                <div style={label}>iCal URL</div>
                <input type="url" value={s.icalUrl} onChange={e => setS({ ...s, icalUrl: e.target.value })} placeholder="webcal://... or https://..." />
                <div style={hint}>Google Calendar: Settings → Integrations → iCal address</div>
              </div>
              <button onClick={save} style={saveBtnStyle}>Save</button>
            </div>
          )}

          {tab === 'widgets' && (
            <div>
              <div style={{ ...mono, fontSize: 9, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>Toggle and assign columns</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
                {ALL_WIDGETS.map(aw => {
                  const w = localWidgets.find(x => x.id === aw.id);
                  const on = w?.visible !== false;
                  return (
                    <div key={aw.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: on ? 'rgba(232,65,42,0.04)' : 'var(--ink3)', border: `1px solid ${on ? 'var(--red)' : 'var(--rule)'}`, transition: 'all .15s' }}>
                      <div onClick={() => toggleWidget(aw.id)} style={{ width: 13, height: 13, border: `1px solid ${on ? 'var(--red)' : 'var(--rule2)'}`, background: on ? 'var(--red)' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        {on && <CheckSVG />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ ...mono, fontSize: 12, color: 'var(--paper)' }}>{aw.name}</div>
                        <div style={{ ...mono, fontSize: 9, color: 'var(--muted)', marginTop: 2 }}>{aw.desc}</div>
                      </div>
                      <select
                        value={w?.col ?? 0}
                        onChange={e => changeCol(aw.id, parseInt(e.target.value))}
                        style={{ ...mono, fontSize: 10, background: 'var(--ink)', border: '1px solid var(--rule2)', color: 'var(--muted)', padding: '3px 8px', cursor: 'pointer', width: 'auto', letterSpacing: '0.06em' }}>
                        <option value={0}>Left</option>
                        <option value={1}>Centre</option>
                        <option value={2}>Right</option>
                      </select>
                    </div>
                  );
                })}
              </div>
              <button onClick={applyLayout} style={saveBtnStyle}>Apply layout</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
