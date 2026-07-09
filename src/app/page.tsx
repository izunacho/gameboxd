'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Gamepad2, TrendingUp, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  // undefined = still checking, null = logged out, string = display name
  const [user, setUser] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      setUser(u ? u.user_metadata?.username || u.email || '' : null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      setUser(u ? u.user_metadata?.username || u.email || '' : null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const loggedIn = typeof user === 'string';
  const loggedOut = user === null;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-dark-surface to-dark-bg px-4">
        <div className="text-center space-y-6 max-w-2xl">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/20 p-6 rounded-2xl">
              <Gamepad2 className="w-16 h-16 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white">
            Gameboxd
          </h1>
          <p className="text-xl text-dark-text">
            {loggedIn ? (
              <>
                Welcome back, <span className="text-primary font-semibold">{user}</span>! What
                are you playing today?
              </>
            ) : (
              'Rate, review, and share your favorite video games with the community.'
            )}
          </p>
          <div className="flex gap-4 justify-center pt-6 flex-wrap">
            {loggedOut && (
              <Link href="/auth/signup" className="btn-primary">
                Get Started
              </Link>
            )}
            <Link href="/explore" className={loggedIn ? 'btn-primary' : 'btn-secondary'}>
              Explore Games
            </Link>
            {loggedIn && (
              <Link href="/community" className="btn-secondary">
                Community
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-12 text-center">Why Gameboxd?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6">
            <TrendingUp className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Rate & Review</h3>
            <p className="text-dark-text">
              Share your thoughts on games you've played. Rate them on a scale of 0-100 and write detailed reviews.
            </p>
          </div>
          <div className="card p-6">
            <Users className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Community</h3>
            <p className="text-dark-text">
              Discover what other gamers are playing and see their reviews. Connect with fellow enthusiasts.
            </p>
          </div>
          <div className="card p-6">
            <Gamepad2 className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Track Games</h3>
            <p className="text-dark-text">
              Build your game library. Mark games as played, add to wishlist, or track upcoming releases.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section — only for visitors without an account */}
      {loggedOut && (
        <section className="max-w-2xl mx-auto px-4 py-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to join the community?</h2>
          <p className="text-dark-text mb-6">
            Sign up now to start rating games and discovering what's trending.
          </p>
          <Link href="/auth/signup" className="btn-primary inline-block">
            Create Account
          </Link>
        </section>
      )}
    </div>
  );
}
