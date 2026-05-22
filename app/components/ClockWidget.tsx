'use client';
import { useState, useEffect } from 'react';

interface Props {
  userName?: string;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function ClockWidget({ userName }: Props) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!now) return null;

  return (
    <div className="fade-up" style={{ marginBottom: '8px' }}>
      <div style={{
        fontSize: 'clamp(52px, 8vw, 80px)',
        fontFamily: 'DM Serif Display, serif',
        color: 'var(--text)',
        lineHeight: 1,
        letterSpacing: '-0.02em',
      }}>
        {formatTime(now)}
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginTop: '8px',
      }}>
        <span style={{ color: 'var(--muted)', fontSize: '15px', fontWeight: 300 }}>
          {formatDate(now)}
        </span>
        {userName && (
          <>
            <span style={{ color: 'var(--border)' }}>—</span>
            <span style={{ color: 'var(--accent)', fontSize: '15px' }}>
              {getGreeting()}, {userName}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
