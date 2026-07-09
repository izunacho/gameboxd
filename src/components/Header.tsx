'use client';

import Link from 'next/link';
import { Search, Gamepad2, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-dark-surface/80 backdrop-blur-md border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
            <Gamepad2 className="w-6 h-6" />
            <span>Gameboxd</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/explore" className="hover:text-primary transition">
              Explore
            </Link>
            <Link href="/trending" className="hover:text-primary transition">
              Trending
            </Link>
            <Link href="/community" className="hover:text-primary transition">
              Community
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-text" />
              <input
                type="text"
                placeholder="Search games..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-dark-bg border border-dark-border focus:border-primary outline-none"
              />
            </div>

            {/* Auth Links */}
            <div className="flex items-center gap-2">
              <Link href="/auth/login" className="btn-secondary text-sm">
                Login
              </Link>
              <Link href="/auth/signup" className="btn-primary text-sm">
                Sign Up
              </Link>
            </div>
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
            <Link href="/explore" className="block hover:text-primary">
              Explore
            </Link>
            <Link href="/trending" className="block hover:text-primary">
              Trending
            </Link>
            <Link href="/community" className="block hover:text-primary">
              Community
            </Link>
            <div className="pt-4 space-y-2 border-t border-dark-border">
              <Link href="/auth/login" className="block btn-secondary text-center">
                Login
              </Link>
              <Link href="/auth/signup" className="block btn-primary text-center">
                Sign Up
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
