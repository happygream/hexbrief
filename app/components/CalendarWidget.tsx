'use client';
import { useState, useEffect } from 'react';
import { CalendarEvent, fetchCalendarEvents } from '@/app/lib/calendar';

function fmt(d: Date) { return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); }

export default function CalendarWidget({ icalUrl }: { icalUrl: string }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!icalUrl) { setLoading(false); return; }
    fetchCalendarEvents(icalUrl).then(setEvents).finally(() => setLoading(false));
  }, [icalUrl]);

  return (
    <div>
      <div className="section-label">Schedule</div>
      {!icalUrl && <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Add iCal URL in settings</div>}
      {loading && icalUrl && [...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 36, marginBottom: 6 }} />)}
      {!loading && events.length === 0 && icalUrl && <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Nothing scheduled today</div>}
      {events.map(ev => (
        <div key={ev.id} style={{ display: 'flex', gap: 12, padding: '9px 0', borderBottom: '1px solid var(--rule)', alignItems: 'flex-start' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--red)', letterSpacing: '0.06em', flexShrink: 0, paddingTop: 2, minWidth: 38 }}>
            {ev.allDay ? 'ALL' : fmt(ev.start)}
          </div>
          <div>
            <div style={{ fontSize: 14, color: 'var(--paper)', fontWeight: 300, lineHeight: 1.35 }}>{ev.title}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
