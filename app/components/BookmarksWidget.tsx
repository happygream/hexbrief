'use client';
import { useState, useEffect } from 'react';

interface Bookmark { id: string; title: string; url: string; }

function getBookmarks(): Bookmark[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('hexbrief_bookmarks') || '[]'); } catch { return []; }
}
function saveBookmarks(b: Bookmark[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('hexbrief_bookmarks', JSON.stringify(b));
}

export default function BookmarksWidget() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [adding, setAdding] = useState(false);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');

  useEffect(() => { setBookmarks(getBookmarks()); }, []);

  function add() {
    if (!url.trim()) return;
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http')) cleanUrl = 'https://' + cleanUrl;
    const label = title.trim() || new URL(cleanUrl).hostname.replace('www.', '');
    const next = [...bookmarks, { id: Date.now().toString(), title: label, url: cleanUrl }];
    setBookmarks(next); saveBookmarks(next);
    setUrl(''); setTitle(''); setAdding(false);
  }

  function remove(id: string) {
    const next = bookmarks.filter(b => b.id !== id);
    setBookmarks(next); saveBookmarks(next);
  }

  const mono: React.CSSProperties = { fontFamily: 'JetBrains Mono, monospace' };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="section-label" style={{ margin: 0, flex: 1 }}>Bookmarks</div>
        <button onClick={() => setAdding(true)} style={{ ...mono, fontSize: 10, letterSpacing: '0.1em', color: 'var(--muted)', background: 'none', border: '1px solid var(--rule2)', padding: '3px 8px', cursor: 'pointer', textTransform: 'uppercase', borderRadius: 3 }}>+ Add</button>
      </div>

      {adding && (
        <div style={{ marginBottom: 12, padding: 12, background: 'var(--ink3)', border: '1px solid var(--rule)', borderRadius: 4 }}>
          <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." style={{ marginBottom: 6 }} autoFocus />
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Label (optional)" style={{ marginBottom: 8 }}
            onKeyDown={e => { if (e.key === 'Enter') add(); if (e.key === 'Escape') { setAdding(false); setUrl(''); setTitle(''); } }} />
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={add} style={{ ...mono, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'var(--red)', border: 'none', color: 'var(--paper)', padding: '5px 12px', cursor: 'pointer', borderRadius: 3 }}>Add</button>
            <button onClick={() => { setAdding(false); setUrl(''); setTitle(''); }} style={{ ...mono, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'transparent', border: '1px solid var(--rule2)', color: 'var(--muted)', padding: '5px 12px', cursor: 'pointer', borderRadius: 3 }}>Cancel</button>
          </div>
        </div>
      )}

      {bookmarks.length === 0 && !adding && (
        <div style={{ ...mono, fontSize: 10, color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>No bookmarks yet</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {bookmarks.map(b => (
          <BookmarkRow key={b.id} bookmark={b} onRemove={remove} />
        ))}
      </div>
    </div>
  );
}

function BookmarkRow({ bookmark, onRemove }: { bookmark: Bookmark; onRemove: (id: string) => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--rule)' }}>
      <img src={`https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}&sz=16`} alt="" width={14} height={14} style={{ flexShrink: 0, opacity: 0.7 }} onError={e => { e.currentTarget.style.display = 'none'; }} />
      <a href={bookmark.url} target="_blank" rel="noopener noreferrer"
        style={{ fontSize: 13, color: hovered ? 'var(--red)' : 'var(--paper)', fontWeight: 400, flex: 1, textDecoration: 'none', transition: 'color .15s', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {bookmark.title}
      </a>
      <button onClick={() => onRemove(bookmark.id)}
        style={{ visibility: hovered ? 'visible' : 'hidden', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 2px', fontFamily: 'monospace' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>×</button>
    </div>
  );
}
