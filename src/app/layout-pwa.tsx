// Add this to your layout.tsx after the opening <html> tag to register the service worker
'use client';

import { useEffect } from 'react';

export function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }

    // Install prompt
    let deferredPrompt: BeforeInstallPromptEvent | null = null;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      // Show install button to user
      const installButton = document.getElementById('install-button');
      if (installButton) {
        installButton.style.display = 'block';
      }
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      const installButton = document.getElementById('install-button');
      if (installButton) {
        installButton.style.display = 'none';
      }
    });
  }, []);

  return <>{children}</>;
}
