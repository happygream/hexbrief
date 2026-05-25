'use client';
import { useState, useEffect } from 'react';
import { getTasks, saveTasks } from '@/app/lib/storage';

interface InboxItem {
  id: string;
  text: string;
  createdAt: string;
}

function getInbox(): InboxItem[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('hexbrief_inbox') || '[]'); } catch { return []; }
}
function saveInbox(items: InboxItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('hexbrief_inbox', JSON.stringify(items));
}

export default function InboxWidget() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [draft, setDraft] = useState('');
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => { setItems(getInbox()); }, []);

  function persist(i: InboxItem[]) { setItems(i); saveInbox(i); }

  function add() {
    if (!draft.trim()) return;
    persist([{ id: Date.now().toString(), text: draft.trim(), createdAt: new Date().toISOString() }, ...items]);
    setDraft('');
  }

  function moveToTasks(item: InboxItem) {
    const tasks = getTasks();
    saveTasks([...tasks, {
      id: Date.now().toString(),
      text: item.text,
      done: false,
      createdAt: item.createdAt,
      dueDate: new Date().toISOString().split('T')[0],
    }]);
    persist(items.filter(i => i.id !== item.id));
    setFlash(item.id);
    setTimeout(() => setFlash(null), 1000);
  }

  function discard(id: string) { persist(items.filter(i => i.id !== id)); }

  const mono: React.CSSProperties = { fontFamily: 'JetBrains Mono, monospace' };

  return (
    <div>
      <div className="section-label">Quick capture</div>

      {/* Capture input — always visible, always fast */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        <input
          type="text"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') add(); }}
          placeholder="Dump anything here — sort it later..."
          style={{ flex: 1, fontSize: 13 }}
          autoFocus
        />
        <button onClick={add}
          style={{ ...mono, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'var(--red)', border: 'none', color: 'var(--paper)', padding: '0 14px', cursor: 'pointer', borderRadius: 3, flexShrink: 0 }}>
          Add
        </button>
      </div>

      {items.length === 0 && (
        <div style={{ ...mono, fontSize: 10, color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Inbox clear — type above to capture something
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map(item => (
          <InboxRow
            key={item.id}
            item={item}
            flashing={flash === item.id}
            onMoveToTasks={moveToTasks}
            onDiscard={discard}
          />
        ))}
      </div>

      {items.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <button onClick={() => {
            if (confirm('Move all inbox items to tasks?')) {
              const tasks = getTasks();
              const newTasks = items.map(item => ({
                id: Date.now().toString() + Math.random(),
                text: item.text,
                done: false,
                createdAt: item.createdAt,
                dueDate: new Date().toISOString().split('T')[0],
              }));
              saveTasks([...tasks, ...newTasks]);
              persist([]);
            }
          }} style={{ ...mono, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'transparent', border: '1px solid var(--rule2)', color: 'var(--muted)', padding: '5px 12px', cursor: 'pointer', borderRadius: 3 }}>
            Move all to tasks
          </button>
        </div>
      )}
    </div>
  );
}

function InboxRow({ item, flashing, onMoveToTasks, onDiscard }: {
  item: InboxItem; flashing: boolean;
  onMoveToTasks: (item: InboxItem) => void;
  onDiscard: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const mono: React.CSSProperties = { fontFamily: 'JetBrains Mono, monospace' };

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--rule)', transition: 'opacity .3s', opacity: flashing ? 0.3 : 1 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: 'var(--paper)', fontWeight: 400, lineHeight: 1.4 }}>{item.text}</div>
        <div style={{ ...mono, fontSize: 8, color: 'var(--dim)', letterSpacing: '0.06em', marginTop: 2 }}>
          {new Date(item.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      {hovered && (
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button onClick={() => onMoveToTasks(item)}
            title="Move to tasks"
            style={{ ...mono, fontSize: 8, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'rgba(232,65,42,0.1)', border: '1px solid rgba(232,65,42,0.3)', color: 'var(--red)', padding: '3px 8px', cursor: 'pointer', borderRadius: 3 }}>
            Task
          </button>
          <button onClick={() => onDiscard(item.id)}
            title="Discard"
            style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 2px', fontFamily: 'monospace' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>×</button>
        </div>
      )}
    </div>
  );
}
