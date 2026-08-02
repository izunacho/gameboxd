import Link from 'next/link';
import Avatar from './Avatar';
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
          <Avatar url={u.avatar_url} username={u.username} size="sm" />
          <span className="font-semibold">{u.username}</span>
        </Link>
      ))}
    </div>
  );
}
