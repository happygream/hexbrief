# HexBrief

A clean, open-source personal morning dashboard. No accounts, no tracking, no backend.

## What it does

Open HexBrief once each morning and get:

- Current time and personalised greeting
- Live weather for your city
- Today's calendar events from any iCal source
- Your tasks for the day
- Today's focus intention
- Top headlines from your chosen RSS feeds

Everything is stored locally in your browser. Nothing is sent anywhere.

---

## Self-hosting

### Docker

```bash
docker run -p 3000:3000 ghcr.io/yourusername/hexbrief:latest
```

### Node

```bash
git clone https://github.com/yourusername/hexbrief
cd hexbrief
npm install
npm run build
npm start
```

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/hexbrief)

---

## Configuration

All settings are configured in-app. No environment variables needed.

| Setting | Description |
|---|---|
| Your name | Personalises the greeting |
| OpenWeatherMap API key | Free at openweathermap.org |
| City | City name for weather |
| iCal URL | Google/Apple/Outlook calendar link |
| RSS feeds | News sources (BBC, HN, etc.) |

---

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- PWA — installable on mobile and desktop
- No backend, no database, no auth

---

## Roadmap

- v1.0 — Core widgets
- v1.1 — Mobile polish, PWA icons
- v1.2 — Optional PocketBase sync for cross-device
- v1.3 — Theme options
- v2.0 — Browser extension sidebar

---

## Licence

MIT. Part of the [Hex](https://hexvault.co.uk) ecosystem.
