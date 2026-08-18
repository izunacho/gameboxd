import { BadgeCheck } from 'lucide-react';
import { UserCosmetics } from '@/lib/cosmetics';

/**
 * Premium member badge, in the colour the member picked.
 *
 * Renders nothing unless the membership is active — the colour preference
 * lives on a row its owner can edit, so the entitlement check is what makes
 * the badge meaningful.
 *
 * Inline-block with align-middle so it also sits correctly mid-sentence,
 * as in the notification dropdown.
 */
export default function VerifiedTick({
  cosmetics,
  className = 'w-4 h-4',
}: {
  cosmetics: UserCosmetics | null | undefined;
  className?: string;
}) {
  if (!cosmetics?.isPremium) return null;

  return (
    <BadgeCheck
      className={`inline-block align-middle shrink-0 ${className}`}
      style={{ color: cosmetics.tickColor ?? 'rgb(var(--color-primary))' }}
      aria-label="Premium member"
    >
      <title>Premium member</title>
    </BadgeCheck>
  );
}
