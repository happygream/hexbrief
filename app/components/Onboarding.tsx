'use client';
import { useState } from 'react';
import { getSettings, saveSettings } from '@/app/lib/storage';

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

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function finish() {
    const feeds = PRESETS.filter(p => selected.includes(p.id)).map(p => p.url);
    const s = getSettings();
    saveSettings({ ...s, userName: name.trim(), newsFeeds: feeds, onboardingDone: true });
    onDone();
  }

  const btn: React.CSSProperties = { fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'none', border: '1px solid var(--rule2)', color: 'var(--muted)', padding: '5px 12px', cursor: 'pointer', transition: 'all .2s' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 100 }}>
      <div style={{ width: '100%', maxWidth: 480 }}>

        {/* Logo */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, letterSpacing: '0.18em', color: 'var(--paper)' }}>
            HEX<span style={{ color: 'var(--red)' }}>B</span>RIEF
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 4 }}>
            Your personal morning dashboard
          </div>
        </div>

        {/* Name */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>Your name (optional)</div>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Mike" onKeyDown={e => e.key === 'Enter' && finish()} />
        </div>

        {/* News sources */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>
            Pick your news sources
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {PRESETS.map(p => {
              const on = selected.includes(p.id);
              return (
                <div key={p.id} onClick={() => toggle(p.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: on ? 'rgba(232,65,42,0.06)' : 'var(--ink2)', border: `1px solid ${on ? 'var(--red)' : 'var(--rule)'}`, cursor: 'pointer', transition: 'all .15s' }}>
                  <div style={{ width: 12, height: 12, border: `1px solid ${on ? 'var(--red)' : 'var(--rule2)'}`, background: on ? 'var(--red)' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}>
                    {on && <svg width="7" height="5" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="#f2f3f8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--paper)', flex: 1 }}>{p.name}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{p.cat}</span>
                </div>
              );
            })}
          </div>
        </div>

        <button onClick={finish} style={{ width: '100%', background: 'var(--red)', border: 'none', color: 'var(--paper)', fontFamily: 'Bebas Neue, sans-serif', fontSize: 16, letterSpacing: '0.18em', padding: 13, cursor: 'pointer', transition: 'opacity .2s' }}>
          OPEN HEXBRIEF
        </button>

        {selected.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: 12, fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            You can add sources later in settings
          </div>
        )}
      </div>
    </div>
  );
}
