import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HexBrief — Your morning dashboard',
  description: 'A clean, open-source morning dashboard. Weather, tasks, news, calendar — no accounts, no tracking.',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
