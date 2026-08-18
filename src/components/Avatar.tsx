import { User } from 'lucide-react';
import { getFrameClass } from '@/lib/cosmetics';

const SIZES = {
  sm: { box: 'w-9 h-9', icon: 'w-5 h-5' },
  md: { box: 'w-14 h-14', icon: 'w-7 h-7' },
  lg: { box: 'w-20 h-20', icon: 'w-10 h-10' },
};

/**
 * Profile picture, falling back to a placeholder icon when none is set.
 * Avatars are preset pixel-art sprites served from /public/avatars, so they
 * render as plain images — no remote hosts and no image optimization needed.
 *
 * A premium `frame` wraps the avatar rather than decorating it: the sprites
 * have an opaque background plate that rounded-full clips, so a ring drawn
 * behind them would be invisible.
 */
export default function Avatar({
  url,
  username,
  size = 'md',
  frame = null,
}: {
  url: string | null;
  username?: string;
  size?: keyof typeof SIZES;
  frame?: string | null;
}) {
  const { box, icon } = SIZES[size];
  const frameClass = getFrameClass(frame);

  const inner = url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={username ? `${username}'s avatar` : 'Avatar'}
      className={`${box} rounded-full object-cover bg-dark-bg`}
      style={{ imageRendering: 'pixelated' }}
    />
  ) : (
    <div className={`${box} bg-primary/20 rounded-full flex items-center justify-center`}>
      <User className={`${icon} text-primary`} />
    </div>
  );

  // shrink-0 has to live on the outermost element, or flex parents squash it.
  if (!frameClass) return <div className="shrink-0">{inner}</div>;

  return <div className={`shrink-0 ${frameClass}`}>{inner}</div>;
}
