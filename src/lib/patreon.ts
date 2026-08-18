/**
 * Server-only Patreon OAuth + webhook helpers. Never import this from a
 * client component — it reads secrets that must not reach the browser.
 */

import crypto from 'crypto';

const AUTHORIZE_URL = 'https://www.patreon.com/oauth2/authorize';
const TOKEN_URL = 'https://www.patreon.com/api/oauth2/token';
const IDENTITY_URL = 'https://www.patreon.com/api/oauth2/v2/identity';

const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function redirectUri(): string {
  return `${env('NEXT_PUBLIC_APP_URL')}/api/patreon/callback`;
}

/**
 * Signs a short-lived state token carrying the initiating user's id.
 *
 * The OAuth callback is a full-page redirect from Patreon, so it can't
 * carry the Supabase session — there's no cookie-based server session
 * anywhere in this app. Embedding a signed, expiring user id in `state`
 * lets the callback recover "who started this" without a database round
 * trip or a new ephemeral table to clean up.
 */
export function signState(userId: string): string {
  const payload = `${userId}.${Date.now()}`;
  const payloadB64 = Buffer.from(payload).toString('base64url');
  const signature = crypto
    .createHmac('sha256', env('PATREON_STATE_SECRET'))
    .update(payloadB64)
    .digest('base64url');
  return `${payloadB64}.${signature}`;
}

/** Verifies and decodes a state token. Returns null if invalid or expired. */
export function verifyState(state: string): { userId: string } | null {
  const [payloadB64, signature] = state.split('.');
  if (!payloadB64 || !signature) return null;

  const expected = crypto
    .createHmac('sha256', env('PATREON_STATE_SECRET'))
    .update(payloadB64)
    .digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  const [userId, tsRaw] = Buffer.from(payloadB64, 'base64url').toString().split('.');
  const ts = Number(tsRaw);
  if (!userId || !Number.isFinite(ts) || Date.now() - ts > STATE_TTL_MS) return null;

  return { userId };
}

export function buildAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: env('PATREON_CLIENT_ID'),
    redirect_uri: redirectUri(),
    scope: 'identity identity.memberships',
    state,
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: env('PATREON_CLIENT_ID'),
      client_secret: env('PATREON_CLIENT_SECRET'),
      redirect_uri: redirectUri(),
    }),
  });
  if (!res.ok) throw new Error(`Patreon token exchange failed: ${res.status}`);
  const data = await res.json();
  return data.access_token as string;
}

export interface PatreonIdentity {
  patreonUserId: string;
  fullName: string | null;
  isQualifyingMember: boolean;
}

/**
 * Fetches the connecting patron's identity and whether their current
 * memberships include one of the tiers configured to grant premium.
 *
 * Field names here are Patreon API v2 as of this writing — reconfirm
 * against https://docs.patreon.com/ if Patreon has changed its schema.
 */
export async function fetchIdentity(accessToken: string): Promise<PatreonIdentity> {
  const params = new URLSearchParams({
    include: 'memberships.currently_entitled_tiers',
    'fields[user]': 'full_name',
    'fields[member]': 'patron_status',
    'fields[tier]': 'title',
  });

  const res = await fetch(`${IDENTITY_URL}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Patreon identity fetch failed: ${res.status}`);
  const data = await res.json();

  const patreonUserId = data?.data?.id as string;
  const fullName = data?.data?.attributes?.full_name ?? null;

  const included: any[] = data?.included ?? [];
  const qualifyingTierIds = (process.env.PATREON_QUALIFYING_TIER_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  const entitledTierIds = included
    .filter((item) => item.type === 'tier')
    .map((item) => item.id as string);

  const hasActiveMembership = included.some(
    (item) => item.type === 'member' && item.attributes?.patron_status === 'active_patron'
  );

  const isQualifyingMember =
    hasActiveMembership &&
    (qualifyingTierIds.length === 0 ||
      entitledTierIds.some((id) => qualifyingTierIds.includes(id)));

  return { patreonUserId, fullName, isQualifyingMember };
}

/**
 * Patreon signs webhook bodies with HMAC-MD5 — not SHA-256. This is a known
 * quirk of their API, not a mistake to "fix": match it exactly or every
 * signature check fails.
 */
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;
  const expected = crypto
    .createHmac('md5', env('PATREON_WEBHOOK_SECRET'))
    .update(rawBody)
    .digest('hex');

  const sigBuf = Buffer.from(signatureHeader);
  const expectedBuf = Buffer.from(expected);
  return sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf);
}

/** Whether a webhook payload's included tiers qualify for premium. */
export function webhookEventQualifies(payload: any): boolean {
  const qualifyingTierIds = (process.env.PATREON_QUALIFYING_TIER_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  const patronStatus = payload?.data?.attributes?.patron_status;
  if (patronStatus !== 'active_patron') return false;
  if (qualifyingTierIds.length === 0) return true;

  const entitledTierIds: string[] =
    payload?.data?.relationships?.currently_entitled_tiers?.data?.map((t: any) => t.id) ?? [];
  return entitledTierIds.some((id) => qualifyingTierIds.includes(id));
}

/** The Patreon user id a webhook event is about. */
export function webhookPatreonUserId(payload: any): string | null {
  return payload?.data?.relationships?.patron?.data?.id ?? null;
}
