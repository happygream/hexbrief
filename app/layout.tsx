import type { Metadata } from 'next';
import './globals.css';
import TitleBar from './components/TitleBar';

export const metadata: Metadata = {
  title: 'HexBrief — Your morning dashboard',
  description: 'A clean, open-source morning dashboard. Weather, tasks, news, calendar — no accounts, no tracking.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TitleBar />
        {children}
      </body>
    </html>
  );
}
