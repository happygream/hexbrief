import { NewsItem } from '@/app/types';

export async function fetchRssFeed(feedUrl: string): Promise<NewsItem[]> {
  const proxy = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}&count=5`;
  const res = await fetch(proxy);
  if (!res.ok) throw new Error('RSS fetch failed');
  const data = await res.json();
  if (data.status !== 'ok') throw new Error('RSS parse failed');

  return data.items.slice(0, 5).map((item: Record<string, string>) => ({
    title: item.title,
    link: item.link,
    source: data.feed?.title ?? new URL(feedUrl).hostname,
    pubDate: item.pubDate,
  }));
}

export async function fetchAllFeeds(feedUrls: string[]): Promise<NewsItem[]> {
  const results = await Promise.allSettled(feedUrls.map(fetchRssFeed));
  const items: NewsItem[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      items.push(...result.value);
    }
  }
  return items.slice(0, 8);
}
