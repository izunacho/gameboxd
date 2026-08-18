import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Unlinks the caller's Patreon account. Authenticated the same way as
 * /api/patreon/connect — bearer token verified against an anon client,
 * write performed with the service role.
 *
 * Deliberately does not touch premium_members: unlinking isn't the same as
 * cancelling the pledge. If they're still an active patron, the membership
 * simply won't be tracked automatically anymore until they reconnect.
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: 'Missing bearer token' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error('Patreon disconnect route is missing Supabase environment variables');
    return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, anonKey);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const { error: deleteError } = await admin
    .from('patreon_links')
    .delete()
    .eq('user_id', data.user.id);
  if (deleteError) {
    console.error('Failed to remove Patreon link:', deleteError);
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
