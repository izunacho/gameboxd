'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Smartphone,
  Monitor,
  Download,
  Share,
  MoreVertical,
  Plus,
  CheckCircle2,
  Bell,
  WifiOff,
  Zap,
} from 'lucide-react';
import { isStandalone } from '@/lib/pwa';

type Platform = 'ios' | 'android' | 'windows' | 'mac' | 'linux';

/** Chrome's install prompt event (not in the standard TS DOM types). */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PLATFORMS: {
  id: Platform;
  label: string;
  icon: typeof Smartphone;
  browser: string;
  steps: string[];
  note?: string;
}[] = [
  {
    id: 'ios',
    label: 'iPhone / iPad',
    icon: Smartphone,
    browser: 'Safari',
    steps: [
      'Open Hitboxd in Safari.',
      'Tap the Share button at the bottom of the screen (a square with an arrow pointing up).',
      'Scroll down the list and tap "Add to Home Screen".',
      'Tap "Add" in the top right corner.',
    ],
    note: 'On iPhone and iPad this only works in Safari — Chrome and Firefox cannot install apps. Push notifications also require the installed app, so this step is what unlocks alerts on your lock screen.',
  },
  {
    id: 'android',
    label: 'Android',
    icon: Smartphone,
    browser: 'Chrome',
    steps: [
      'Open Hitboxd in Chrome.',
      'Tap the three-dot menu in the top right corner.',
      'Tap "Install app" (it may say "Add to Home screen").',
      'Confirm by tapping "Install".',
    ],
    note: 'Chrome often shows an install banner at the bottom of the screen on its own — tapping that does the same thing.',
  },
  {
    id: 'windows',
    label: 'Windows',
    icon: Monitor,
    browser: 'Edge or Chrome',
    steps: [
      'Open Hitboxd in Microsoft Edge or Google Chrome.',
      'Look for the install icon in the address bar, on the right (a monitor with a down arrow).',
      'Click it, then click "Install".',
    ],
    note: 'No icon in the address bar? Open the browser menu and look for "Apps → Install this site as an app" in Edge, or "Cast, save and share → Install page as app" in Chrome.',
  },
  {
    id: 'mac',
    label: 'Mac',
    icon: Monitor,
    browser: 'Safari or Chrome',
    steps: [
      'In Safari: open Hitboxd, then choose File → "Add to Dock" from the menu bar.',
      'In Chrome or Edge: click the install icon in the address bar, then click "Install".',
    ],
    note: 'Adding to the Dock requires Safari 17 or newer (macOS Sonoma and later). On older versions, use Chrome or Edge instead.',
  },
  {
    id: 'linux',
    label: 'Linux',
    icon: Monitor,
    browser: 'Chrome, Chromium or Edge',
    steps: [
      'Open Hitboxd in Chrome, Chromium or Edge.',
      'Click the install icon in the address bar, on the right.',
      'Click "Install". The app is added to your applications menu.',
    ],
    note: 'Firefox on desktop cannot install web apps — use a Chromium-based browser for this.',
  },
];

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'windows';
  const ua = navigator.userAgent;
  // iPadOS 13+ reports itself as a Mac, so check for touch support too
  const isIpadOs = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  if (/iPad|iPhone|iPod/.test(ua) || isIpadOs) return 'ios';
  if (/Android/.test(ua)) return 'android';
  if (/Windows/.test(ua)) return 'windows';
  if (/Macintosh/.test(ua)) return 'mac';
  if (/Linux|X11/.test(ua)) return 'linux';
  return 'windows';
}

export default function InstallClient() {
  const [selected, setSelected] = useState<Platform>('windows');
  const [installed, setInstalled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    setSelected(detectPlatform());
    setInstalled(isStandalone());

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setInstallPrompt(null);
  };

  const platform = PLATFORMS.find((p) => p.id === selected) || PLATFORMS[0];
  const PlatformIcon = platform.icon;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-2">
        <Download className="w-8 h-8 text-primary" />
        <h1 className="text-4xl font-bold text-white">Install Hitboxd</h1>
      </div>
      <p className="text-dark-text mb-10">
        Add Hitboxd to your device and it behaves like any other app — its own icon, no
        address bar, and alerts when someone you follow posts a review.
      </p>

      {/* Already installed */}
      {installed && (
        <div className="card p-5 flex items-start gap-3 mb-10 border-primary/50">
          <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-white">You're using the installed app</p>
            <p className="text-dark-text text-sm mt-1">
              Nothing left to do here. Turn on push alerts from the bell icon in the header to
              get notified on your lock screen.
            </p>
          </div>
        </div>
      )}

      {/* One-click install where the browser supports it */}
      {!installed && installPrompt && (
        <div className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4 mb-10 border-primary/50">
          <div className="flex-grow">
            <p className="font-semibold text-white">Your browser can install it right now</p>
            <p className="text-dark-text text-sm mt-1">
              No manual steps needed — just click the button.
            </p>
          </div>
          <button onClick={handleInstall} className="btn-primary flex items-center gap-2 shrink-0">
            <Download className="w-4 h-4" />
            Install Hitboxd
          </button>
        </div>
      )}

      {/* Why install */}
      <div className="grid gap-4 sm:grid-cols-3 mb-12">
        <div className="card p-5">
          <Bell className="w-5 h-5 text-primary mb-2" />
          <h2 className="font-semibold text-white mb-1">Push alerts</h2>
          <p className="text-dark-text text-sm">
            Get notified when someone follows you or posts a review, even with your screen locked.
          </p>
        </div>
        <div className="card p-5">
          <Zap className="w-5 h-5 text-primary mb-2" />
          <h2 className="font-semibold text-white mb-1">Opens instantly</h2>
          <p className="text-dark-text text-sm">
            Launches from your home screen or dock, full screen, with no browser bar in the way.
          </p>
        </div>
        <div className="card p-5">
          <WifiOff className="w-5 h-5 text-primary mb-2" />
          <h2 className="font-semibold text-white mb-1">Works offline</h2>
          <p className="text-dark-text text-sm">
            Game covers you've already seen stay available when your connection drops.
          </p>
        </div>
      </div>

      {/* Platform picker */}
      <h2 className="text-2xl font-bold text-white mb-4">Step-by-step</h2>
      <div className="flex flex-wrap gap-2 mb-6">
        {PLATFORMS.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={`btn flex items-center gap-2 text-sm ${
                p.id === selected ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              <Icon className="w-4 h-4" />
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Steps for the selected platform */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-1">
          <PlatformIcon className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-bold text-white">{platform.label}</h3>
        </div>
        <p className="text-dark-text text-sm mb-5">Using {platform.browser}</p>

        <ol className="space-y-3">
          {platform.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-primary on-primary font-bold text-xs flex items-center justify-center">
                {i + 1}
              </span>
              <span className="text-dark-text leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>

        {platform.note && (
          <p className="text-dark-text text-sm mt-5 pt-4 border-t border-dark-border">
            {platform.note}
          </p>
        )}
      </div>

      {/* Icon legend */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 text-sm text-dark-text">
        <span className="flex items-center gap-1.5">
          <Share className="w-4 h-4 text-primary" /> Share button
        </span>
        <span className="flex items-center gap-1.5">
          <MoreVertical className="w-4 h-4 text-primary" /> Browser menu
        </span>
        <span className="flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-primary" /> Add to Home Screen
        </span>
        <span className="flex items-center gap-1.5">
          <Download className="w-4 h-4 text-primary" /> Install
        </span>
      </div>

      <div className="mt-12 pt-6 border-t border-dark-border">
        <Link href="/" className="text-primary hover:underline">
          ← Back to Hitboxd
        </Link>
      </div>
    </div>
  );
}
