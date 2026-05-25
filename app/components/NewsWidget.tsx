'use client';
import { useState, useEffect } from 'react';
import { fetchAllFeeds } from '@/app/lib/news';
import type { NewsItem } from '@/app/lib/news';

export default function NewsWidget({ feeds }: { feeds: string[] }) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!feeds.length) { setLoading(false); return; }
    setLoading(true);
    fetchAllFeeds(feeds)
      .then(setItems)
      .finally(() => setLoading(false));
  }, [feeds.join(',')]);

  const mono = { fontFamily: 'JetBrains Mono, monospace' };

  return (
    <div>
      <div className="section-label">Headlines</div>

      {loading && [...Array(4)].map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--rule)' }}>
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: 15, width: '90%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 13, width: '70%', marginBottom: 6 }} />
            <div className="skeleton" style={{ height: 11, width: '30%' }} />
          </div>
          <div className="skeleton" style={{ width: 60, height: 60, flexShrink: 0, borderRadius: 4 }} />
        </div>
      ))}

      {!loading && !feeds.length && (
        <div style={{ ...mono, fontSize: 12, color: 'var(--dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          No sources — add in Configure → News
        </div>
      )}

      {!loading && feeds.length > 0 && items.length === 0 && (
        <div style={{ ...mono, fontSize: 12, color: 'var(--dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Could not reach feeds
        </div>
      )}

      <div>
        {items.map((item, i) => (
          <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: i < items.length - 1 ? '1px solid var(--rule)' : 'none', textDecoration: 'none', color: 'inherit', alignItems: 'flex-start' }}
            onMouseEnter={e => { const t = e.currentTarget.querySelector('.nt') as HTMLElement; if (t) t.style.color = 'var(--red)'; }}
            onMouseLeave={e => { const t = e.currentTarget.querySelector('.nt') as HTMLElement; if (t) t.style.color = 'var(--paper)'; }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...mono, fontSize: 11, color: 'var(--dim)', letterSpacing: '0.06em', marginBottom: 4, fontWeight: 400 }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="nt" style={{ fontSize: 15, color: 'var(--paper)', fontWeight: 500, lineHeight: 1.4, transition: 'color .15s', marginBottom: item.description ? 5 : 0 }}>
                {item.title}
              </div>
              {item.description && (
                <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.45, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {item.description}
                </div>
              )}
              <div style={{ ...mono, fontSize: 11, color: 'var(--dim)', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 5 }}>
                {item.source}
              </div>
            </div>
            {item.image && (
              <div style={{ width: 64, height: 64, flexShrink: 0, overflow: 'hidden', background: 'var(--ink3)', borderRadius: 6 }}>
                <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={e => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none'; }} />
              </div>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
