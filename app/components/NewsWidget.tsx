'use client';
import { useState, useEffect } from 'react';
import { NewsItem } from '@/app/types';
import { fetchAllFeeds } from '@/app/lib/news';

interface Props {
  feeds: string[];
}

export default function NewsWidget({ feeds }: Props) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!feeds.length) { setLoading(false); return; }
    fetchAllFeeds(feeds)
      .then(data => { setItems(data); setError(false); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [feeds.join(',')]);

  return (
    <div className="card fade-up delay-5">
      <div style={{ color: 'var(--muted)', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
        Headlines
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div className="skeleton" style={{ height: '14px', width: '90%', marginBottom: '6px' }} />
              <div className="skeleton" style={{ height: '11px', width: '40%' }} />
            </div>
          ))}
        </div>
      )}

      {error && <div style={{ color: 'var(--red)', fontSize: '13px' }}>Could not load news</div>}

      {!loading && !error && items.length === 0 && (
        <div style={{ color: 'var(--muted)', fontSize: '13px' }}>No news feeds configured</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {items.map((item, i) => (
          <a
            key={i}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              padding: '10px 0',
              borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none',
              textDecoration: 'none',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget.querySelector('.headline') as HTMLElement).style.color = 'var(--accent)';
            }}
            onMouseLeave={e => {
              (e.currentTarget.querySelector('.headline') as HTMLElement).style.color = 'var(--text)';
            }}
          >
            <div className="headline" style={{
              fontSize: '13px',
              color: 'var(--text)',
              lineHeight: 1.4,
              marginBottom: '4px',
              fontWeight: 400,
              transition: 'color 0.15s',
            }}>
              {item.title}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.03em' }}>
              {item.source}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
