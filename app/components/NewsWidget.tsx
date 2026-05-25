'use client';
import { useState, useEffect } from 'react';
import { fetchAllFeeds } from '@/app/lib/news';

interface NewsItem { title: string; link: string; source: string; }

export default function NewsWidget({ feeds }: { feeds: string[] }) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!feeds.length) { setLoading(false); return; }
    fetchAllFeeds(feeds).then(setItems).finally(() => setLoading(false));
  }, [feeds.join(',')]);

  return (
    <div>
      <div className="section-label">Headlines</div>
      {loading && [...Array(5)].map((_, i) => (
        <div key={i} style={{ padding: '11px 0', borderBottom: '1px solid var(--rule)' }}>
          <div className="skeleton" style={{ height: 13, width: '90%', marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 10, width: '30%' }} />
        </div>
      ))}
      {!loading && !feeds.length && (
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '16px 0' }}>No sources selected</div>
      )}
      {!loading && items.map((item, i) => (
        <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
          style={{ display: 'block', padding: '11px 0', borderBottom: i < items.length - 1 ? '1px solid var(--rule)' : 'none', textDecoration: 'none', color: 'inherit' }}
          onMouseEnter={e => { (e.currentTarget.querySelector('.nt') as HTMLElement).style.color = 'var(--red)'; }}
          onMouseLeave={e => { (e.currentTarget.querySelector('.nt') as HTMLElement).style.color = 'var(--paper)'; }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 11, color: 'var(--dim)', letterSpacing: '0.08em', marginBottom: 3 }}>{String(i + 1).padStart(2, '0')}</div>
          <div className="nt" style={{ fontSize: 14, color: 'var(--paper)', fontWeight: 300, lineHeight: 1.42, transition: 'color .15s' }}>{item.title}</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4 }}>{item.source}</div>
        </a>
      ))}
    </div>
  );
}
