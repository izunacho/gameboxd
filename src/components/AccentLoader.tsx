'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getMyProfile } from '@/lib/user-data';
import { useAppStore } from '@/lib/store';
import { getAccent, DEFAULT_ACCENT_ID, NO_COSMETICS } from '@/lib/cosmetics';

/**
 * Invisible component mounted in the root layout, alongside UserDataLoader.
 *
 * Paints the app in the logged-in member's chosen accent by overriding
 * --color-primary on <html>, and caches their own cosmetics in the store so
 * the header and home page can show their tick without a query of their own.
 *
 * Non-premium members fall back to the default declared in globals.css, so
 * a stored preference with no active subscription renders as nothing.
 */
export default function AccentLoader() {
  const setMyCosmeticsState = useAppStore((s) => s.setMyCosmeticsState);

  useEffect(() => {
    const apply = (accentId: string | null) => {
      const accent = getAccent(accentId ?? DEFAULT_ACCENT_ID);
      const root = document.documentElement;
      root.style.setProperty('--color-primary', accent.rgb);
      root.style.setProperty('--color-primary-fg', accent.fg);
    };

    const load = () =>
      getMyProfile()
        .then((profile) => {
          setMyCosmeticsState(profile?.cosmetics ?? NO_COSMETICS);
          apply(profile?.isPremium ? profile.accent_color : null);
        })
        .catch(() => {
          setMyCosmeticsState(NO_COSMETICS);
          apply(null);
        });

    load();

    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => sub.subscription.unsubscribe();
  }, [setMyCosmeticsState]);

  return null;
}
