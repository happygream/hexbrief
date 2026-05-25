'use client';
import { useState, useEffect } from 'react';

interface Habit {
  id: string;
  name: string;
  emoji: string;
  completedDates: string[];
}

function getHabits(): Habit[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('hexbrief_habits') || '[]'); } catch { return []; }
}
function saveHabits(h: Habit[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('hexbrief_habits', JSON.stringify(h));
}

function getStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const sorted = [...dates].sort().reverse();
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;
  let streak = 0;
  let check = new Date();
  if (sorted[0] === yesterday) check = new Date(Date.now() - 86400000);
  for (let i = 0; i < sorted.length; i++) {
    if (new Date(sorted[i]).toDateString() === check.toDateString()) {
      streak++;
      check = new Date(check.getTime() - 86400000);
    } else break;
  }
  return streak;
}

const SUGGESTIONS = [
  { name: 'Exercise', emoji: '' },
  { name: 'Read', emoji: '' },
  { name: 'Meditate', emoji: '' },
  { name: 'Water', emoji: '' },
  { name: 'Walk', emoji: '' },
  { name: 'Journal', emoji: '' },
];

export default function HabitsWidget() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const today = new Date().toDateString();

  useEffect(() => { setHabits(getHabits()); }, []);

  function persist(h: Habit[]) { setHabits(h); saveHabits(h); }

  function toggle(id: string) {
    persist(habits.map(h => {
      if (h.id !== id) return h;
      const done = h.completedDates.includes(today);
      return {
        ...h,
        completedDates: done
          ? h.completedDates.filter(d => d !== today)
          : [...h.completedDates, today],
      };
    }));
  }

  function addHabit(name: string) {
    if (!name.trim()) return;
    persist([...habits, { id: Date.now().toString(), name: name.trim(), emoji: '', completedDates: [] }]);
    setNewName(''); setAdding(false);
  }

  function removeHabit(id: string) { persist(habits.filter(h => h.id !== id)); }

  const doneToday = habits.filter(h => h.completedDates.includes(today)).length;
  const mono: React.CSSProperties = { fontFamily: 'JetBrains Mono, monospace' };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="section-label" style={{ margin: 0, flex: 1 }}>Habits</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {habits.length > 0 && (
            <span style={{ ...mono, fontSize: 10, color: doneToday === habits.length ? 'var(--red)' : 'var(--muted)' }}>
              {doneToday}/{habits.length} today
            </span>
          )}
          <button onClick={() => setAdding(true)} style={{ ...mono, fontSize: 10, letterSpacing: '0.1em', color: 'var(--muted)', background: 'none', border: '1px solid var(--rule2)', padding: '3px 8px', cursor: 'pointer', textTransform: 'uppercase', borderRadius: 3 }}>+ Add</button>
        </div>
      </div>

      {adding && (
        <div style={{ marginBottom: 12, padding: 12, background: 'var(--ink3)', border: '1px solid var(--rule)', borderRadius: 4 }}>
          <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="Habit name e.g. Exercise"
            onKeyDown={e => { if (e.key === 'Enter') addHabit(newName); if (e.key === 'Escape') setAdding(false); }}
            autoFocus style={{ marginBottom: 8 }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
            {SUGGESTIONS.map(s => (
              <button key={s.name} onClick={() => addHabit(s.name)}
                style={{ ...mono, fontSize: 11, letterSpacing: '0.06em', background: 'var(--ink2)', border: '1px solid var(--rule)', color: 'var(--muted)', padding: '3px 8px', cursor: 'pointer', borderRadius: 3 }}>
                {s.name}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => addHabit(newName)} style={{ ...mono, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'var(--red)', border: 'none', color: 'var(--paper)', padding: '5px 12px', cursor: 'pointer', borderRadius: 3 }}>Add</button>
            <button onClick={() => setAdding(false)} style={{ ...mono, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'transparent', border: '1px solid var(--rule2)', color: 'var(--muted)', padding: '5px 12px', cursor: 'pointer', borderRadius: 3 }}>Cancel</button>
          </div>
        </div>
      )}

      {habits.length === 0 && !adding && (
        <div style={{ ...mono, fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>No habits yet — add one to start tracking</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {habits.map(habit => {
          const done = habit.completedDates.includes(today);
          const streak = getStreak(habit.completedDates);
          return (
            <HabitRow key={habit.id} habit={habit} done={done} streak={streak} onToggle={toggle} onRemove={removeHabit} />
          );
        })}
      </div>
    </div>
  );
}

function HabitRow({ habit, done, streak, onToggle, onRemove }: {
  habit: Habit; done: boolean; streak: number;
  onToggle: (id: string) => void; onRemove: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const mono: React.CSSProperties = { fontFamily: 'JetBrains Mono, monospace' };

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--rule)', cursor: 'pointer' }}
      onClick={() => onToggle(habit.id)}>
      <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${done ? 'var(--red)' : 'var(--rule2)'}`, background: done ? 'var(--red)' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}>
        {done && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#f4f5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <span style={{ fontSize: 14, color: done ? 'var(--muted)' : 'var(--paper)', fontWeight: 400, flex: 1, textDecoration: done ? 'line-through' : 'none', textDecorationColor: 'var(--dim)', transition: 'all .15s' }}>
        {habit.name}
      </span>
      {streak > 0 && (
        <span style={{ ...mono, fontSize: 10, color: streak >= 7 ? 'var(--red)' : 'var(--muted)', letterSpacing: '0.04em', fontWeight: streak >= 7 ? 500 : 300 }}>
          {streak}d
        </span>
      )}
      <button onClick={e => { e.stopPropagation(); onRemove(habit.id); }}
        style={{ visibility: hovered ? 'visible' : 'hidden', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 2px', fontFamily: 'monospace' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>×</button>
    </div>
  );
}
