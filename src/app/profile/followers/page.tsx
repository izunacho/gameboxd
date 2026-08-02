'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import FollowListView from '@/components/FollowListView';
import { User } from 'lucide-react';

export default function MyFollowersPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setChecked(true);
    });
  }, []);

  if (!checked) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border border-dark-border border-t-primary"></div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <User className="w-12 h-12 text-primary mx-auto" />
        <h1 className="text-2xl font-bold">Your Followers</h1>
        <p className="text-dark-text">Log in to see who follows you.</p>
        <Link href="/auth/login" className="btn-primary inline-block">
          Log In
        </Link>
      </div>
    );
  }

  return (
    <FollowListView
      userId={userId}
      kind="followers"
      title="Followers"
      emptyLabel="No one follows you yet."
      backHref="/profile"
    />
  );
}
