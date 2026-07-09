'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Gamepad2, Menu, X, LogOut, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Load current session on mount
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      setUsername(user?.user_metadata?.username || user?.email || null);
    });

    // Keep header in sync with login/logout events
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setUsername(user?.user_metadata?.username || user?.email || null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-dark-surface/80 backdrop-blur-md border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
            <Gamepad2 className="w-6 h-6" />
            <span>Hitboxd</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/explore" className="hover:text-primary transition">
              Explore
            </Link>
            <Link href="/community" className="hover:text-primary transition">
              Community
            </Link>
          </nav>

          {/* Search + Auth (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-text" />
              <input
                type="text"
                placeholder="Search games..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-dark-bg border border-dark-border focus:border-primary outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const value = (e.target as HTMLInputElement).value.trim();
                    if (value) router.push(`/explore?q=${encodeURIComponent(value)}`);
                  }
                }}
              />
            </div>

            {username ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                  title="View your profile"
                >
                  <User className="w-4 h-4" />
                  {username}
                </Link>
                <button onClick={handleLogout} className="btn-secondary text-sm flex items-center gap-1">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="btn-secondary text-sm">
                  Login
                </Link>
                <Link href="/auth/signup" className="btn-primary text-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-dark-text"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 space-y-3 pb-4 border-t border-dark-border pt-4">
            <Link href="/explore" className="block hover:text-primary" onClick={() => setIsMenuOpen(false)}>
              Explore
            </Link>
            <Link href="/community" className="block hover:text-primary" onClick={() => setIsMenuOpen(false)}>
              Community
            </Link>
            <div className="pt-4 space-y-2 border-t border-dark-border">
              {username ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 text-sm text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    {username}
                  </Link>
                  <button onClick={handleLogout} className="w-full btn-secondary text-center">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="block btn-secondary text-center" onClick={() => setIsMenuOpen(false)}>
                    Login
                  </Link>
                  <Link href="/auth/signup" className="block btn-primary text-center" onClick={() => setIsMenuOpen(false)}>
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
