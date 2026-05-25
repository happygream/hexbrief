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
