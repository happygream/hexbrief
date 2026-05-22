import { CalendarEvent } from '@/app/types';

function parseICalDate(str: string): Date {
  // Handle TZID format: DTSTART;TZID=...:20240521T090000
  const clean = str.split(':').pop() ?? str;
  if (clean.includes('T')) {
    const y = clean.slice(0, 4);
    const mo = clean.slice(4, 6);
    const d = clean.slice(6, 8);
    const h = clean.slice(9, 11);
    const mi = clean.slice(11, 13);
    const s = clean.slice(13, 15);
    return new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}`);
  }
  return new Date(`${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}`);
}

export async function fetchCalendarEvents(icalUrl: string): Promise<CalendarEvent[]> {
  const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(icalUrl)}`;
  const res = await fetch(proxy);
  if (!res.ok) throw new Error('Calendar fetch failed');
  const data = await res.json();
  const text: string = data.contents;
  return parseICalText(text);
}

export function parseICalText(text: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const lines = text.replace(/\r\n /g, '').replace(/\r\n\t/g, '').split('\r\n');

  let inEvent = false;
  let current: Partial<CalendarEvent> & { dtstart?: string; dtend?: string } = {};

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 2);

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') { inEvent = true; current = {}; continue; }
    if (line === 'END:VEVENT') {
      if (inEvent && current.dtstart) {
        const start = parseICalDate(current.dtstart);
        const end = current.dtend ? parseICalDate(current.dtend) : start;
        const allDay = !current.dtstart.includes('T');
        if (start >= today && start < tomorrow) {
          events.push({
            id: Math.random().toString(36).slice(2),
            title: current.title ?? 'Untitled',
            start,
            end,
            allDay,
          });
        }
      }
      inEvent = false;
      continue;
    }
    if (!inEvent) continue;

    if (line.startsWith('SUMMARY:')) current.title = line.slice(8);
    if (line.startsWith('DTSTART')) current.dtstart = line;
    if (line.startsWith('DTEND')) current.dtend = line;
  }

  return events.sort((a, b) => a.start.getTime() - b.start.getTime());
}
