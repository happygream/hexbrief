'use client';
import { useState, useEffect } from 'react';
import { fetchWeather, WeatherData } from '@/app/lib/weather';
import { getSettings, saveSettings } from '@/app/lib/storage';

export default function WeatherWidget({ city, lat, lon }: { city?: string; lat?: number; lon?: number }) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    fetchWeather(city, lat, lon)
      .then(d => { setData(d); setError(false); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [city, lat, lon]);

  function detectLocation() {
    if (!navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const s = getSettings();
        saveSettings({ ...s, weatherLat: pos.coords.latitude, weatherLon: pos.coords.longitude, weatherCity: '' });
        fetchWeather('', pos.coords.latitude, pos.coords.longitude)
          .then(d => { setData(d); setError(false); })
          .catch(() => setError(true))
          .finally(() => setDetecting(false));
      },
      () => setDetecting(false)
    );
  }

  const mono = { fontFamily: 'JetBrains Mono, monospace' };

  if (loading) return (
    <div>
      <div className="section-label">Conditions</div>
      <div className="skeleton" style={{ height: 70, marginBottom: 10 }} />
      <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 16, width: '40%' }} />
    </div>
  );

  if (error || !data) return (
    <div>
      <div className="section-label">Conditions</div>
      <div style={{ ...mono, fontSize: 13, color: 'var(--red)', marginBottom: 12 }}>Could not load weather</div>
      <button onClick={detectLocation} style={{ ...mono, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'none', border: '1px solid var(--rule2)', color: 'var(--muted)', padding: '7px 14px', cursor: 'pointer', borderRadius: 6 }}>
        {detecting ? 'Detecting...' : 'Use my location'}
      </button>
    </div>
  );

  return (
    <div>
      <div className="section-label">Conditions</div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 72, lineHeight: 0.9, color: 'var(--paper)' }}>
            {data.temp}<sup style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 28, fontWeight: 300, color: 'var(--muted)', verticalAlign: 'super' }}>°C</sup>
          </div>
          <div style={{ ...mono, fontSize: 11, color: 'var(--red)', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 8, fontWeight: 400 }}>{data.city}, {data.country}</div>
          <div style={{ fontSize: 15, color: 'var(--paper2)', marginTop: 3 }}>{data.description}, feels {data.feels_like}°</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <svg width="54" height="54" viewBox="0 0 72 72" fill="none" style={{ opacity: 0.18 }}>
            <circle cx="36" cy="28" r="14" stroke="white" strokeWidth="2"/>
            <path d="M8 44 Q20 36 36 44 Q52 52 64 44" stroke="white" strokeWidth="1.5" fill="none"/>
            <path d="M10 52 Q24 42 42 52 Q58 60 66 52" stroke="white" strokeWidth="1.2" fill="none" opacity=".5"/>
          </svg>
          <button onClick={detectLocation}
            style={{ ...mono, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'none', border: '1px solid var(--rule)', color: 'var(--muted)', padding: '4px 9px', cursor: 'pointer', borderRadius: 4, transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--paper)'; e.currentTarget.style.borderColor = 'var(--rule2)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--rule)'; }}>
            {detecting ? '...' : 'Locate'}
          </button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, paddingTop: 16, borderTop: '1px solid var(--rule)' }}>
        {[
          { label: 'Humidity', val: data.humidity, unit: '%' },
          { label: 'Wind', val: data.wind, unit: 'm/s' },
          { label: 'Pressure', val: data.pressure, unit: 'hPa' },
          { label: 'Feels like', val: data.feels_like, unit: '°' },
        ].map(s => (
          <div key={s.label}>
            <div style={{ ...mono, fontSize: 10, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>{s.label}</div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, letterSpacing: '0.04em', color: 'var(--paper)', lineHeight: 1 }}>
              {s.val}<span style={{ ...mono, fontSize: 10, color: 'var(--muted)', marginLeft: 2 }}>{s.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
