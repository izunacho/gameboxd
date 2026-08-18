import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyState, exchangeCodeForToken, fetchIdentity } from '@/lib/patreon';

/**
 * Patreon redirects here after the user authorizes. Verifies the signed
 * state to recover which Hitboxd account started the flow, exchanges the
 * code, and records the link — plus grants premium immediately if they're
 * already an active patron on a qualifying tier, rather than waiting for
 * the next webhook event.
 */
export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const failureRedirect = (reason: string) =>
    NextResponse.redirect(`${appUrl}/profile?patreon=error&reason=${encodeURIComponent(reason)}`);

  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  if (!code || !state) return failureRedirect('missing_params');

  const verified = verifyState(state);
  if (!verified) return failureRedirect('invalid_state');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Patreon callback route is missing Supabase environment variables');
    return failureRedirect('not_configured');
  }

  try {
    const accessToken = await exchangeCodeForToken(code);
    const identity = await fetchIdentity(accessToken);

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const { error: linkError } = await admin.from('patreon_links').upsert(
      {
        user_id: verified.userId,
        patreon_user_id: identity.patreonUserId,
        patreon_full_name: identity.fullName,
      },
      { onConflict: 'user_id' }
    );
    if (linkError) throw linkError;

    if (identity.isQualifyingMember) {
      const { error: premiumError } = await admin
        .from('premium_members')
        .upsert(
          { user_id: verified.userId, source: 'patreon', expires_at: null },
          { onConflict: 'user_id' }
        );
      if (premiumError) throw premiumError;
    }

    return NextResponse.redirect(`${appUrl}/profile?patreon=connected`);
  } catch (err) {
    console.error('Patreon callback failed:', err);
    return failureRedirect('server_error');
  }
}
