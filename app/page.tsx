'use client';
import { useState, useEffect, useCallback } from 'react';
import ClockWidget from './components/ClockWidget';
import WeatherWidget from './components/WeatherWidget';
import FocusWidget from './components/FocusWidget';
import TasksWidget from './components/TasksWidget';
import NewsWidget from './components/NewsWidget';
import CalendarWidget from './components/CalendarWidget';
import Onboarding from './components/Onboarding';
import { getSettings, saveSettings } from './lib/storage';
import type { Settings } from './lib/storage';

const DAYS_S = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS_S = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Home() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState('profile');
  const [now, setNow] = useState<Date | null>(null);

  const load = useCallback(() => setSettings(getSettings()), []);

  useEffect(() => {
    load();
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, [load]);

  if (!settings) return null;
  if (!settings.onboardingDone) return <Onboarding onDone={load} />;

  const mastDate = now ? `${DAYS_S[now.getDay()]} ${now.getDate()} ${MONTHS_S[now.getMonth()]} ${now.getFullYear()}` : '';

  // col padding style
  const col: React.CSSProperties = { padding: '26px 30px', borderRight: '1px solid var(--rule)', display: 'flex', flexDirection: 'column', gap: 28 };

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Masthead */}
      <header style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '16px 36px', borderBottom: '2px solid var(--paper)', gap: 16 }} className="rise">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.14em', color: 'var(--muted)', textTransform: 'uppercase', border: '1px solid var(--rule2)', padding: '3px 8px' }}>Morning Brief</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase' }}>{mastDate}</span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 26, letterSpacing: '0.18em', color: 'var(--paper)', lineHeight: 1 }}>
            HEX<span style={{ color: 'var(--red)' }}>B</span>RIEF
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.16em', color: 'var(--muted)', textTransform: 'uppercase', marginTop: 2 }}>Personal daily dispatch</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', animation: 'pulse-red 2s infinite', flexShrink: 0 }} />
          <button onClick={() => setShowSettings(true)} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', cursor: 'pointer', border: '1px solid var(--rule2)', padding: '4px 12px', background: 'transparent', transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--paper)'; e.currentTarget.style.borderColor = 'var(--paper)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--rule2)'; }}>
            Configure
          </button>
        </div>
      </header>

      {/* Clock */}
      <div className="rise-1"><ClockWidget userName={settings.userName} /></div>

      {/* Body */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 280px', flex: 1, borderBottom: '1px solid var(--rule)' }} className="rise-2">
        <div style={col}>
          <WeatherWidget city={settings.weatherCity} />
          <FocusWidget />
          <CalendarWidget icalUrl={settings.icalUrl} />
        </div>
        <div style={{ ...col, borderRight: '1px solid var(--rule)' }}>
          <TasksWidget />
        </div>
        <div style={{ ...col, borderRight: 'none' }}>
          <NewsWidget feeds={settings.newsFeeds} />
        </div>
      </div>

      {/* Footer */}
      <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 36px', borderTop: '1px solid var(--rule)', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>HexBrief v1.0.0 · Open source · No tracking · No accounts</span>
        <a href="https://github.com/happygream/hexbrief" target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>GitHub</a>
      </footer>

      {/* Settings modal */}
      {showSettings && (
        <SettingsModal settings={settings} onClose={() => setShowSettings(false)} onSave={load} tab={settingsTab} setTab={setSettingsTab} />
      )}
    </div>
  );
}

function SettingsModal({ settings, onClose, onSave, tab, setTab }: {
  settings: Settings; onClose: () => void; onSave: () => void;
  tab: string; setTab: (t: string) => void;
}) {
  const [s, setS] = useState({ ...settings });
  const [feedInput, setFeedInput] = useState('');

  const TABS = ['profile', 'weather', 'news', 'calendar'];

  function save() {
    saveSettings(s);
    onSave();
    onClose();
  }

  const PRESETS = [
    { id: 'bbc',      name: 'BBC News',     url: 'https://feeds.bbci.co.uk/news/rss.xml',         cat: 'News' },
    { id: 'hn',       name: 'Hacker News',  url: 'https://hnrss.org/frontpage',                   cat: 'Tech' },
    { id: 'guardian', name: 'The Guardian', url: 'https://www.theguardian.com/uk/rss',             cat: 'News' },
    { id: 'register', name: 'The Register', url: 'https://www.theregister.com/headlines.atom',     cat: 'Tech' },
    { id: 'tc',       name: 'TechCrunch',   url: 'https://techcrunch.com/feed/',                  cat: 'Tech' },
    { id: 'wired',    name: 'Wired',        url: 'https://www.wired.com/feed/rss',                cat: 'Tech' },
    { id: 'reuters',  name: 'Reuters',      url: 'https://feeds.reuters.com/reuters/topNews',      cat: 'News' },
    { id: 'ft',       name: 'FT',           url: 'https://www.ft.com/rss/home',                   cat: 'Finance' },
  ];

  function togglePreset(url: string) {
    setS(prev => ({
      ...prev,
      newsFeeds: prev.newsFeeds.includes(url)
        ? prev.newsFeeds.filter(f => f !== url)
        : [...prev.newsFeeds, url]
    }));
  }

  function addCustomFeed() {
    if (!feedInput.trim()) return;
    setS(prev => ({ ...prev, newsFeeds: [...prev.newsFeeds, feedInput.trim()] }));
    setFeedInput('');
  }

  const label: React.CSSProperties = { fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 };
  const field: React.CSSProperties = { marginBottom: 14 };
  const hint: React.CSSProperties = { fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: 'var(--dim)', letterSpacing: '0.06em', marginTop: 4 };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,8,18,0.9)', backdropFilter: 'blur(12px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'var(--ink2)', border: '1px solid var(--rule2)', borderTop: '2px solid var(--red)', width: '100%', maxWidth: 520, maxHeight: '88vh', overflowY: 'auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 28px 18px', borderBottom: '1px solid var(--rule)', position: 'sticky', top: 0, background: 'var(--ink2)', zIndex: 10 }}>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, letterSpacing: '0.12em', color: 'var(--paper)' }}>Configure</span>
          <button onClick={onClose} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.14em', textTransform: 'uppercase', background: 'none', border: '1px solid var(--rule2)', padding: '5px 12px', cursor: 'pointer' }}>Close</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--rule)', padding: '0 28px' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: tab === t ? 'var(--paper)' : 'var(--muted)', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t ? 'var(--red)' : 'transparent'}`, padding: '12px 0', marginRight: 24, cursor: 'pointer' }}>{t}</button>
          ))}
        </div>

        <div style={{ padding: '24px 28px' }}>
          {tab === 'profile' && (
            <div>
              <div style={field}>
                <div style={label}>Your name</div>
                <input type="text" value={s.userName} onChange={e => setS({ ...s, userName: e.target.value })} placeholder="e.g. Mike" />
              </div>
            </div>
          )}

          {tab === 'weather' && (
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 16, lineHeight: 1.6 }}>
                Weather uses Open-Meteo — no API key needed. Leave city blank to auto-detect from your IP.
              </div>
              <div style={field}>
                <div style={label}>City (optional)</div>
                <input type="text" value={s.weatherCity} onChange={e => setS({ ...s, weatherCity: e.target.value })} placeholder="e.g. London (leave blank for auto)" />
                <div style={hint}>Auto-detection uses your IP address to find your location</div>
              </div>
            </div>
          )}

          {tab === 'news' && (
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Preset sources</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 20 }}>
                {PRESETS.map(p => {
                  const on = s.newsFeeds.includes(p.url);
                  return (
                    <div key={p.id} onClick={() => togglePreset(p.url)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: on ? 'rgba(232,65,42,0.06)' : 'transparent', border: `1px solid ${on ? 'var(--red)' : 'var(--rule)'}`, cursor: 'pointer', transition: 'all .15s' }}>
                      <div style={{ width: 12, height: 12, border: `1px solid ${on ? 'var(--red)' : 'var(--rule2)'}`, background: on ? 'var(--red)' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {on && <svg width="7" height="5" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="#f2f3f8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--paper)', flex: 1 }}>{p.name}</span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{p.cat}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Add custom RSS feed</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="url" value={feedInput} onChange={e => setFeedInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomFeed()} placeholder="https://example.com/feed.rss" />
                <button onClick={addCustomFeed} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(232,65,42,0.1)', border: '1px solid rgba(232,65,42,0.3)', color: 'var(--red)', padding: '0 14px', cursor: 'pointer', flexShrink: 0 }}>Add</button>
              </div>
            </div>
          )}

          {tab === 'calendar' && (
            <div>
              <div style={field}>
                <div style={label}>iCal URL</div>
                <input type="url" value={s.icalUrl} onChange={e => setS({ ...s, icalUrl: e.target.value })} placeholder="webcal://... or https://..." />
                <div style={hint}>Google: Calendar settings → Integrations → iCal address</div>
              </div>
            </div>
          )}

          <button onClick={save} style={{ width: '100%', background: 'var(--red)', border: 'none', color: 'var(--paper)', fontFamily: 'Bebas Neue, sans-serif', fontSize: 15, letterSpacing: '0.18em', padding: 12, cursor: 'pointer', marginTop: 8 }}>
            SAVE
          </button>
        </div>
      </div>
    </div>
  );
}
