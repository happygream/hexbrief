'use client';
import { useState } from 'react';
import { getSettings, saveSettings, DEFAULT_NEWS_FEEDS } from '@/app/lib/storage';

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('');
  const [detecting, setDetecting] = useState(false);

  function finish() {
    const s = getSettings();
    saveSettings({
      ...s,
      userName: name.trim(),
      newsFeeds: DEFAULT_NEWS_FEEDS, // BBC + HN pre-selected, change later in settings
      onboardingDone: true,
    });
    onDone();
  }

  const mono: React.CSSProperties = { fontFamily: 'JetBrains Mono, monospace' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 100 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 36, letterSpacing: '0.18em', color: 'var(--paper)', lineHeight: 1 }}>
            HEX<span style={{ color: 'var(--red)' }}>B</span>RIEF
          </div>
          <div style={{ ...mono, fontSize: 10, color: 'var(--muted)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 6 }}>
            Your personal morning dashboard
          </div>
        </div>

        <div style={{ marginBottom: 28 }}>
          <div style={{ ...mono, fontSize: 9, color: 'var(--muted)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>
            What should we call you? (optional)
          </div>
          <input
            type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. Mike"
            onKeyDown={e => e.key === 'Enter' && finish()}
            autoFocus
          />
        </div>

        <div style={{ background: 'var(--ink2)', border: '1px solid var(--rule)', padding: '12px 16px', marginBottom: 28 }}>
          <div style={{ ...mono, fontSize: 9, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Ready out of the box</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              'Weather auto-detected from your location',
              'BBC News + Hacker News headlines loaded',
              'Tasks, habits, countdowns and finance available',
              'Enable extra widgets in Configure 2192 Widgets',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 4, height: 4, background: 'var(--red)', borderRadius: '50%', flexShrink: 0 }} />
                <span style={{ ...mono, fontSize: 10, color: 'var(--paper2)', letterSpacing: '0.04em' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={finish} style={{ width: '100%', background: 'var(--red)', border: 'none', color: 'var(--paper)', fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, letterSpacing: '0.18em', padding: 14, cursor: 'pointer' }}>
          OPEN HEXBRIEF
        </button>
      </div>
    </div>
  );
}
