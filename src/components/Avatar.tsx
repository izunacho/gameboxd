import Image from 'next/image';
import { User } from 'lucide-react';

const SIZES = {
  sm: { box: 'w-9 h-9', icon: 'w-5 h-5', px: 36 },
  md: { box: 'w-14 h-14', icon: 'w-7 h-7', px: 56 },
  lg: { box: 'w-20 h-20', icon: 'w-10 h-10', px: 80 },
};

/** Profile picture, falling back to a placeholder icon when there is none. */
export default function Avatar({
  url,
  username,
  size = 'md',
}: {
  url: string | null;
  username?: string;
  size?: keyof typeof SIZES;
}) {
  const { box, icon, px } = SIZES[size];

  if (!url) {
    return (
      <div className={`${box} bg-primary/20 rounded-full flex items-center justify-center shrink-0`}>
        <User className={`${icon} text-primary`} />
      </div>
    );
  }

  return (
    <div className={`${box} relative rounded-full overflow-hidden bg-dark-bg shrink-0`}>
      <Image
        src={url}
        alt={username ? `${username}'s profile picture` : 'Profile picture'}
        width={px}
        height={px}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
