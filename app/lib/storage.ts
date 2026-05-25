export interface Task {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
  dueDate?: string;
  completedDate?: string;
}

export interface Settings {
  weatherCity: string;
  weatherLat?: number;
  weatherLon?: number;
  icalUrl: string;
  newsFeeds: string[];
  userName: string;
  focusIntention: string;
  focusDate: string;
  onboardingDone: boolean;
  installedVersion: string;
  autoStart: boolean;
}

export const APP_VERSION = '1.0.0';

export const DEFAULT_NEWS_FEEDS = [
  'https://feeds.bbci.co.uk/news/rss.xml',
  'https://hnrss.org/frontpage',
];

export const defaultSettings: Settings = {
  weatherCity: '',
  icalUrl: '',
  newsFeeds: DEFAULT_NEWS_FEEDS,
  userName: '',
  focusIntention: '',
  focusDate: '',
  onboardingDone: false,
  installedVersion: APP_VERSION,
  autoStart: false,
};

const KEYS = { SETTINGS: 'hexbrief_settings', TASKS: 'hexbrief_tasks' };

// Sanitise a string field — strip null bytes and cap length
function sanitiseStr(v: unknown, maxLen = 500): string {
  if (typeof v !== 'string') return '';
  return v.replace(/\0/g, '').slice(0, maxLen);
}

function sanitiseUrl(v: unknown): string {
  if (typeof v !== 'string') return '';
  try {
    const u = new URL(v);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return '';
    return v.slice(0, 2048);
  } catch { return ''; }
}

function sanitiseBool(v: unknown, fallback: boolean): boolean {
  return typeof v === 'boolean' ? v : fallback;
}

function sanitiseNumber(v: unknown): number | undefined {
  if (typeof v !== 'number' || !isFinite(v)) return undefined;
  return v;
}

// Validate and sanitise settings from localStorage
function sanitiseSettings(raw: unknown): Settings {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return defaultSettings;
  const r = raw as Record<string, unknown>;

  // Validate newsFeeds — must be an array of strings, each a valid URL
  const rawFeeds = Array.isArray(r.newsFeeds) ? r.newsFeeds : [];
  const newsFeeds = rawFeeds
    .map(sanitiseUrl)
    .filter(Boolean)
    .slice(0, 50) as string[];

  return {
    weatherCity:     sanitiseStr(r.weatherCity, 100),
    weatherLat:      sanitiseNumber(r.weatherLat),
    weatherLon:      sanitiseNumber(r.weatherLon),
    icalUrl:         sanitiseUrl(r.icalUrl),
    newsFeeds:       newsFeeds.length ? newsFeeds : DEFAULT_NEWS_FEEDS,
    userName:        sanitiseStr(r.userName, 100),
    focusIntention:  sanitiseStr(r.focusIntention, 500),
    focusDate:       sanitiseStr(r.focusDate, 50),
    onboardingDone:  sanitiseBool(r.onboardingDone, false),
    installedVersion:sanitiseStr(r.installedVersion, 20),
    autoStart:       sanitiseBool(r.autoStart, false),
  };
}

// Validate and sanitise a single task
function sanitiseTask(raw: unknown): Task | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  const id = sanitiseStr(r.id, 50);
  const text = sanitiseStr(r.text, 1000);
  if (!id || !text) return null;
  return {
    id,
    text,
    done: sanitiseBool(r.done, false),
    createdAt: sanitiseStr(r.createdAt, 50),
    dueDate: r.dueDate ? sanitiseStr(r.dueDate, 20) : undefined,
    completedDate: r.completedDate ? sanitiseStr(r.completedDate, 50) : undefined,
  };
}

export function getSettings(): Settings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    if (!raw) return defaultSettings;
    // Use null prototype to prevent prototype pollution
    const parsed = JSON.parse(raw);
    return sanitiseSettings(parsed);
  } catch { return defaultSettings; }
}

export function saveSettings(s: Settings): void {
  if (typeof window === 'undefined') return;
  // Sanitise before saving too
  const clean = sanitiseSettings(s);
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(clean));
}

export function resetOnboarding(): void {
  if (typeof window === 'undefined') return;
  const s = getSettings();
  saveSettings({ ...s, onboardingDone: false, newsFeeds: DEFAULT_NEWS_FEEDS });
}

export function resetWidgets(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('hexbrief_widgets');
}

export function getTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEYS.TASKS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const today = new Date().toDateString();
    const tasks = parsed
      .map(sanitiseTask)
      .filter((t): t is Task => t !== null)
      .slice(0, 500); // cap number of tasks

    // Roll forward incomplete tasks from past days
    return tasks.map(t => {
      if (!t.done && t.dueDate) {
        const due = new Date(t.dueDate).toDateString();
        if (due !== today) {
          return { ...t, dueDate: new Date().toISOString().split('T')[0] };
        }
      }
      return t;
    });
  } catch { return []; }
}

export function saveTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  if (!Array.isArray(tasks)) return;
  const clean = tasks
    .map(sanitiseTask)
    .filter((t): t is Task => t !== null)
    .slice(0, 500);
  localStorage.setItem(KEYS.TASKS, JSON.stringify(clean));
}
