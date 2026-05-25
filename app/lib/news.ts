export interface NewsItem {
  title: string;
  link: string;
  source: string;
  pubDate?: string;
  image?: string;
  description?: string;
}

declare global {
  interface Window {
    electronAPI?: {
      isElectron?: boolean;
      fetchRSS?: (urls: string[]) => Promise<NewsItem[]>;
    };
  }
}

// Parse RSS XML in the browser (web fallback)
function parseXML(xml: string, feedUrl: string): NewsItem[] {
  let sourceName = feedUrl;
  try { sourceName = new URL(feedUrl).hostname.replace('www.', '').replace('feeds.', ''); } catch {}

  const items: NewsItem[] = [];
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');

    function extractImage(el: Element): string {
      const mt = el.getElementsByTagNameNS('http://search.yahoo.com/mrss/', 'thumbnail')[0];
      if (mt?.getAttribute('url')) return mt.getAttribute('url')!;
      const mc = el.getElementsByTagNameNS('http://search.yahoo.com/mrss/', 'content')[0];
      if (mc?.getAttribute('url') && mc.getAttribute('medium') === 'image') return mc.getAttribute('url')!;
      const enc = el.querySelector('enclosure');
      if (enc?.getAttribute('type')?.startsWith('image/')) return enc.getAttribute('url') || '';
      const desc = el.querySelector('description')?.textContent || '';
      const m = desc.match(/<img[^>]+src=["']([^"']+)["']/i);
      return m ? m[1] : '';
    }

    const rssItems = doc.querySelectorAll('item');
    if (rssItems.length > 0) {
      Array.from(rssItems).slice(0, 4).forEach(item => {
        const title = item.querySelector('title')?.textContent?.trim() || '';
        const link = item.querySelector('link')?.textContent?.trim() || item.querySelector('guid')?.textContent?.trim() || '';
        const rawDesc = item.querySelector('description')?.textContent || '';
        const description = rawDesc.replace(/<[^>]+>/g, '').trim().slice(0, 140);
        const image = extractImage(item);
        if (title && link) items.push({ title, link, source: sourceName, image, description });
      });
      return items;
    }

    Array.from(doc.querySelectorAll('entry')).slice(0, 4).forEach(entry => {
      const title = entry.querySelector('title')?.textContent?.trim() || '';
      const link = entry.querySelector('link[rel="alternate"]')?.getAttribute('href') || entry.querySelector('link')?.getAttribute('href') || '';
      const image = extractImage(entry);
      if (title && link) items.push({ title, link, source: sourceName, image, description: '' });
    });
  } catch {}
  return items;
}

async function fetchViaCORSProxy(feedUrl: string): Promise<NewsItem[]> {
  let sourceName = feedUrl;
  try { sourceName = new URL(feedUrl).hostname.replace('www.', '').replace('feeds.', ''); } catch {}

  const proxies = [
    `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(feedUrl)}`,
  ];

  for (const proxy of proxies) {
    try {
      const res = await fetch(proxy, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      let xml = '';
      if (proxy.includes('allorigins')) {
        const json = await res.json();
        xml = json.contents || '';
      } else {
        xml = await res.text();
      }
      if (xml.length > 100) {
        const items = parseXML(xml, feedUrl);
        if (items.length > 0) return items;
      }
    } catch { continue; }
  }
  return [];
}

export async function fetchAllFeeds(feedUrls: string[]): Promise<NewsItem[]> {
  if (!feedUrls.length) return [];

  // In Electron — use IPC to fetch natively (no CORS)
  if (typeof window !== 'undefined' && window.electronAPI?.fetchRSS) {
    try {
      return await window.electronAPI.fetchRSS(feedUrls);
    } catch {}
  }

  // Web fallback — CORS proxy
  const results = await Promise.allSettled(feedUrls.map(fetchViaCORSProxy));
  const items: NewsItem[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled') items.push(...r.value);
  }
  return items.slice(0, 12);
}
