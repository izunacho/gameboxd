import Link from 'next/link';
import { User } from 'lucide-react';
import { SocialUser } from '@/lib/social-data';

/** Shared row rendering for followers/following list pages. */
export default function SocialUserList({
  users,
  emptyLabel,
}: {
  users: SocialUser[];
  emptyLabel: string;
}) {
  if (users.length === 0) {
    return <p className="text-dark-text">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-2">
      {users.map((u) => (
        <Link
          key={u.id}
          href={`/user/${encodeURIComponent(u.username)}`}
          className="card p-4 flex items-center gap-3 hover:border-primary transition-colors"
        >
          <div className="bg-primary/20 p-2 rounded-full">
            <User className="w-5 h-5 text-primary" />
          </div>
          <span className="font-semibold">{u.username}</span>
        </Link>
      ))}
    </div>
  );
}
