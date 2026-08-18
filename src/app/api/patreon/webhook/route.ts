import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyWebhookSignature, webhookEventQualifies, webhookPatreonUserId } from '@/lib/patreon';

/**
 * Patreon calls this on membership changes (configured as
 * members:pledge:create / :update / :delete triggers in the Patreon
 * dashboard). Keeps premium in sync after the initial OAuth connect.
 *
 * Cancellations only ever remove rows with source='patreon' — a member who
 * was granted premium by hand keeps it regardless of what happens to
 * someone's Patreon pledge.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-patreon-signature');
  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const eventType = req.headers.get('x-patreon-event');

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const patreonUserId = webhookPatreonUserId(payload);
  if (!patreonUserId) {
    return NextResponse.json({ error: 'Missing patron id' }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Patreon webhook route is missing Supabase environment variables');
    return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  }
  const admin = createClient(supabaseUrl, serviceRoleKey);

  const { data: link, error: linkError } = await admin
    .from('patreon_links')
    .select('user_id')
    .eq('patreon_user_id', patreonUserId)
    .maybeSingle();
  if (linkError) {
    console.error('Failed to look up Patreon link:', linkError);
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }
  if (!link) {
    // A patron who never connected their Hitboxd account — nothing to do.
    return NextResponse.json({ ok: true, skipped: 'unlinked' });
  }

  if (eventType === 'members:pledge:delete' || !webhookEventQualifies(payload)) {
    const { error } = await admin
      .from('premium_members')
      .delete()
      .eq('user_id', link.user_id)
      .eq('source', 'patreon');
    if (error) {
      console.error('Failed to revoke Patreon-sourced premium:', error);
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, action: 'revoked' });
  }

  const { error } = await admin
    .from('premium_members')
    .upsert({ user_id: link.user_id, source: 'patreon', expires_at: null }, { onConflict: 'user_id' });
  if (error) {
    console.error('Failed to grant Patreon-sourced premium:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, action: 'granted' });
}
