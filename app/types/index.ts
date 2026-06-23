export interface Task {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
  dueDate?: string;
}

export interface WeatherData {
  temp: number;
  feels_like: number;
  description: string;
  weatherCode: number;
  city: string;
  country: string;
  humidity: number;
  wind: number;
  pressure: number;
  visibility: number;
}

export interface NewsItem {
  title: string;
  link: string;
  source: string;
  pubDate?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
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

declare global {
  interface Window {
    electronAPI?: {
      platform?: string;
      isElectron?: boolean;
      fetchRSS?: (urls: string[]) => Promise<unknown[]>;
      setAutoStart?: (enable: boolean) => Promise<boolean>;
      getAutoStart?: () => Promise<boolean>;
      notify?: (title: string, body: string) => Promise<void>;
      windowMinimize?: () => void;
      windowMaximize?: () => void;
      windowClose?: () => void;
      windowIsMaximized?: () => Promise<boolean>;
      onMaximizeChange?: (cb: (isMax: boolean) => void) => () => void;
    };
  }
}

export {};
