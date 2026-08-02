/**
 * Social graph persistence — follows and blocks in Supabase.
 * All functions run client-side with the user's session (RLS enforced).
 */

import { supabase } from './supabase';
import { requireUser } from './user-data';

export interface FollowCounts {
  followers: number;
  following: number;
}

/** Follower/following counts for any user id. */
export async function getFollowCounts(userId: string): Promise<FollowCounts> {
  const [followers, following] = await Promise.all([
    supabase.from('follows').select('id', { count: 'exact', head: true }).eq('following_id', userId),
    supabase.from('follows').select('id', { count: 'exact', head: true }).eq('follower_id', userId),
  ]);
  if (followers.error) throw followers.error;
  if (following.error) throw following.error;

  return { followers: followers.count ?? 0, following: following.count ?? 0 };
}

/** Is `viewerId` following `profileUserId`? */
export async function getFollowStatus(viewerId: string, profileUserId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', viewerId)
    .eq('following_id', profileUserId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

/** Follow or unfollow a user. Pass the current following state. */
export async function toggleFollow(targetUserId: string, currentlyFollowing: boolean) {
  const user = await requireUser();

  if (currentlyFollowing) {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: user.id, following_id: targetUserId });
    if (error) throw error;
  }
}

export interface SocialUser {
  id: string;
  username: string;
  avatar_url: string | null;
}

/** Users who follow `userId`. Blocked relationships are invisible via RLS. */
export async function getFollowersList(userId: string): Promise<SocialUser[]> {
  const { data, error } = await supabase
    .from('follows')
    .select('users!follows_follower_id_fkey(id, username, avatar_url)')
    .eq('following_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;

  return (data || [])
    .map((r: any) => r.users)
    .filter((u: SocialUser | null): u is SocialUser => !!u);
}

/** Users that `userId` follows. Blocked relationships are invisible via RLS. */
export async function getFollowingList(userId: string): Promise<SocialUser[]> {
  const { data, error } = await supabase
    .from('follows')
    .select('users!follows_following_id_fkey(id, username, avatar_url)')
    .eq('follower_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;

  return (data || [])
    .map((r: any) => r.users)
    .filter((u: SocialUser | null): u is SocialUser => !!u);
}

/** Search players by username (case-insensitive substring). Blocked users are excluded via RLS. */
export async function searchUsers(query: string): Promise<SocialUser[]> {
  const cleaned = query.trim();
  if (cleaned.length < 2) return [];

  // Escape LIKE pattern wildcards so user input matches literally
  const escaped = cleaned.replace(/[\\%_]/g, (c) => `\\${c}`);

  const { data, error } = await supabase
    .from('users')
    .select('id, username, avatar_url')
    .ilike('username', `%${escaped}%`)
    .order('username')
    .limit(10);
  if (error) throw error;
  return data || [];
}

export interface BlockStatus {
  blockedByMe: boolean;
  blockedMe: boolean;
}

/** Block relationship (both directions) between `viewerId` and `otherUserId`. */
export async function getBlockStatus(viewerId: string, otherUserId: string): Promise<BlockStatus> {
  const { data, error } = await supabase
    .from('blocks')
    .select('blocker_id, blocked_id')
    .or(
      `and(blocker_id.eq.${viewerId},blocked_id.eq.${otherUserId}),and(blocker_id.eq.${otherUserId},blocked_id.eq.${viewerId})`
    );
  if (error) throw error;

  return {
    blockedByMe: (data || []).some((b: any) => b.blocker_id === viewerId),
    blockedMe: (data || []).some((b: any) => b.blocker_id === otherUserId),
  };
}

/** Block or unblock a user. Pass the current "blocked by me" state. */
export async function toggleBlock(targetUserId: string, currentlyBlocked: boolean) {
  const user = await requireUser();

  if (currentlyBlocked) {
    const { error } = await supabase
      .from('blocks')
      .delete()
      .eq('blocker_id', user.id)
      .eq('blocked_id', targetUserId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('blocks')
      .insert({ blocker_id: user.id, blocked_id: targetUserId });
    if (error) throw error;
  }
}
