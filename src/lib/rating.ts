/**
 * The 0–100 rating scale and its red→green colours.
 *
 * Colours are interpolated between five anchor stops rather than sweeping the
 * hue linearly: a straight ramp parks the middle of the scale on pure yellow,
 * which is the harshest hue on our dark background, and reaches green far too
 * early. Lightness stays high across the whole range — the usual "muddy brown"
 * mid-scale comes from darkening the yellows, which only works on light UIs.
 *
 * The top of the scale lands on hue 152 so a perfect score matches the brand
 * green (#00D084 is hsl(158, 100%, 41%)) instead of introducing a second one.
 */

interface Stop {
  at: number;
  h: number;
  s: number;
  l: number;
}

const STOPS: Stop[] = [
  { at: 0, h: 0, s: 80, l: 55 }, // red
  { at: 25, h: 25, s: 85, l: 55 }, // orange
  { at: 50, h: 48, s: 90, l: 54 }, // amber
  { at: 75, h: 90, s: 65, l: 47 }, // yellow-green
  { at: 100, h: 152, s: 85, l: 43 }, // brand green
];

/** Neutral used when there is no rating to colour. */
export const RATING_NEUTRAL = '#2D2D2D';
const RATING_NEUTRAL_TEXT = '#6B7280';

/**
 * Coerce anything into a valid stored rating: an integer from 0 to 100.
 * Returns null when the value isn't a usable number. This is the single
 * definition of a valid score — the persistence layer uses it too.
 */
export function normalizeRating(value: unknown): number | null {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.min(100, Math.max(0, Math.round(n)));
}

function interpolate(score: number): Stop {
  const value = normalizeRating(score) ?? 0;

  let lower = STOPS[0];
  let upper = STOPS[STOPS.length - 1];
  for (let i = 0; i < STOPS.length - 1; i++) {
    if (value >= STOPS[i].at && value <= STOPS[i + 1].at) {
      lower = STOPS[i];
      upper = STOPS[i + 1];
      break;
    }
  }

  const span = upper.at - lower.at;
  const t = span === 0 ? 0 : (value - lower.at) / span;

  return {
    at: value,
    h: lower.h + (upper.h - lower.h) * t,
    s: lower.s + (upper.s - lower.s) * t,
    l: lower.l + (upper.l - lower.l) * t,
  };
}

/** Vivid fill colour — the slider track and other solid areas. */
export function ratingColor(score: number | null): string {
  if (score === null) return RATING_NEUTRAL;
  const { h, s, l } = interpolate(score);
  return `hsl(${h.toFixed(1)}, ${s.toFixed(1)}%, ${l.toFixed(1)}%)`;
}

/**
 * Text colour for a rating on a dark surface. Lightness is pinned to 62%
 * so every score clears 4.5:1 against #0F0F0F and #1A1A1A with one rule,
 * instead of needing a per-hue contrast switch.
 */
export function ratingTextColor(score: number | null): string {
  if (score === null) return RATING_NEUTRAL_TEXT;
  const { h, s } = interpolate(score);
  return `hsl(${h.toFixed(1)}, ${s.toFixed(1)}%, 62%)`;
}

/** Faint background wash for a rating chip. */
export function ratingTint(score: number | null): string {
  if (score === null) return 'rgba(107, 114, 128, 0.12)';
  const { h, s } = interpolate(score);
  return `hsla(${h.toFixed(1)}, ${s.toFixed(1)}%, 45%, 0.18)`;
}

/** Border for a rating chip, a touch stronger than the tint. */
export function ratingBorder(score: number | null): string {
  if (score === null) return 'rgba(107, 114, 128, 0.3)';
  const { h, s } = interpolate(score);
  return `hsla(${h.toFixed(1)}, ${s.toFixed(1)}%, 50%, 0.4)`;
}
