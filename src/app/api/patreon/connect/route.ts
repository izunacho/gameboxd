import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { signState, buildAuthorizeUrl } from '@/lib/patreon';

/**
 * Called by the "Connect Patreon" button with the user's Supabase access
 * token in the Authorization header. Verifies the token (anon client — this
 * only reads, it never needs the service role), mints a signed state, and
 * hands back the Patreon authorize URL for the browser to navigate to.
 *
 * A full-page navigation can't carry an Authorization header, which is why
 * this exists as a separate fetch instead of linking straight to Patreon.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: 'Missing bearer token' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    console.error('Patreon connect route is missing Supabase environment variables');
    return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, anonKey);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  try {
    const state = signState(data.user.id);
    return NextResponse.json({ url: buildAuthorizeUrl(state) });
  } catch (err) {
    console.error('Failed to build Patreon authorize URL:', err);
    return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  }
}
