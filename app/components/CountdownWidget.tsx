'use client';
import { useState, useEffect } from 'react';

interface CountdownEvent {
  id: string;
  name: string;
  date: string;
  type: 'payday' | 'holiday' | 'custom';
  repeat?: 'monthly' | 'weekly' | 'yearly' | 'none';
}

function getEvents(): CountdownEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('hexbrief_countdowns');
    if (raw) return JSON.parse(raw);
    // Defaults: weekend and payday
    return [
      { id: 'weekend', name: 'Weekend', date: '', type: 'custom', repeat: 'weekly' },
    ];
  } catch { return []; }
}

function saveEvents(e: CountdownEvent[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('hexbrief_countdowns', JSON.stringify(e));
}

function daysUntil(event: CountdownEvent): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (event.repeat === 'weekly' && event.name === 'Weekend') {
    const day = now.getDay();
    const daysToSat = day === 6 ? 0 : 6 - day;
    return daysToSat;
  }

  if (!event.date) return -1;
  let target = new Date(event.date);
  target.setHours(0, 0, 0, 0);

  if (event.repeat === 'monthly') {
    target.setFullYear(now.getFullYear(), now.getMonth(), target.getDate());
    if (target < now) target.setMonth(target.getMonth() + 1);
  } else if (event.repeat === 'yearly') {
    target.setFullYear(now.getFullYear());
    if (target < now) target.setFullYear(target.getFullYear() + 1);
  }

  return Math.ceil((target.getTime() - now.getTime()) / 86400000);
}

function urgencyColor(days: number): string {
  if (days === 0) return 'var(--red)';
  if (days <= 2) return '#e87a2a';
  if (days <= 7) return 'var(--paper)';
  return 'var(--muted)';
}

export default function CountdownWidget() {
  const [events, setEvents] = useState<CountdownEvent[]>([]);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [repeat, setRepeat] = useState<CountdownEvent['repeat']>('none');

  useEffect(() => { setEvents(getEvents()); }, []);

  function persist(e: CountdownEvent[]) { setEvents(e); saveEvents(e); }

  function add() {
    if (!name.trim()) return;
    persist([...events, {
      id: Date.now().toString(),
      name: name.trim(),
      date,
      type: 'custom',
      repeat,
    }]);
    setName(''); setDate(''); setRepeat('none'); setAdding(false);
  }

  function remove(id: string) { persist(events.filter(e => e.id !== id)); }

  const sorted = [...events]
    .map(e => ({ ...e, days: daysUntil(e) }))
    .filter(e => e.days >= 0)
    .sort((a, b) => a.days - b.days);

  const mono: React.CSSProperties = { fontFamily: 'JetBrains Mono, monospace' };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="section-label" style={{ margin: 0, flex: 1 }}>Countdowns</div>
        <button onClick={() => setAdding(true)} style={{ ...mono, fontSize: 10, letterSpacing: '0.1em', color: 'var(--muted)', background: 'none', border: '1px solid var(--rule2)', padding: '3px 8px', cursor: 'pointer', textTransform: 'uppercase', borderRadius: 3 }}>+ Add</button>
      </div>

      {adding && (
        <div style={{ marginBottom: 12, padding: 12, background: 'var(--ink3)', border: '1px solid var(--rule)', borderRadius: 4 }}>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Event name e.g. Payday" style={{ marginBottom: 6 }} autoFocus />
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ marginBottom: 6 }} />
          <select value={repeat} onChange={e => setRepeat(e.target.value as CountdownEvent['repeat'])} style={{ marginBottom: 8 }}>
            <option value="none">One-time</option>
            <option value="weekly">Repeat weekly</option>
            <option value="monthly">Repeat monthly</option>
            <option value="yearly">Repeat yearly</option>
          </select>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={add} style={{ ...mono, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'var(--red)', border: 'none', color: 'var(--paper)', padding: '5px 12px', cursor: 'pointer', borderRadius: 3 }}>Add</button>
            <button onClick={() => setAdding(false)} style={{ ...mono, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'transparent', border: '1px solid var(--rule2)', color: 'var(--muted)', padding: '5px 12px', cursor: 'pointer', borderRadius: 3 }}>Cancel</button>
          </div>
        </div>
      )}

      {sorted.length === 0 && !adding && (
        <div style={{ ...mono, fontSize: 10, color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>No countdowns — add payday, holidays or events</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {sorted.map(e => (
          <CountdownRow key={e.id} event={e} days={e.days} onRemove={remove} />
        ))}
      </div>
    </div>
  );
}

function CountdownRow({ event, days, onRemove }: { event: CountdownEvent; days: number; onRemove: (id: string) => void }) {
  const [hovered, setHovered] = useState(false);
  const mono: React.CSSProperties = { fontFamily: 'JetBrains Mono, monospace' };
  const label = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days} days`;

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--rule)' }}>
      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: urgencyColor(days), lineHeight: 1, minWidth: 42, letterSpacing: '0.02em' }}>
        {days === 0 ? '!' : days}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, color: 'var(--paper)', fontWeight: 400 }}>{event.name}</div>
        <div style={{ ...mono, fontSize: 9, color: 'var(--muted)', letterSpacing: '0.06em', marginTop: 1 }}>
          {label}{event.repeat && event.repeat !== 'none' ? ` · repeats ${event.repeat}` : ''}
        </div>
      </div>
      <button onClick={() => onRemove(event.id)}
        style={{ visibility: hovered ? 'visible' : 'hidden', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 2px', fontFamily: 'monospace' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>×</button>
    </div>
  );
}
