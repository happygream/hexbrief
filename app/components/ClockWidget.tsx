'use client';
import { useState, useEffect } from 'react';
import { Task } from '@/app/lib/storage';
import { CalendarEvent } from '@/app/types';

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function pad(n: number) { return String(n).padStart(2, '0'); }

function buildSmartContext(tasks: Task[], events: CalendarEvent[]): string {
  const pending = tasks.filter(t => !t.done);
  const now = new Date();

  // Find next upcoming event today
  const upcoming = events
    .filter(e => !e.allDay && e.start > now)
    .sort((a, b) => a.start.getTime() - b.start.getTime())[0];

  const parts: string[] = [];

  if (pending.length === 0 && events.length === 0) {
    return 'Nothing scheduled — a clear day.';
  }

  if (pending.length === 1) parts.push('1 task remaining');
  else if (pending.length > 1) parts.push(`${pending.length} tasks remaining`);

  if (upcoming) {
    const h = upcoming.start.getHours();
    const m = upcoming.start.getMinutes();
    const time = `${pad(h)}:${pad(m)}`;
    parts.push(`${upcoming.title} at ${time}`);
  } else if (events.length > 0 && pending.length === 0) {
    parts.push(`${events.length} event${events.length > 1 ? 's' : ''} today`);
  }

  return parts.join(' · ');
}

interface Props {
  userName?: string;
  tasks?: Task[];
  events?: CalendarEvent[];
}

export default function ClockWidget({ userName, tasks = [], events = [] }: Props) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!now) return null;

  const h = now.getHours();
  const greeting = h < 5 ? 'Still up' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : h < 21 ? 'Good evening' : 'Good night';
  const context = buildSmartContext(tasks, events);

  return (
    <div style={{ padding: '0 36px', borderBottom: '1px solid var(--rule)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', lineHeight: 0.88 }}>
        <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(72px,11vw,138px)', letterSpacing: '-0.01em', color: 'var(--paper)' }}>{pad(now.getHours())}</span>
        <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(72px,11vw,138px)', color: 'var(--red)', animation: 'blink 1s step-start infinite', margin: '0 3px' }}>:</span>
        <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(72px,11vw,138px)', letterSpacing: '-0.01em', color: 'var(--paper)' }}>{pad(now.getMinutes())}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: 'clamp(8px,1.5vw,18px)', gap: 5, minWidth: 220, textAlign: 'right' }}>
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 'clamp(14px,1.8vw,19px)',  color: 'var(--paper2)', fontWeight: 300 }}>
          {greeting}{userName ? `, ${userName}` : ''}
        </div>
        {context && (
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.06em', lineHeight: 1.4 }}>
            {context}
          </div>
        )}
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {DAYS[now.getDay()]}&nbsp;&nbsp;·&nbsp;&nbsp;{now.getDate()} {MONTHS[now.getMonth()]} {now.getFullYear()}
        </div>
      </div>
    </div>
  );
}
