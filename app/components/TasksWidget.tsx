'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Task, getTasks, saveTasks } from '@/app/lib/storage';

function pad(n: number) { return String(n).padStart(2, '0'); }

type ElectronAPI = {
  isElectron?: boolean;
  fetchRSS?: (urls: string[]) => Promise<unknown[]>;
  notify?: (title: string, body: string) => void;
  setAutoStart?: (enable: boolean) => void;
};

function getElectron(): ElectronAPI | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as { electronAPI?: ElectronAPI }).electronAPI;
}

function CheckSVG() {
  return <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="#f4f5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

const POMODORO_WORK = 25 * 60;
const POMODORO_BREAK = 5 * 60;

export default function TasksWidget({ onTasksChange }: { onTasksChange?: (tasks: Task[]) => void }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  // Pomodoro state
  const [pomRunning, setPomRunning] = useState(false);
  const [pomSeconds, setPomSeconds] = useState(POMODORO_WORK);
  const [pomPhase, setPomPhase] = useState<'work' | 'break'>('work');
  const pomRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { setTasks(getTasks()); }, []);

  function persist(t: Task[]) {
    setTasks(t);
    saveTasks(t);
    onTasksChange?.(t);
  }

  function toggle(id: string) { persist(tasks.map(t => t.id === id ? { ...t, done: !t.done, completedDate: !t.done ? new Date().toISOString() : undefined } : t)); }
  function remove(id: string) { persist(tasks.filter(t => t.id !== id)); }

  function add() {
    if (!draft.trim()) return;
    persist([...tasks, {
      id: Date.now().toString(),
      text: draft.trim(),
      done: false,
      createdAt: new Date().toISOString(),
      dueDate: new Date().toISOString().split('T')[0],
    }]);
    setDraft(''); setAdding(false);
  }

  // Pomodoro
  const startPomodoro = useCallback(() => {
    if (pomRunning) {
      clearInterval(pomRef.current!);
      setPomRunning(false);
      setPomSeconds(POMODORO_WORK);
      setPomPhase('work');
      return;
    }
    setPomRunning(true);
    pomRef.current = setInterval(() => {
      setPomSeconds(prev => {
        if (prev <= 1) {
          clearInterval(pomRef.current!);
          setPomRunning(false);
          setPomPhase(p => {
            const next = p === 'work' ? 'break' : 'work';
            const title = next === 'break' ? 'Time for a break' : 'Break over';
            const body = next === 'break' ? 'Good work — take 5 minutes.' : 'Back to it.';
            if (typeof window !== 'undefined' && getElectron()?.notify) {
              getElectron()!.notify!(title, body);
            } else if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
              new Notification(title, { body });
            }
            setPomSeconds(next === 'break' ? POMODORO_BREAK : POMODORO_WORK);
            return next;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [pomRunning]);

  useEffect(() => {
    return () => { if (pomRef.current) clearInterval(pomRef.current); };
  }, []);

  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const mins = Math.floor(pomSeconds / 60);
  const secs = pomSeconds % 60;
  const pomPct = pomPhase === 'work'
    ? ((POMODORO_WORK - pomSeconds) / POMODORO_WORK) * 100
    : ((POMODORO_BREAK - pomSeconds) / POMODORO_BREAK) * 100;

  const remaining = tasks.filter(t => !t.done).length;
  const donePct = tasks.length ? Math.round((tasks.filter(t => t.done).length / tasks.length) * 100) : 0;
  const mono: React.CSSProperties = { fontFamily: 'JetBrains Mono, monospace' };

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 26, color: 'var(--red)', lineHeight: 1 }}>{remaining}</span>
          <span style={{ ...mono, fontSize: 10, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginLeft: 5, verticalAlign: 4 }}>remaining</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Pomodoro button */}
          <button onClick={startPomodoro} title={pomRunning ? 'Stop timer' : 'Start 25min focus timer'}
            style={{ ...mono, fontSize: 10, letterSpacing: '0.06em', color: pomRunning ? 'var(--red)' : 'var(--muted)', background: pomRunning ? 'rgba(232,65,42,0.1)' : 'none', border: `1px solid ${pomRunning ? 'var(--red)' : 'var(--rule2)'}`, padding: '4px 10px', cursor: 'pointer', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 5 }}>
            {pomRunning ? (
              <>
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><rect x="1" y="1" width="2.5" height="6" fill="currentColor"/><rect x="4.5" y="1" width="2.5" height="6" fill="currentColor"/></svg>
                {pad(mins)}:{pad(secs)}
              </>
            ) : (
              <>
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 1L7 4L1.5 7V1Z" fill="currentColor"/></svg>
                25:00
              </>
            )}
          </button>
          <button onClick={() => setAdding(true)}
            style={{ ...mono, fontSize: 10, letterSpacing: '0.1em', color: 'var(--muted)', background: 'none', border: '1px solid var(--rule2)', padding: '4px 10px', cursor: 'pointer', textTransform: 'uppercase' }}>
            + Add
          </button>
        </div>
      </div>

      {/* Pomodoro phase indicator */}
      {pomRunning && (
        <div style={{ marginBottom: 12, padding: '8px 12px', background: 'rgba(232,65,42,0.06)', border: '1px solid rgba(232,65,42,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', ...mono, fontSize: 9, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>
            <span>{pomPhase === 'work' ? 'Focus session' : 'Break time'}</span>
            <span>{pad(mins)}:{pad(secs)} remaining</span>
          </div>
          <div style={{ height: 2, background: 'var(--rule2)' }}>
            <div style={{ height: 2, background: 'var(--red)', width: `${pomPct}%`, transition: 'width 1s linear' }} />
          </div>
        </div>
      )}

      <div className="section-label">Tasks</div>

      <div>
        {adding && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--rule)' }}>
            <input autoFocus value={draft} onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') add(); if (e.key === 'Escape') { setAdding(false); setDraft(''); } }}
              placeholder="What needs doing..."
              style={{ background: 'none', border: 'none', fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: 'var(--paper)', padding: 0, outline: 'none', width: '100%' }}
            />
          </div>
        )}

        {tasks.length === 0 && !adding && (
          <div style={{ ...mono, fontSize: 10, color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '16px 0' }}>
            No tasks — clear day ahead
          </div>
        )}

        {tasks.map(task => <TaskRow key={task.id} task={task} onToggle={toggle} onRemove={remove} />)}
      </div>

      <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--rule)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', ...mono, fontSize: 9, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 7 }}>
          <span>Daily progress</span>
          <span>{tasks.filter(t => t.done).length} / {tasks.length} complete</span>
        </div>
        <div style={{ height: 1, background: 'var(--rule2)', position: 'relative' }}>
          <div style={{ height: 1, background: 'var(--red)', width: `${donePct}%`, transition: 'width .3s', position: 'relative' }}>
            {donePct > 0 && <div style={{ position: 'absolute', right: 0, top: -3, width: 7, height: 7, background: 'var(--red)', borderRadius: '50%' }} />}
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
      <div onClick={() => onToggle(task.id)}
        style={{ width: 13, height: 13, border: `1px solid ${task.done ? 'var(--red)' : 'var(--rule2)'}`, background: task.done ? 'var(--red)' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s', cursor: 'pointer' }}>
        {task.done && <CheckSVG />}
      </div>
      <span onClick={() => onToggle(task.id)}
        style={{ fontSize: 14, color: task.done ? 'var(--muted)' : 'var(--paper)', fontWeight: 300, flex: 1, textDecoration: task.done ? 'line-through' : 'none', textDecorationColor: 'var(--dim)', cursor: 'pointer', lineHeight: 1.3 }}>
        {task.text}
      </span>
      <button onClick={e => { e.stopPropagation(); onRemove(task.id); }}
        style={{ visibility: hovered ? 'visible' : 'hidden', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 2px', fontFamily: 'monospace' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
        ×
      </button>
    </div>
  );
}
