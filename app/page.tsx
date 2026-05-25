'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import ClockWidget from './components/ClockWidget';
import WeatherWidget from './components/WeatherWidget';
import FocusWidget from './components/FocusWidget';
import TasksWidget from './components/TasksWidget';
import NewsWidget from './components/NewsWidget';
import CalendarWidget from './components/CalendarWidget';
import BookmarksWidget from './components/BookmarksWidget';
import NotesWidget from './components/NotesWidget';
import HabitsWidget from './components/HabitsWidget';
import CountdownWidget from './components/CountdownWidget';
import FinanceWidget from './components/FinanceWidget';
import InboxWidget from './components/InboxWidget';
import Onboarding from './components/Onboarding';
import { getSettings, saveSettings, resetOnboarding, resetWidgets } from './lib/storage';
import type { Task } from './lib/storage';
import { getTasks } from './lib/storage';
import type { Settings } from './lib/storage';

const DAYS_S = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS_S = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

interface WidgetDef { id: string; name: string; col: number; order: number; visible: boolean; }

const DEFAULT_WIDGETS: WidgetDef[] = [
  { id: 'weather',   name: 'Conditions',   col: 0, order: 0, visible: true },
  { id: 'focus',     name: 'Intention',    col: 0, order: 1, visible: true },
  { id: 'calendar',  name: 'Schedule',     col: 0, order: 2, visible: true },
  { id: 'tasks',     name: 'Tasks',        col: 1, order: 0, visible: true },
  { id: 'news',      name: 'Headlines',    col: 2, order: 0, visible: true },
  // New widgets — off by default, user enables via Configure → Widgets
  { id: 'inbox',     name: 'Quick capture',col: 1, order: 1, visible: false },
  { id: 'habits',    name: 'Habits',       col: 0, order: 3, visible: false },
  { id: 'countdown', name: 'Countdowns',   col: 1, order: 2, visible: false },
  { id: 'finance',   name: 'Finance',      col: 2, order: 1, visible: false },
  { id: 'bookmarks', name: 'Bookmarks',    col: 2, order: 2, visible: false },
  { id: 'notes',     name: 'Notes',        col: 1, order: 3, visible: false },
];

function getWidgets(): WidgetDef[] {
  if (typeof window === 'undefined') return DEFAULT_WIDGETS;
  try {
    const raw = localStorage.getItem('hexbrief_widgets');
    if (!raw) return DEFAULT_WIDGETS;
    const saved: WidgetDef[] = JSON.parse(raw);
    // Merge — add any new widgets that don't exist in saved state
    const savedIds = new Set(saved.map(w => w.id));
    const newWidgets = DEFAULT_WIDGETS.filter(w => !savedIds.has(w.id));
    return [...saved, ...newWidgets];
  } catch { return DEFAULT_WIDGETS; }
}

function saveWidgets(w: WidgetDef[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('hexbrief_widgets', JSON.stringify(w));
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
  { id: 'weather',   name: 'Conditions',     desc: 'Live weather for your location' },
  { id: 'focus',     name: 'Intention',       desc: 'Daily focus, resets each morning' },
  { id: 'calendar',  name: 'Schedule',        desc: "Today's events from iCal" },
  { id: 'tasks',     name: 'Tasks',           desc: 'To-do list with Pomodoro timer' },
  { id: 'news',      name: 'Headlines',       desc: 'Top stories from your RSS feeds' },
  { id: 'bookmarks', name: 'Bookmarks',       desc: 'Quick-access links with favicons' },
  { id: 'notes',     name: 'Notes',           desc: 'Freeform persistent notepad' },
  { id: 'habits',    name: 'Habits',          desc: 'Daily habit tracker with streaks' },
  { id: 'countdown', name: 'Countdowns',      desc: 'Days until payday, weekend, events' },
  { id: 'finance',   name: 'Finance',         desc: 'FX rates and crypto prices' },
  { id: 'inbox',     name: 'Quick capture',   desc: 'Dump ideas, promote to tasks later' },
];

function CheckSVG() {
  return <svg width="7" height="5" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="#f4f5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

export default function Home() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [widgets, setWidgets] = useState<WidgetDef[]>(DEFAULT_WIDGETS);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [liveTasks, setLiveTasks] = useState<Task[]>([]);
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

  const cols: WidgetDef[][] = [[], [], []];
  widgets.filter(w => w.visible).sort((a, b) => a.order - b.order).forEach(w => {
    if (cols[w.col]) cols[w.col].push(w);
  });

  function renderWidget(id: string) {
    switch (id) {
      case 'weather':    return <WeatherWidget city={settings!.weatherCity} lat={settings!.weatherLat} lon={settings!.weatherLon} />;
      case 'focus':      return <FocusWidget />;
      case 'calendar':   return <CalendarWidget icalUrl={settings!.icalUrl} />;
      case 'tasks':      return <TasksWidget onTasksChange={t => setLiveTasks(t)} />;
      case 'news':       return <NewsWidget feeds={settings!.newsFeeds} />;
      case 'bookmarks':  return <BookmarksWidget />;
      case 'notes':      return <NotesWidget />;
      case 'habits':     return <HabitsWidget />;
      case 'countdown':  return <CountdownWidget />;
      case 'finance':    return <FinanceWidget />;
      case 'inbox':      return <InboxWidget />;
      default: return null;
    }
  }

  function moveWidget(srcId: string, destCol: number, destOrder: number) {
    setWidgets(prev => {
      const next = prev.map(w => {
        if (w.id === srcId) return { ...w, col: destCol, order: destOrder - 0.5 };
        return w;
      });
      const sorted = [...next].sort((a, b) => a.order - b.order);
      const counters = [0, 0, 0];
      return sorted.map(w => ({ ...w, order: counters[w.col]++ }));
    });
  }

  function persistWidgets(w: WidgetDef[]) { setWidgets(w); saveWidgets(w); }

  function finishEdit() {
    persistWidgets(widgets);
    setEditMode(false);
  }

  const mono: React.CSSProperties = { fontFamily: 'JetBrains Mono, monospace' };

  const colBase: React.CSSProperties = {
    padding: '26px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: 28,
    minWidth: 0,
    transition: 'background .15s',
  };

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {editMode && (
        <div style={{ background: 'var(--red)', padding: '9px 36px', ...mono, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--paper)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Drag widgets to rearrange — drop onto a column or another widget</span>
          <button onClick={finishEdit} style={{ ...mono, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'transparent', border: '1px solid rgba(255,255,255,0.6)', color: 'var(--paper)', padding: '4px 14px', cursor: 'pointer' }}>Done</button>
        </div>
      )}

      <header style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '16px 36px', borderBottom: '2px solid var(--paper)', gap: 16 }} className="rise">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ ...mono, fontSize: 11, letterSpacing: '0.14em', color: 'var(--muted)', textTransform: 'uppercase', border: '1px solid var(--rule2)', padding: '3px 8px' }}>Morning Brief</span>
          <span style={{ ...mono, fontSize: 11, letterSpacing: '0.08em', color: 'var(--muted)', textTransform: 'uppercase' }}>{mastDate}</span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 26, letterSpacing: '0.18em', color: 'var(--paper)', lineHeight: 1 }}>
            HEX<span style={{ color: 'var(--red)' }}>B</span>RIEF
          </div>
          <div style={{ ...mono, fontSize: 10, letterSpacing: '0.16em', color: 'var(--muted)', textTransform: 'uppercase', marginTop: 2 }}>Personal daily dispatch</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', animation: 'pulse-red 2s infinite', flexShrink: 0 }} />
          {[{ label: 'Arrange', action: () => setEditMode(true) }, { label: 'Configure', action: () => setShowSettings(true) }].map(btn => (
            <button key={btn.label} onClick={btn.action}
              style={{ ...mono, fontSize: 11, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', cursor: 'pointer', border: '1px solid var(--rule2)', padding: '4px 12px', background: 'transparent', transition: 'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--paper)'; e.currentTarget.style.borderColor = 'var(--paper)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--rule2)'; }}>
              {btn.label}
            </button>
          ))}
        </div>
      </header>

      <div className="rise-1"><ClockWidget userName={settings.userName} tasks={liveTasks} /></div>

      {/* Widget grid — columns are also drop targets */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 280px', flex: 1, borderBottom: '1px solid var(--rule)' }} className="rise-2">
        {cols.map((colWidgets, ci) => (
          <div key={ci}
            style={{
              ...colBase,
              borderRight: ci < 2 ? '1px solid var(--rule)' : 'none',
              background: dragOver === `col-${ci}` ? 'rgba(232,65,42,0.04)' : 'transparent',
            }}
            onDragOver={e => { e.preventDefault(); setDragOver(`col-${ci}`); }}
            onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(null); }}
            onDrop={e => {
              e.preventDefault();
              setDragOver(null);
              if (dragSrc.current) {
                // Drop on empty column or at end
                const maxOrder = colWidgets.length;
                moveWidget(dragSrc.current, ci, maxOrder + 1);
                dragSrc.current = null;
              }
            }}>
            {colWidgets.map((w, wi) => (
              <div key={w.id}
                draggable={editMode}
                onDragStart={e => { dragSrc.current = w.id; e.dataTransfer.effectAllowed = 'move'; }}
                onDragEnd={() => { dragSrc.current = null; setDragOver(null); }}
                onDragOver={e => { e.preventDefault(); e.stopPropagation(); setDragOver(w.id); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOver(null);
                  if (dragSrc.current && dragSrc.current !== w.id) {
                    moveWidget(dragSrc.current, w.col, w.order);
                    dragSrc.current = null;
                  }
                }}
                style={{
                  position: 'relative',
                  outline: dragOver === w.id ? '1px dashed var(--red)' : editMode ? '1px dashed var(--rule2)' : 'none',
                  padding: editMode ? '10px' : '0',
                  transition: 'all .15s',
                  cursor: editMode ? 'grab' : 'default',
                  background: dragOver === w.id ? 'rgba(232,65,42,0.04)' : 'transparent',
                }}>
                {editMode && (
                  <div style={{ position: 'absolute', top: 6, right: 6, zIndex: 10, background: 'var(--ink2)', border: '1px solid var(--rule)', padding: 3, cursor: 'grab', color: 'var(--muted)', display: 'flex' }}>
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <circle cx="3.5" cy="3" r="1" fill="currentColor"/>
                      <circle cx="8.5" cy="3" r="1" fill="currentColor"/>
                      <circle cx="3.5" cy="6" r="1" fill="currentColor"/>
                      <circle cx="8.5" cy="6" r="1" fill="currentColor"/>
                      <circle cx="3.5" cy="9" r="1" fill="currentColor"/>
                      <circle cx="8.5" cy="9" r="1" fill="currentColor"/>
                    </svg>
                  </div>
                )}
                {renderWidget(w.id)}
              </div>
            ))}

            {/* Empty column drop zone */}
            {colWidgets.length === 0 && (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', ...mono, fontSize: 9, color: 'var(--dim)', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: editMode ? 1 : 0 }}>
                Drop here
              </div>
            )}
          </div>
        ))}
      </div>

      <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 36px', borderTop: '1px solid var(--rule)', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ ...mono, fontSize: 11, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>HexBrief v1.0.0 · Open source · No tracking · No accounts</span>
        <a href="https://github.com/happygream/hexbrief" target="_blank" rel="noopener noreferrer" style={{ ...mono, fontSize: 11, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>GitHub</a>
      </footer>

      {showSettings && (
        <SettingsModal settings={settings} widgets={widgets} onClose={() => setShowSettings(false)} onSave={load}
          onWidgetChange={persistWidgets}
          onResetOnboarding={() => { resetOnboarding(); load(); setShowSettings(false); }}
          onResetLayout={() => { resetWidgets(); load(); setShowSettings(false); }}
          tab={settingsTab} setTab={setSettingsTab} />
      )}
    </div>
  );
}

function SettingsModal({ settings, widgets, onClose, onSave, onWidgetChange, onResetOnboarding, onResetLayout, tab, setTab }: {
  settings: Settings;
  widgets: WidgetDef[];
  onClose: () => void; onSave: () => void;
  onWidgetChange: (w: WidgetDef[]) => void;
  onResetOnboarding: () => void;
  onResetLayout: () => void;
  tab: string; setTab: (t: string) => void;
}) {
  const [s, setS] = useState({ ...settings });
  const [feedInput, setFeedInput] = useState('');
  const [localWidgets, setLocalWidgets] = useState([...widgets]);
  const mono: React.CSSProperties = { fontFamily: 'JetBrains Mono, monospace' };
  const label: React.CSSProperties = { ...mono, fontSize: 9, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 };
  const hint: React.CSSProperties = { ...mono, fontSize: 9, color: 'var(--dim)', letterSpacing: '0.06em', marginTop: 4 };
  const saveBtn: React.CSSProperties = { width: '100%', background: 'var(--red)', border: 'none', color: 'var(--paper)', fontFamily: 'Bebas Neue, sans-serif', fontSize: 15, letterSpacing: '0.18em', padding: 13, cursor: 'pointer', marginTop: 8 };

  function save() { saveSettings(s); onSave(); onClose(); }
  function togglePreset(url: string) {
    setS(prev => ({ ...prev, newsFeeds: prev.newsFeeds.includes(url) ? prev.newsFeeds.filter(f => f !== url) : [...prev.newsFeeds, url] }));
  }
  function addFeed() {
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
      const sorted = [...updated].sort((a, b) => a.order - b.order);
      const c = [0, 0, 0];
      return sorted.map(w => ({ ...w, order: c[w.col]++ }));
    });
  }
  function applyLayout() { onWidgetChange(localWidgets); save(); }

  const TABS = ['profile', 'weather', 'news', 'calendar', 'widgets'];

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
              <div style={{ marginBottom: 16 }}>
                <div style={label}>Your name</div>
                <input type="text" value={s.userName} onChange={e => setS({ ...s, userName: e.target.value })} placeholder="e.g. Mike" />
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={label}>Launch on startup</div>
                <div onClick={() => {
                    const next = !s.autoStart;
                    setS({ ...s, autoStart: next });
                    if (typeof window !== 'undefined' && (window as any).electronAPI?.setAutoStart) {
                      (window as any).electronAPI.setAutoStart(next);
                    }
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: s.autoStart ? 'rgba(232,65,42,0.06)' : 'var(--ink3)', border: `1px solid ${s.autoStart ? 'var(--red)' : 'var(--rule)'}`, cursor: 'pointer', transition: 'all .15s' }}>
                  <div style={{ width: 32, height: 18, borderRadius: 9, background: s.autoStart ? 'var(--red)' : 'var(--rule2)', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', top: 2, left: s.autoStart ? 16 : 2, width: 14, height: 14, borderRadius: '50%', background: 'var(--paper)', transition: 'left .2s' }} />
                  </div>
                  <span style={{ ...mono, fontSize: 12, color: 'var(--paper)' }}>Start HexBrief when Windows starts</span>
                </div>
              </div>
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--rule)' }}>
                <div style={label}>Reset</div>
                <button onClick={onResetOnboarding} style={{ ...mono, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'transparent', border: '1px solid var(--rule2)', color: 'var(--muted)', padding: '8px 14px', cursor: 'pointer', width: '100%' }}>
                  Show news source picker again
                </button>
                <div style={{ ...hint, marginTop: 6 }}>Clears saved news sources and shows the first-launch picker</div>
              </div>
              <button onClick={save} style={saveBtn}>Save</button>
            </div>
          )}

          {tab === 'weather' && (
            <div>
              <div style={{ ...mono, fontSize: 11, color: 'var(--muted)', letterSpacing: '0.06em', marginBottom: 16, lineHeight: 1.7, background: 'var(--ink3)', padding: '10px 14px', border: '1px solid var(--rule)' }}>
                Uses Open-Meteo — no API key needed. Leave blank to auto-detect location from IP.
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={label}>City (optional)</div>
                <input type="text" value={s.weatherCity} onChange={e => setS({ ...s, weatherCity: e.target.value })} placeholder="e.g. London" />
                <div style={hint}>Leave blank for automatic location</div>
              </div>
              <button onClick={save} style={saveBtn}>Save</button>
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
              <div style={{ ...label, marginBottom: 8 }}>Custom RSS feed</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input type="url" value={feedInput} onChange={e => setFeedInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addFeed()} placeholder="https://example.com/feed.rss" />
                <button onClick={addFeed} style={{ ...mono, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(232,65,42,0.1)', border: '1px solid rgba(232,65,42,0.3)', color: 'var(--red)', padding: '0 14px', cursor: 'pointer', flexShrink: 0 }}>Add</button>
              </div>
              {s.newsFeeds.filter(f => !PRESETS.map(p => p.url).includes(f)).map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'var(--ink3)', border: '1px solid var(--rule)', marginBottom: 4 }}>
                  <span style={{ ...mono, fontSize: 10, color: 'var(--muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f}</span>
                  <button onClick={() => setS(prev => ({ ...prev, newsFeeds: prev.newsFeeds.filter(x => x !== f) }))} style={{ ...mono, fontSize: 10, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                </div>
              ))}
              <button onClick={save} style={saveBtn}>Save</button>
            </div>
          )}

          {tab === 'calendar' && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <div style={label}>iCal URL</div>
                <input type="url" value={s.icalUrl} onChange={e => setS({ ...s, icalUrl: e.target.value })} placeholder="webcal://... or https://..." />
                <div style={hint}>Google Calendar: Settings → Integrations → iCal address</div>
              </div>
              <button onClick={save} style={saveBtn}>Save</button>
            </div>
          )}

          {tab === 'widgets' && (
            <div>
              <div style={{ ...mono, fontSize: 9, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>Toggle widgets and assign columns</div>
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
                      <select value={w?.col ?? 0} onChange={e => changeCol(aw.id, parseInt(e.target.value))}
                        style={{ ...mono, fontSize: 10, background: 'var(--ink)', border: '1px solid var(--rule2)', color: 'var(--muted)', padding: '3px 8px', cursor: 'pointer', width: 'auto' }}>
                        <option value={0}>Left</option>
                        <option value={1}>Centre</option>
                        <option value={2}>Right</option>
                      </select>
                    </div>
                  );
                })}
              </div>
              <button onClick={applyLayout} style={saveBtn}>Apply layout</button>
              <button onClick={onResetLayout} style={{ ...saveBtn, background: 'transparent', border: '1px solid var(--rule2)', color: 'var(--muted)', marginTop: 8, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.12em' }}>Reset to default layout</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
