import { ratingTextColor, ratingTint, ratingBorder } from '@/lib/rating';

/**
 * A review score, coloured red→green by its value.
 *
 * Rendered as a tinted chip rather than a solid fill: a saturated red block
 * reads as an error state, and colouring the text instead keeps contrast
 * uniform across the whole scale on our dark surfaces.
 */
export default function RatingBadge({
  rating,
  className = '',
  showSuffix = true,
}: {
  rating: number;
  className?: string;
  showSuffix?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-sm font-bold tabular-nums ${className}`}
      style={{
        color: ratingTextColor(rating),
        backgroundColor: ratingTint(rating),
        borderColor: ratingBorder(rating),
      }}
    >
      {rating}
      {showSuffix && '/100'}
    </span>
  );
}
