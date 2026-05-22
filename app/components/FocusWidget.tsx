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
    if (s.focusDate === today) {
      setIntention(s.focusIntention);
    } else {
      setIntention('');
      saveSettings({ ...s, focusIntention: '', focusDate: today });
    }
  }, []);

  function save() {
    const s = getSettings();
    const today = new Date().toDateString();
    saveSettings({ ...s, focusIntention: draft, focusDate: today });
    setIntention(draft);
    setEditing(false);
  }

  function startEdit() {
    setDraft(intention);
    setEditing(true);
  }

  return (
    <div className="card fade-up delay-3">
      <div style={{ color: 'var(--muted)', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
        Today's focus
      </div>

      {editing ? (
        <div>
          <input
            type="text"
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
            placeholder="What matters most today?"
            style={{ marginBottom: '10px' }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn" onClick={save}>Set intention</button>
            <button className="btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : intention ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{
            fontSize: '17px',
            fontFamily: 'DM Serif Display',
            color: 'var(--accent)',
            fontStyle: 'italic',
            lineHeight: 1.4,
          }}>
            "{intention}"
          </div>
          <button className="btn-ghost" onClick={startEdit} style={{ flexShrink: 0 }}>Edit</button>
        </div>
      ) : (
        <button
          onClick={startEdit}
          style={{
            background: 'var(--accent-glow)',
            border: '1px dashed rgba(200,169,110,0.3)',
            borderRadius: '8px',
            padding: '14px 16px',
            width: '100%',
            color: 'var(--muted)',
            fontSize: '14px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.2s',
            fontFamily: 'DM Sans',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(200,169,110,0.3)')}
        >
          + Set today's focus intention...
        </button>
      )}
    </div>
  );
}
