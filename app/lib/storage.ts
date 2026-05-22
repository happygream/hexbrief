import { Settings, Task } from '@/app/types';

const KEYS = {
  SETTINGS: 'hexbrief_settings',
  TASKS: 'hexbrief_tasks',
};

export const defaultSettings: Settings = {
  weatherApiKey: '',
  weatherCity: '',
  icalUrl: '',
  newsFeeds: [
    'https://feeds.bbci.co.uk/news/rss.xml',
    'https://hnrss.org/frontpage',
  ],
  userName: '',
  focusIntention: '',
  focusDate: '',
};

export function getSettings(): Settings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: Settings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

export function getTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEYS.TASKS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
}

export function getTodaysTasks(tasks: Task[]): Task[] {
  const today = new Date().toDateString();
  return tasks.filter(t => {
    if (t.dueDate) return new Date(t.dueDate).toDateString() === today;
    return !t.done;
  });
}
