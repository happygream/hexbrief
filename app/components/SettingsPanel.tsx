'use client';
import { useState, useEffect } from 'react';
import { Settings } from '@/app/types';
import { getSettings, saveSettings, defaultSettings } from '@/app/lib/storage';

interface Props {
  onClose: () => void;
  onSave: () => void;
}

export default function SettingsPanel({ onClose, onSave }: Props) {
  const [s, setS] = useState<Settings>(defaultSettings);
  const [feedInput, setFeedInput] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setS(getSettings());
  }, []);

  function update(key: keyof Settings, value: string) {
    setS(prev => ({ ...prev, [key]: value }));
  }

  function addFeed() {
    if (!feedInput.trim()) return;
    setS(prev => ({ ...prev, newsFeeds: [...prev.newsFeeds, feedInput.trim()] }));
    setFeedInput('');
  }

  function removeFeed(i: number) {
    setS(prev => ({ ...prev, newsFeeds: prev.newsFeeds.filter((_, idx) => idx !== i) }));
  }

  function save() {
    saveSettings(s);
    setSaved(true);
    setTimeout(() => { setSaved(false); onSave(); onClose(); }, 800);
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        padding: '32px',
        width: '100%',
        maxWidth: '520px',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontFamily: 'DM Serif Display', fontSize: '22px', color: 'var(--text)' }}>Settings</h2>
          <button className="btn-ghost" onClick={onClose}>Close</button>
        </div>

        <Section label="Profile">
          <Field label="Your name">
            <input type="text" value={s.userName} onChange={e => update('userName', e.target.value)} placeholder="e.g. Mike" />
          </Field>
        </Section>

        <Section label="Weather">
          <Field label="OpenWeatherMap API key">
            <input type="password" value={s.weatherApiKey} onChange={e => update('weatherApiKey', e.target.value)} placeholder="Your free API key" />
          </Field>
          <Field label="City">
            <input type="text" value={s.weatherCity} onChange={e => update('weatherCity', e.target.value)} placeholder="e.g. London" />
          </Field>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
            Free key at openweathermap.org — takes ~10 mins to activate
          </div>
        </Section>

        <Section label="Calendar">
          <Field label="iCal URL">
            <input type="url" value={s.icalUrl} onChange={e => update('icalUrl', e.target.value)} placeholder="webcal://... or https://..." />
          </Field>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
            Google: Calendar settings → Integrations → iCal address
          </div>
        </Section>

        <Section label="News feeds (RSS)">
          {s.newsFeeds.map((feed, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ flex: 1, fontSize: '12px', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {feed}
              </span>
              <button className="btn-ghost" onClick={() => removeFeed(i)} style={{ flexShrink: 0, color: 'var(--red)', borderColor: 'var(--red)' }}>
                Remove
              </button>
            </div>
          ))}
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <input type="url" value={feedInput} onChange={e => setFeedInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addFeed()} placeholder="https://example.com/feed.rss" />
            <button className="btn" onClick={addFeed} style={{ flexShrink: 0 }}>Add</button>
          </div>
        </Section>

        <button
          className="btn"
          onClick={save}
          style={{ width: '100%', padding: '12px', fontSize: '14px', justifyContent: 'center', display: 'flex' }}
        >
          {saved ? 'Saved!' : 'Save settings'}
        </button>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ color: 'var(--muted)', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px' }}>{label}</div>
      {children}
    </div>
  );
}
