'use client';
import { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '@/app/lib/storage';

export default function FocusWidget() {
  const [intention, setIntention] = useState('');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    const s = getSettings();
    const today = new Date().toDateString();
    if (s.focusDate === today) setIntention(s.focusIntention);
    else {
      setIntention('');
      saveSettings({ ...s, focusIntention: '', focusDate: today });
    }
  }, []);

  function save() {
    const s = getSettings();
    saveSettings({ ...s, focusIntention: draft, focusDate: new Date().toDateString() });
    setIntention(draft);
    setEditing(false);
  }

  return (
    <div>
      <div className="section-label">Intention</div>
      {editing ? (
        <div>
          <input
            type="text" autoFocus value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
            placeholder="What matters most today?"
            style={{ marginBottom: 10, fontFamily: 'Cormorant Garamond, serif', fontSize: 15 }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={save} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'var(--red)', border: 'none', color: 'var(--paper)', padding: '7px 14px', cursor: 'pointer' }}>Set</button>
            <button onClick={() => setEditing(false)} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'transparent', border: '1px solid var(--rule2)', color: 'var(--muted)', padding: '7px 14px', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      ) : intention ? (
        <div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontStyle: 'italic', fontWeight: 300, color: 'var(--paper)', lineHeight: 1.45, marginBottom: 10 }}>
            <span style={{ color: 'var(--red)', fontSize: 26, lineHeight: 0, verticalAlign: '-5px', marginRight: 2 }}>"</span>
            {intention}
            <span style={{ color: 'var(--red)', fontSize: 26, lineHeight: 0, verticalAlign: '-5px', marginLeft: 2 }}>"</span>
          </div>
          <button onClick={() => { setDraft(intention); setEditing(true); }} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: 'var(--muted)', letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', transition: 'color .2s', background: 'none', border: 'none', padding: 0 }}>
            — edit intention
          </button>
        </div>
      ) : (
        <button
          onClick={() => { setDraft(''); setEditing(true); }}
          style={{ background: 'rgba(232,65,42,0.04)', border: '1px dashed rgba(232,65,42,0.3)', padding: '14px 16px', width: '100%', color: 'var(--muted)', fontSize: 14, cursor: 'pointer', textAlign: 'left', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', transition: 'border-color .2s' }}
        >
          + Set today's focus intention...
        </button>
      )}
    </div>
  );
}
