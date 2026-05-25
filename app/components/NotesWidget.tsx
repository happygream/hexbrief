'use client';
import { useState, useEffect, useRef } from 'react';

function getNotes(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('hexbrief_notes') || '';
}
function saveNotes(n: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('hexbrief_notes', n);
}

export default function NotesWidget() {
  const [notes, setNotes] = useState('');
  const [editing, setEditing] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setNotes(getNotes()); }, []);

  function handleChange(val: string) {
    setNotes(val);
    // Auto-save with debounce
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveNotes(val), 600);
  }

  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current); }, []);

  const mono: React.CSSProperties = { fontFamily: 'JetBrains Mono, monospace' };

  return (
    <div>
      <div className="section-label">Notes</div>
      {editing ? (
        <div>
          <textarea
            value={notes}
            onChange={e => handleChange(e.target.value)}
            autoFocus
            rows={8}
            placeholder="Freeform notes — auto-saved..."
            style={{ resize: 'vertical', minHeight: 120, fontFamily: 'DM Sans, sans-serif', fontSize: 13, lineHeight: 1.6 }}
          />
          <button onClick={() => setEditing(false)}
            style={{ ...mono, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'var(--red)', border: 'none', color: 'var(--paper)', padding: '6px 14px', cursor: 'pointer', marginTop: 8, borderRadius: 3 }}>
            Done
          </button>
        </div>
      ) : notes ? (
        <div onClick={() => setEditing(true)} style={{ cursor: 'text' }}>
          <div style={{ fontSize: 13, color: 'var(--paper2)', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {notes.length > 300 ? notes.slice(0, 300) + '...' : notes}
          </div>
          <button onClick={e => { e.stopPropagation(); setEditing(true); }}
            style={{ ...mono, fontSize: 10, color: 'var(--muted)', letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', background: 'none', border: 'none', padding: 0, marginTop: 8 }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--paper)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
            — edit
          </button>
        </div>
      ) : (
        <button onClick={() => setEditing(true)}
          style={{ background: 'rgba(232,65,42,0.04)', border: '1px dashed rgba(232,65,42,0.3)', padding: '14px 16px', width: '100%', color: 'var(--muted)', fontSize: 13, cursor: 'pointer', textAlign: 'left', fontFamily: 'DM Sans, sans-serif', transition: 'border-color .2s', borderRadius: 4 }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--red)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(232,65,42,0.3)'}>
          + Add a note...
        </button>
      )}
    </div>
  );
}
