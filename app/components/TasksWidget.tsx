'use client';
import { useState, useEffect } from 'react';
import { Task, getTasks, saveTasks } from '@/app/lib/storage';

function CheckSVG() {
  return <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="#f4f5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

export default function TasksWidget() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  useEffect(() => { setTasks(getTasks()); }, []);

  function persist(t: Task[]) { setTasks(t); saveTasks(t); }
  function toggle(id: string) { persist(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t)); }
  function remove(id: string) { persist(tasks.filter(t => t.id !== id)); }

  function add() {
    if (!draft.trim()) return;
    persist([...tasks, { id: Date.now().toString(), text: draft.trim(), done: false, createdAt: new Date().toISOString() }]);
    setDraft(''); setAdding(false);
  }

  const remaining = tasks.filter(t => !t.done).length;
  const pct = tasks.length ? Math.round((tasks.filter(t => t.done).length / tasks.length) * 100) : 0;

  const mono: React.CSSProperties = { fontFamily: 'JetBrains Mono, monospace' };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 26, color: 'var(--red)', lineHeight: 1 }}>{remaining}</span>
          <span style={{ ...mono, fontSize: 10, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginLeft: 5, verticalAlign: 4 }}>remaining</span>
        </div>
        <button onClick={() => setAdding(true)}
          style={{ ...mono, fontSize: 10, letterSpacing: '0.1em', color: 'var(--muted)', background: 'none', border: '1px solid var(--rule2)', padding: '4px 10px', cursor: 'pointer', textTransform: 'uppercase' }}>
          + Add
        </button>
      </div>

      <div className="section-label">Tasks</div>

      <div>
        {adding && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--rule)' }}>
            <input autoFocus value={draft} onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') add(); if (e.key === 'Escape') { setAdding(false); setDraft(''); } }}
              placeholder="What needs doing..."
              style={{ background: 'none', border: 'none', fontFamily: 'Cormorant Garamond, serif', fontSize: 15, color: 'var(--paper)', padding: 0, outline: 'none', width: '100%' }}
            />
          </div>
        )}

        {tasks.length === 0 && !adding && (
          <div style={{ ...mono, fontSize: 10, color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '16px 0' }}>
            No tasks — clear day ahead
          </div>
        )}

        {tasks.map(task => (
          <TaskRow key={task.id} task={task} onToggle={toggle} onRemove={remove} />
        ))}
      </div>

      <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--rule)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', ...mono, fontSize: 9, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 7 }}>
          <span>Daily progress</span>
          <span>{tasks.filter(t => t.done).length} / {tasks.length} complete</span>
        </div>
        <div style={{ height: 1, background: 'var(--rule2)', position: 'relative' }}>
          <div style={{ height: 1, background: 'var(--red)', width: `${pct}%`, transition: 'width .3s', position: 'relative' }}>
            {pct > 0 && <div style={{ position: 'absolute', right: 0, top: -3, width: 7, height: 7, background: 'var(--red)', borderRadius: '50%' }} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskRow({ task, onToggle, onRemove }: { task: Task; onToggle: (id: string) => void; onRemove: (id: string) => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--rule)' }}>

      <div onClick={() => onToggle(task.id)} style={{ width: 13, height: 13, border: `1px solid ${task.done ? 'var(--red)' : 'var(--rule2)'}`, background: task.done ? 'var(--red)' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s', cursor: 'pointer' }}>
        {task.done && <CheckSVG />}
      </div>

      <span onClick={() => onToggle(task.id)} style={{ fontSize: 14, color: task.done ? 'var(--muted)' : 'var(--paper)', fontWeight: 300, flex: 1, textDecoration: task.done ? 'line-through' : 'none', textDecorationColor: 'var(--dim)', cursor: 'pointer', lineHeight: 1.3 }}>
        {task.text}
      </span>

      <button
        onClick={(e) => { e.stopPropagation(); onRemove(task.id); }}
        style={{
          visibility: hovered ? 'visible' : 'hidden',
          background: 'none',
          border: 'none',
          color: 'var(--muted)',
          cursor: 'pointer',
          fontSize: 18,
          lineHeight: 1,
          padding: '0 2px',
          transition: 'color .15s',
          fontFamily: 'monospace',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
      >
        ×
      </button>
    </div>
  );
}
