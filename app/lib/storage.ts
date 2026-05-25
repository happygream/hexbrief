export interface Task {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
}

export interface Settings {
  weatherCity: string;
  icalUrl: string;
  newsFeeds: string[];
  userName: string;
  focusIntention: string;
  focusDate: string;
  onboardingDone: boolean;
}

export const defaultSettings: Settings = {
  weatherCity: '',
  icalUrl: '',
  newsFeeds: [],
  userName: '',
  focusIntention: '',
  focusDate: '',
  onboardingDone: false,
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

export function getTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEYS.TASKS);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
}
