import Link from 'next/link';
import { Heart, Gamepad2 } from 'lucide-react';

const PATREON_URL = 'https://www.patreon.com/cw/hitboxd';

export default function Footer() {
  return (
    <footer className="border-t border-dark-border mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-dark-text text-sm">
          <Gamepad2 className="w-4 h-4 text-primary" />
          <span>Hitboxd &copy; {new Date().getFullYear()}</span>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <Link href="/privacy" className="text-dark-text hover:text-primary transition">
            Privacy Policy
          </Link>
          <a
            href={PATREON_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-dark-text hover:text-primary transition"
          >
            <Heart className="w-4 h-4" />
            Support Hitboxd
          </a>
        </div>
      </div>
    </footer>
  );
}
