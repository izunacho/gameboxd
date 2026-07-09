import { Users } from 'lucide-react';
import Link from 'next/link';

export default function CommunityPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-12">
        <Users className="w-8 h-8 text-primary" />
        <h1 className="text-4xl font-bold">Community</h1>
      </div>

      {/* Coming Soon */}
      <div className="card p-12 text-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Community Features Coming Soon</h2>
          <p className="text-dark-text">
            We're building amazing community features like following users, activity feeds, and collaborative game lists.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 text-left">
            <div className="bg-dark-bg/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">👥 Follow Other Gamers</h3>
              <p className="text-sm text-dark-text">
                See what your friends are playing and rating.
              </p>
            </div>
            <div className="bg-dark-bg/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">📊 Activity Feed</h3>
              <p className="text-sm text-dark-text">
                Stay updated on community reviews and ratings.
              </p>
            </div>
            <div className="bg-dark-bg/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">📋 Shared Lists</h3>
              <p className="text-sm text-dark-text">
                Create and share game lists with the community.
              </p>
            </div>
            <div className="bg-dark-bg/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">💬 Discussions</h3>
              <p className="text-sm text-dark-text">
                Chat and discuss games with other players.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <Link href="/explore" className="btn-primary inline-block">
              Start Exploring Games
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
