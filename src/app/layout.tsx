import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UserDataLoader from '@/components/UserDataLoader';
import PWARegister from '@/components/PWARegister';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0F0F0F',
};

export const metadata: Metadata = {
  title: 'Hitboxd - Share Your Game Reviews',
  description: 'Rate, review, and share your favorite video games. Discover what others are playing.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Hitboxd',
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
        <meta name="apple-mobile-web-app-title" content="Hitboxd" />
      </head>
      <body className="bg-dark-bg text-dark-text">
        <PWARegister />
        <UserDataLoader />
        <Header />
        <main className="min-h-screen pb-20 md:pb-0">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
