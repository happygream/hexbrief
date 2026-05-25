'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Task, getTasks, saveTasks } from '@/app/lib/storage';

function pad(n: number) { return String(n).padStart(2, '0'); }

type ElectronAPI = { notify?: (title: string, body: string) => void; isElectron?: boolean; fetchRSS?: (urls: string[]) => Promise<unknown[]>; setAutoStart?: (enable: boolean) => void; };
function getElectron(): ElectronAPI | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as { electronAPI?: ElectronAPI }).electronAPI;
}

function CheckSVG() {
  return <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#f0f2f8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

const WORK = 25 * 60, BREAK = 5 * 60;

export default function TasksWidget({ onTasksChange }: { onTasksChange?: (tasks: Task[]) => void }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [pomRunning, setPomRunning] = useState(false);
  const [pomSecs, setPomSecs] = useState(WORK);
  const [pomPhase, setPomPhase] = useState<'work' | 'break'>('work');
  const pomRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { setTasks(getTasks()); }, []);
  useEffect(() => () => { if (pomRef.current) clearInterval(pomRef.current); }, []);
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') Notification.requestPermission();
  }, []);

  function persist(t: Task[]) { setTasks(t); saveTasks(t); onTasksChange?.(t); }
  function toggle(id: string) { persist(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t)); }
  function remove(id: string) { persist(tasks.filter(t => t.id !== id)); }
  function add() {
    if (!draft.trim()) return;
    persist([...tasks, { id: Date.now().toString(), text: draft.trim(), done: false, createdAt: new Date().toISOString(), dueDate: new Date().toISOString().split('T')[0] }]);
    setDraft(''); setAdding(false);
  }

  const startPomodoro = useCallback(() => {
    if (pomRunning) {
      clearInterval(pomRef.current!);
      setPomRunning(false); setPomSecs(WORK); setPomPhase('work');
      return;
    }
    setPomRunning(true);
    pomRef.current = setInterval(() => {
      setPomSecs(prev => {
        if (prev <= 1) {
          clearInterval(pomRef.current!);
          setPomRunning(false);
          setPomPhase(p => {
            const next = p === 'work' ? 'break' : 'work';
            const title = next === 'break' ? 'Time for a break' : 'Break over';
            const body = next === 'break' ? 'Good work — take 5.' : 'Back to it.';
            getElectron()?.notify?.(title, body);
            setPomSecs(next === 'break' ? BREAK : WORK);
            return next;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [pomRunning]);

  const remaining = tasks.filter(t => !t.done).length;
  const pct = tasks.length ? Math.round(tasks.filter(t => t.done).length / tasks.length * 100) : 0;
  const mins = Math.floor(pomSecs / 60), secs = pomSecs % 60;
  const mono = { fontFamily: 'JetBrains Mono, monospace' };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, color: 'var(--red)', lineHeight: 1 }}>{remaining}</span>
          <span style={{ ...mono, fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginLeft: 6, verticalAlign: 4 }}>remaining</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={startPomodoro}
            style={{ ...mono, fontSize: 11, color: pomRunning ? 'var(--red)' : 'var(--muted)', background: pomRunning ? 'rgba(232,65,42,0.1)' : 'none', border: `1px solid ${pomRunning ? 'var(--red)' : 'var(--rule2)'}`, padding: '5px 11px', cursor: 'pointer', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 5, transition: 'all .2s' }}>
            {pomRunning ? <>&#9646;&#9646; {pad(mins)}:{pad(secs)}</> : <>&#9654; 25:00</>}
          </button>
          <button onClick={() => setAdding(true)}
            style={{ ...mono, fontSize: 11, letterSpacing: '0.08em', color: 'var(--muted)', background: 'none', border: '1px solid var(--rule2)', padding: '5px 11px', cursor: 'pointer', textTransform: 'uppercase', borderRadius: 6 }}>
            + Add
          </button>
        </div>
      </div>

      {pomRunning && (
        <div style={{ marginBottom: 14, padding: '10px 14px', background: 'rgba(232,65,42,0.06)', border: '1px solid rgba(232,65,42,0.2)', borderRadius: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', ...mono, fontSize: 11, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
            <span>{pomPhase === 'work' ? 'Focus session' : 'Break time'}</span>
            <span style={{ color: 'var(--paper)' }}>{pad(mins)}:{pad(secs)}</span>
          </div>
          <div style={{ height: 2, background: 'var(--rule2)', borderRadius: 1 }}>
            <div style={{ height: 2, background: 'var(--red)', borderRadius: 1, width: `${pomPhase === 'work' ? ((WORK - pomSecs) / WORK) * 100 : ((BREAK - pomSecs) / BREAK) * 100}%`, transition: 'width 1s linear' }} />
          </div>
        </div>
      )}

      <div className="section-label">Tasks</div>

      {adding && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--rule)' }}>
          <input autoFocus value={draft} onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') add(); if (e.key === 'Escape') { setAdding(false); setDraft(''); } }}
            placeholder="What needs doing..."
            style={{ background: 'none', border: 'none', fontSize: 15, color: 'var(--paper)', padding: 0, outline: 'none', width: '100%' }} />
        </div>
      )}

      {tasks.length === 0 && !adding && (
        <div style={{ ...mono, fontSize: 12, color: 'var(--dim)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '14px 0' }}>
          No tasks — clear day ahead
        </div>
      )}

      {tasks.map(task => <TaskRow key={task.id} task={task} onToggle={toggle} onRemove={remove} />)}

      <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--rule)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', ...mono, fontSize: 11, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
          <span>Progress</span>
          <span>{tasks.filter(t => t.done).length} / {tasks.length} done</span>
        </div>
        <div style={{ height: 2, background: 'var(--rule2)', borderRadius: 1, position: 'relative' }}>
          <div style={{ height: 2, background: 'var(--red)', borderRadius: 1, width: `${pct}%`, transition: 'width .3s', position: 'relative' }}>
            {pct > 0 && <div style={{ position: 'absolute', right: 0, top: -3, width: 8, height: 8, background: 'var(--red)', borderRadius: '50%' }} />}
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
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid var(--rule)' }}>
      <div onClick={() => onToggle(task.id)}
        style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${task.done ? 'var(--red)' : 'var(--rule2)'}`, background: task.done ? 'var(--red)' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s', cursor: 'pointer' }}>
        {task.done && <CheckSVG />}
      </div>
      <span onClick={() => onToggle(task.id)}
        style={{ fontSize: 15, color: task.done ? 'var(--muted)' : 'var(--paper)', fontWeight: 400, flex: 1, textDecoration: task.done ? 'line-through' : 'none', textDecorationColor: 'var(--dim)', cursor: 'pointer', lineHeight: 1.35 }}>
        {task.text}
      </span>
      <button onClick={e => { e.stopPropagation(); onRemove(task.id); }}
        style={{ visibility: hovered ? 'visible' : 'hidden', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: '0 3px', fontFamily: 'monospace' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>×</button>
    </div>
  );
}
