'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { loadMyInteractions } from '@/lib/user-data';
import { useAppStore } from '@/lib/store';

/**
 * Invisible component mounted in the root layout.
 * Loads the user's saved interactions into the store on login
 * and clears them on logout, so buttons reflect real database state.
 */
export default function UserDataLoader() {
  const setInteractions = useAppStore((s) => s.setInteractions);

  useEffect(() => {
    const load = () =>
      loadMyInteractions()
        .then(setInteractions)
        .catch(() => setInteractions([]));

    load();

    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => sub.subscription.unsubscribe();
  }, [setInteractions]);

  return null;
}
