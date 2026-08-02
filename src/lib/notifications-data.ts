/**
 * Notifications — read/mark-read only. Rows are created exclusively by
 * SECURITY DEFINER database triggers (see supabase/migrations/007_notifications.sql),
 * never inserted by client code.
 */

import { supabase } from './supabase';

export interface AppNotification {
  id: string;
  type: 'new_review' | 'new_follower';
  read: boolean;
  created_at: string;
  actorUsername: string;
  review: { igdbId: number; gameName: string } | null;
}

/** The current user's most recent notifications, newest first. Empty if logged out. */
export async function getMyNotifications(limit = 20): Promise<AppNotification[]> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select(
      'id, type, read, created_at, users!notifications_actor_id_fkey(username), reviews(games(igdb_id, name))'
    )
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;

  return (data || []).map((n: any) => ({
    id: n.id,
    type: n.type,
    read: n.read,
    created_at: n.created_at,
    actorUsername: n.users?.username || 'someone',
    review: n.reviews?.games
      ? { igdbId: n.reviews.games.igdb_id, gameName: n.reviews.games.name }
      : null,
  }));
}

/** Unread notification count for the current user. 0 if logged out. */
export async function getUnreadNotificationCount(): Promise<number> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return 0;

  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', auth.user.id)
    .eq('read', false);
  if (error) throw error;
  return count ?? 0;
}

export async function markNotificationRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);
  if (error) throw error;
}

export async function markAllNotificationsRead() {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', auth.user.id)
    .eq('read', false);
  if (error) throw error;
}
