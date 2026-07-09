import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/Header';
import UserDataLoader from '@/components/UserDataLoader';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#00D084',
};

export const metadata: Metadata = {
  title: 'Gameboxd - Share Your Game Reviews',
  description: 'Rate, review, and share your favorite video games. Discover what others are playing.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Gameboxd',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Gameboxd" />
      </head>
      <body className="bg-dark-bg text-dark-text">
        <UserDataLoader />
        <Header />
        <main className="min-h-screen pb-20 md:pb-0">
          {children}
        </main>
      </body>
    </html>
  );
}
