'use client';
import { useState, useEffect } from 'react';
import { fetchAllFeeds } from '@/app/lib/news';
import type { NewsItem } from '@/app/lib/news';

export default function NewsWidget({ feeds }: { feeds: string[] }) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!feeds.length) { setLoading(false); return; }
    setLoading(true);
    fetchAllFeeds(feeds)
      .then(data => { setItems(data); setError(false); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [feeds.join(',')]);

  return (
    <div>
      <div className="section-label">Headlines</div>

      {loading && [...Array(4)].map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, padding: '12px 0', borderBottom: '1px solid var(--rule)' }}>
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: 13, width: '90%', marginBottom: 6 }} />
            <div className="skeleton" style={{ height: 11, width: '60%', marginBottom: 4 }} />
            <div className="skeleton" style={{ height: 10, width: '30%' }} />
          </div>
          <div className="skeleton" style={{ width: 56, height: 56, flexShrink: 0 }} />
        </div>
      ))}

      {!loading && error && (
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--red)', letterSpacing: '0.08em' }}>Could not load feeds</div>
      )}

      {!loading && !feeds.length && (
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '12px 0' }}>
          No sources — add in Configure → News
        </div>
      )}

      {!loading && feeds.length > 0 && items.length === 0 && !error && (
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '12px 0' }}>
          Could not reach feeds — check connection
        </div>
      )}

      <div>
        {items.map((item, i) => (
          <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < items.length - 1 ? '1px solid var(--rule)' : 'none', textDecoration: 'none', color: 'inherit', alignItems: 'flex-start' }}
            onMouseEnter={e => {
              const t = e.currentTarget.querySelector('.nt') as HTMLElement;
              if (t) t.style.color = 'var(--red)';
            }}
            onMouseLeave={e => {
              const t = e.currentTarget.querySelector('.nt') as HTMLElement;
              if (t) t.style.color = 'var(--paper)';
            }}>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 11, color: 'var(--dim)', letterSpacing: '0.08em', marginBottom: 3 }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="nt" style={{ fontSize: 14, color: 'var(--paper)', fontWeight: 400, lineHeight: 1.42, transition: 'color .15s', marginBottom: item.description ? 4 : 0 }}>
                {item.title}
              </div>
              {item.description && (
                <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4,  overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {item.description}
                </div>
              )}
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 5 }}>
                {item.source}
              </div>
            </div>

            {item.image && (
              <div style={{ width: 60, height: 60, flexShrink: 0, overflow: 'hidden', background: 'var(--ink3)', border: '1px solid var(--rule)' }}>
                <img
                  src={item.image}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={e => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none'; }}
                />
              </div>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
