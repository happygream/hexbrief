'use client';
import { useState, useEffect } from 'react';

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function pad(n: number) { return String(n).padStart(2, '0'); }

export default function ClockWidget({ userName }: { userName?: string }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!now) return null;

  const h = now.getHours();
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ padding: '0 36px', borderBottom: '1px solid var(--rule)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', lineHeight: 0.88 }}>
        <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(72px,11vw,138px)', letterSpacing: '-0.01em', color: 'var(--paper)' }}>{pad(now.getHours())}</span>
        <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(72px,11vw,138px)', color: 'var(--red)', animation: 'blink 1s step-start infinite', margin: '0 3px' }}>:</span>
        <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(72px,11vw,138px)', letterSpacing: '-0.01em', color: 'var(--paper)' }}>{pad(now.getMinutes())}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: 'clamp(8px,1.5vw,18px)', gap: 5, minWidth: 180, textAlign: 'right' }}>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(14px,1.8vw,19px)', fontStyle: 'italic', color: 'var(--paper2)', fontWeight: 300 }}>
          {greeting}{userName ? `, ${userName}` : ''}
        </div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {DAYS[now.getDay()]}&nbsp;&nbsp;·&nbsp;&nbsp;{now.getDate()} {MONTHS[now.getMonth()]} {now.getFullYear()}
        </div>
      </div>
    </div>
  );
}
