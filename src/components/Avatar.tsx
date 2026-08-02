import { User } from 'lucide-react';

const SIZES = {
  sm: { box: 'w-9 h-9', icon: 'w-5 h-5' },
  md: { box: 'w-14 h-14', icon: 'w-7 h-7' },
  lg: { box: 'w-20 h-20', icon: 'w-10 h-10' },
};

/**
 * Profile picture, falling back to a placeholder icon when none is set.
 * Avatars are preset pixel-art sprites served from /public/avatars, so they
 * render as plain images — no remote hosts and no image optimization needed.
 */
export default function Avatar({
  url,
  username,
  size = 'md',
}: {
  url: string | null;
  username?: string;
  size?: keyof typeof SIZES;
}) {
  const { box, icon } = SIZES[size];

  if (!url) {
    return (
      <div className={`${box} bg-primary/20 rounded-full flex items-center justify-center shrink-0`}>
        <User className={`${icon} text-primary`} />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={username ? `${username}'s avatar` : 'Avatar'}
      className={`${box} rounded-full object-cover shrink-0 bg-dark-bg`}
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
