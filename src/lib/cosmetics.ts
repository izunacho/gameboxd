/**
 * Premium cosmetics: accent colours, verified-tick colours and avatar frames.
 *
 * Pure data plus validators — no React, no Supabase — matching avatars.ts
 * and rating.ts. The validators mirror the CHECK constraints in migration
 * 011, the same way isPresetAvatar mirrors migration 010.
 *
 * Accents are a curated set rather than a free colour picker because the
 * accent is used as a BACKGROUND under text (`.btn-primary`, badges). Each
 * entry therefore ships the foreground that was checked against it; picking
 * an arbitrary colour would leave dark accents with unreadable black text.
 */

export interface AccentPreset {
  id: string;
  label: string;
  /** Space-separated RGB channels — the form Tailwind's <alpha-value> needs. */
  rgb: string;
  /** Text colour verified as readable on top of `rgb`. */
  fg: string;
}

export const DEFAULT_ACCENT_ID = 'default';

export const ACCENT_PRESETS: AccentPreset[] = [
  { id: 'default', label: 'Hitboxd Green', rgb: '0 208 132', fg: '0 0 0' },
  { id: 'cyan', label: 'Cyan', rgb: '34 211 238', fg: '0 0 0' },
  { id: 'sky', label: 'Sky', rgb: '56 189 248', fg: '0 0 0' },
  { id: 'indigo', label: 'Indigo', rgb: '129 140 248', fg: '0 0 0' },
  { id: 'violet', label: 'Violet', rgb: '167 139 250', fg: '0 0 0' },
  { id: 'fuchsia', label: 'Fuchsia', rgb: '232 121 249', fg: '0 0 0' },
  { id: 'rose', label: 'Rose', rgb: '251 113 133', fg: '0 0 0' },
  { id: 'red', label: 'Red', rgb: '239 68 68', fg: '255 255 255' },
  { id: 'orange', label: 'Orange', rgb: '251 146 60', fg: '0 0 0' },
  { id: 'amber', label: 'Amber', rgb: '251 191 36', fg: '0 0 0' },
  { id: 'lime', label: 'Lime', rgb: '163 230 53', fg: '0 0 0' },
  { id: 'teal', label: 'Teal', rgb: '45 212 191', fg: '0 0 0' },
];

export interface FramePreset {
  id: string;
  label: string;
  /** Classes applied to the avatar wrapper. */
  className: string;
}

/**
 * Frames are CSS rings, not artwork. The avatar sprites have an opaque
 * #12161a plate that `rounded-full` clips, so anything drawn behind them is
 * invisible — a frame has to sit outside the image. Rings also scale to
 * every avatar size for free and don't compete with the pixel art.
 */
export const FRAME_PRESETS: FramePreset[] = [
  { id: 'gold', label: 'Gold', className: 'frame-gold' },
  { id: 'neon', label: 'Neon', className: 'frame-neon' },
  { id: 'holo', label: 'Holographic', className: 'frame-holo' },
  { id: 'double', label: 'Double Ring', className: 'frame-double' },
  { id: 'dashed', label: 'Dashed', className: 'frame-dashed' },
  { id: 'pulse', label: 'Pulse', className: 'frame-pulse' },
];

export function getAccent(id: string | null | undefined): AccentPreset {
  return (
    ACCENT_PRESETS.find((a) => a.id === id) ??
    ACCENT_PRESETS.find((a) => a.id === DEFAULT_ACCENT_ID)!
  );
}

/** CSS colour for a tick, or null when the id isn't one of ours. */
export function tickColor(id: string | null | undefined): string | null {
  const preset = ACCENT_PRESETS.find((a) => a.id === id);
  return preset ? `rgb(${preset.rgb})` : null;
}

export function getFrameClass(id: string | null | undefined): string {
  return FRAME_PRESETS.find((f) => f.id === id)?.className ?? '';
}

export function isAccentId(id: string): boolean {
  return ACCENT_PRESETS.some((a) => a.id === id);
}

export function isFrameId(id: string): boolean {
  return FRAME_PRESETS.some((f) => f.id === id);
}

/**
 * Is this premium row currently in force? A row with no expiry never lapses.
 * Callers pass whatever the embedded premium_members select returned.
 */
export function isPremiumActive(
  premium: { expires_at?: string | null } | null | undefined
): boolean {
  if (!premium) return false;
  if (!premium.expires_at) return true;
  return new Date(premium.expires_at).getTime() > Date.now();
}

/**
 * The columns every query needs in order to render another user's badges.
 * Kept as one constant so the eight selects that embed it can't drift apart.
 */
export const USER_COSMETIC_FIELDS = 'tick_color, avatar_frame, premium_members(expires_at)';

/** What a rendered user carries beyond their name and avatar. */
export interface UserCosmetics {
  isPremium: boolean;
  /** CSS colour for the verified tick, or null when it shouldn't render. */
  tickColor: string | null;
  /** Frame id, or null when it shouldn't render. */
  frame: string | null;
}

export const NO_COSMETICS: UserCosmetics = {
  isPremium: false,
  tickColor: null,
  frame: null,
};

/**
 * Read the cosmetics off an embedded `users` row.
 *
 * Everything is gated on active premium, which is the whole point of keeping
 * status in its own table: a non-paying user can set these columns on their
 * own row, and it still renders as nothing.
 */
export function readCosmetics(row: any): UserCosmetics {
  if (!row) return NO_COSMETICS;

  // PostgREST returns a to-one embed as an object, but falls back to an
  // array if it can't prove the relationship is unique.
  const premiumRaw = row.premium_members;
  const premium = Array.isArray(premiumRaw) ? premiumRaw[0] : premiumRaw;

  if (!isPremiumActive(premium)) return NO_COSMETICS;

  return {
    isPremium: true,
    tickColor: tickColor(row.tick_color),
    frame: isFrameId(row.avatar_frame ?? '') ? row.avatar_frame : null,
  };
}
