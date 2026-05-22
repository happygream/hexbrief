'use client';
import { useState, useEffect } from 'react';
import { CalendarEvent } from '@/app/types';
import { fetchCalendarEvents } from '@/app/lib/calendar';

interface Props {
  icalUrl: string;
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default function CalendarWidget({ icalUrl }: Props) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!icalUrl) { setLoading(false); return; }
    fetchCalendarEvents(icalUrl)
      .then(data => { setEvents(data); setError(false); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [icalUrl]);

  if (!icalUrl) return (
    <div className="card fade-up delay-3" style={{ opacity: 0.5 }}>
      <div style={{ color: 'var(--muted)', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
        Calendar
      </div>
      <div style={{ color: 'var(--muted)', fontSize: '13px' }}>Add an iCal URL in settings</div>
    </div>
  );

  return (
    <div className="card fade-up delay-3">
      <div style={{ color: 'var(--muted)', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
        Today's schedule
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '36px' }} />
          ))}
        </div>
      )}

      {error && <div style={{ color: 'var(--red)', fontSize: '13px' }}>Could not load calendar</div>}

      {!loading && !error && events.length === 0 && (
        <div style={{ color: 'var(--muted)', fontSize: '13px' }}>Nothing scheduled today.</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {events.map(event => (
          <div key={event.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 12px',
            background: 'var(--surface2)',
            borderRadius: '8px',
            borderLeft: '2px solid var(--accent)',
          }}>
            <div style={{ flexShrink: 0 }}>
              {event.allDay ? (
                <span style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.04em' }}>ALL DAY</span>
              ) : (
                <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 500 }}>
                  {formatTime(event.start)}
                </span>
              )}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 400 }}>
              {event.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
