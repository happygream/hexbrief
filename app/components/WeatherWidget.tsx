'use client';
import { useState, useEffect } from 'react';
import { WeatherData } from '@/app/types';
import { fetchWeather, weatherIcon } from '@/app/lib/weather';

interface Props {
  apiKey: string;
  city: string;
}

export default function WeatherWidget({ apiKey, city }: Props) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!apiKey || !city) { setLoading(false); return; }
    fetchWeather(apiKey, city)
      .then(d => { setData(d); setError(false); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [apiKey, city]);

  if (!apiKey || !city) return (
    <div className="card fade-up delay-2" style={{ opacity: 0.5 }}>
      <div style={{ color: 'var(--muted)', fontSize: '13px' }}>
        Add weather API key in settings to enable weather
      </div>
    </div>
  );

  if (loading) return (
    <div className="card fade-up delay-2">
      <div className="skeleton" style={{ height: '16px', width: '60%', marginBottom: '12px' }} />
      <div className="skeleton" style={{ height: '40px', width: '40%', marginBottom: '8px' }} />
      <div className="skeleton" style={{ height: '14px', width: '80%' }} />
    </div>
  );

  if (error || !data) return (
    <div className="card fade-up delay-2">
      <div style={{ color: 'var(--red)', fontSize: '13px' }}>Could not load weather</div>
    </div>
  );

  return (
    <div className="card fade-up delay-2">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ color: 'var(--muted)', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
            {data.city}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            <span style={{ fontSize: '48px', fontFamily: 'DM Serif Display', lineHeight: 1, color: 'var(--text)' }}>
              {data.temp}°
            </span>
            <span style={{ fontSize: '24px', marginBottom: '6px' }}>{weatherIcon(data.icon)}</span>
          </div>
          <div style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px', textTransform: 'capitalize' }}>
            {data.description} · feels {data.feels_like}°
          </div>
        </div>
        <div style={{ textAlign: 'right', marginTop: '4px' }}>
          <div style={{ color: 'var(--muted)', fontSize: '12px', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text)' }}>{data.humidity}%</span> humidity
          </div>
          <div style={{ color: 'var(--muted)', fontSize: '12px' }}>
            <span style={{ color: 'var(--text)' }}>{data.wind} m/s</span> wind
          </div>
        </div>
      </div>
    </div>
  );
}
