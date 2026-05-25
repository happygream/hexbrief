export interface Task {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
  dueDate?: string;     // ISO date string — tasks roll forward if not done
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
  newsFeeds: DEFAULT_NEWS_FEEDS,  // pre-selected by default
  userName: '',
  focusIntention: '',
  focusDate: '',
  onboardingDone: false,
  installedVersion: APP_VERSION,
  autoStart: false,
};

const KEYS = { SETTINGS: 'hexbrief_settings', TASKS: 'hexbrief_tasks' };

export function getSettings(): Settings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch { return defaultSettings; }
}

export function saveSettings(s: Settings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(s));
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

// Tasks — incomplete tasks from previous days roll forward to today
export function getTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEYS.TASKS);
    if (!raw) return [];
    const tasks: Task[] = JSON.parse(raw);
    const today = new Date().toDateString();

    // Roll forward: tasks with no dueDate or a past dueDate that aren't done
    return tasks.map(t => {
      if (!t.done && t.dueDate) {
        const due = new Date(t.dueDate).toDateString();
        if (due !== today) {
          // Roll forward to today
          return { ...t, dueDate: new Date().toISOString().split('T')[0] };
        }
      }
      return t;
    });
  } catch { return []; }
}

export function saveTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
}
