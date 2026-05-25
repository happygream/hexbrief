export interface NewsItem {
  title: string;
  link: string;
  source: string;
  pubDate?: string;
}

export async function fetchRssFeed(feedUrl: string): Promise<NewsItem[]> {
  // Use rss2json which handles CORS and returns clean JSON
  const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}&count=4&api_key=`;
  const res = await fetch(api);
  if (!res.ok) throw new Error('RSS fetch failed');
  const data = await res.json();
  if (data.status !== 'ok') throw new Error('RSS parse failed');

  return (data.items || []).slice(0, 4).map((item: Record<string, string>) => ({
    title: item.title?.trim() || 'Untitled',
    link: item.link || feedUrl,
    source: data.feed?.title || new URL(feedUrl).hostname.replace('www.', ''),
    pubDate: item.pubDate,
  }));
}

export async function fetchAllFeeds(feedUrls: string[]): Promise<NewsItem[]> {
  if (!feedUrls.length) return [];
  const results = await Promise.allSettled(feedUrls.map(fetchRssFeed));
  const items: NewsItem[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled') items.push(...r.value);
  }
  return items.slice(0, 10);
}
