'use client';
import { useState, useEffect, useCallback } from 'react';
import ClockWidget from './components/ClockWidget';
import WeatherWidget from './components/WeatherWidget';
import FocusWidget from './components/FocusWidget';
import TasksWidget from './components/TasksWidget';
import NewsWidget from './components/NewsWidget';
import CalendarWidget from './components/CalendarWidget';
import SettingsPanel from './components/SettingsPanel';
import { getSettings } from './lib/storage';
import { Settings } from './types';

export default function Home() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const loadSettings = useCallback(() => {
    setSettings(getSettings());
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  if (!settings) return null;

  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      padding: 'clamp(24px, 4vw, 56px)',
      maxWidth: '1400px',
      margin: '0 auto',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 'clamp(32px, 5vw, 56px)',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div className="fade-up">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '4px',
          }}>
            <span style={{
              fontFamily: 'DM Serif Display',
              fontSize: '18px',
              color: 'var(--accent)',
              letterSpacing: '0.02em',
            }}>
              Hex
            </span>
            <span style={{
              fontFamily: 'DM Sans',
              fontSize: '18px',
              color: 'var(--text)',
              fontWeight: 300,
              letterSpacing: '0.04em',
            }}>
              Brief
            </span>
          </div>
        </div>

        <button
          className="btn-ghost fade-up"
          onClick={() => setShowSettings(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle cx="6.5" cy="6.5" r="2" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M6.5 1v1.5M6.5 10.5V12M1 6.5h1.5M10.5 6.5H12M2.6 2.6l1.06 1.06M9.34 9.34l1.06 1.06M2.6 10.4l1.06-1.06M9.34 3.66l1.06-1.06" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          Settings
        </button>
      </div>

      {/* Clock */}
      <div style={{ marginBottom: 'clamp(28px, 4vw, 48px)' }}>
        <ClockWidget userName={settings.userName} />
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '16px',
        alignItems: 'start',
      }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <WeatherWidget apiKey={settings.weatherApiKey} city={settings.weatherCity} />
          <FocusWidget />
          <CalendarWidget icalUrl={settings.icalUrl} />
        </div>

        {/* Middle column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <TasksWidget />
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <NewsWidget feeds={settings.newsFeeds} />
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '48px',
        paddingTop: '20px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <span style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.04em' }}>
          HexBrief v1.0.0 — open source, no tracking, no accounts
        </span>
        <a
          href="https://github.com/yourusername/hexbrief"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '11px', color: 'var(--muted)', textDecoration: 'none', letterSpacing: '0.04em' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
        >
          GitHub
        </a>
      </div>

      {showSettings && (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          onSave={loadSettings}
        />
      )}
    </main>
  );
}
