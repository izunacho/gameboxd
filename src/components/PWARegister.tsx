'use client';

import { useEffect } from 'react';

/**
 * Registers the service worker (production only — during development
 * a cached app would hide your code changes).
 */
export default function PWARegister() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('Service Worker registration failed:', err);
      });
    }
  }, []);

  return null;
}
