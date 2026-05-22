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
  icon: string;
  city: string;
  humidity: number;
  wind: number;
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
  weatherApiKey: string;
  weatherCity: string;
  icalUrl: string;
  newsFeeds: string[];
  userName: string;
  focusIntention: string;
  focusDate: string;
}
