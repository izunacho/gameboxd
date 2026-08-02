import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

/**
 * Called by a Supabase Database Webhook on INSERT into `notifications`.
 * Looks up the recipient's push subscriptions (service role, bypasses RLS)
 * and delivers a Web Push to each of their devices.
 *
 * Secured with a shared secret: the webhook must send the
 * `x-push-secret` header matching PUSH_WEBHOOK_SECRET.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.PUSH_WEBHOOK_SECRET;
  if (!secret || req.headers.get('x-push-secret') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!vapidPublicKey || !vapidPrivateKey || !supabaseUrl || !serviceRoleKey) {
    console.error('Push notify route is missing required environment variables');
    return NextResponse.json({ error: 'Push not configured' }, { status: 500 });
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const record = payload?.record;
  if (payload?.type !== 'INSERT' || !record?.user_id || !record?.actor_id || !record?.type) {
    return NextResponse.json({ error: 'Bad payload' }, { status: 400 });
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@hitboxd.app',
    vapidPublicKey,
    vapidPrivateKey
  );
  const admin = createClient(supabaseUrl, serviceRoleKey);

  // Build the notification text from the actor and (for reviews) the game
  const { data: actor } = await admin
    .from('users')
    .select('username')
    .eq('id', record.actor_id)
    .maybeSingle();
  const actorName = actor?.username || 'Someone';

  let body = 'You have a new notification';
  let url = '/';
  if (record.type === 'new_review' && record.review_id) {
    const { data: review } = await admin
      .from('reviews')
      .select('games(igdb_id, name)')
      .eq('id', record.review_id)
      .maybeSingle();
    const game = (review as any)?.games;
    body = game ? `${actorName} posted a review for ${game.name}` : `${actorName} posted a new review`;
    url = game ? `/game/${game.igdb_id}` : '/community';
  } else if (record.type === 'new_follower') {
    body = `${actorName} started following you`;
    url = `/user/${encodeURIComponent(actorName)}`;
  }

  const { data: subs, error } = await admin
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', record.user_id);
  if (error) {
    console.error('Failed to load push subscriptions:', error);
    return NextResponse.json({ error: 'Subscription lookup failed' }, { status: 500 });
  }

  const message = JSON.stringify({ title: 'Hitboxd', body, url });
  let sent = 0;
  for (const sub of subs || []) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        message
      );
      sent++;
    } catch (err: any) {
      // 404/410 mean the browser subscription expired or was revoked
      if (err?.statusCode === 404 || err?.statusCode === 410) {
        await admin.from('push_subscriptions').delete().eq('id', sub.id);
      } else {
        console.error('Push delivery failed:', err?.statusCode ?? err);
      }
    }
  }

  return NextResponse.json({ sent });
}
