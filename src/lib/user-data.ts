/**
 * User data persistence — reviews and game interactions in Supabase.
 * All functions run client-side with the user's session (RLS enforced).
 */

import { supabase } from './supabase';
import { IGDBGame, getIGDBImageUrl } from './igdb';

export type InteractionType = 'played' | 'wishlist' | 'liked';

export interface UserInteraction {
  id: string;
  gameId: number; // IGDB id
  type: InteractionType;
}

export interface CommunityReview {
  id: string;
  rating: number;
  content: string | null;
  created_at: string;
  username: string;
}

export interface LibraryGame {
  igdb_id: number;
  name: string;
  background_image: string | null;
  released: string | null;
}

/**
 * Make sure the game exists in our catalog table and return its row UUID.
 * Select-then-insert avoids needing an UPDATE policy on games.
 */
async function ensureGame(game: IGDBGame): Promise<string> {
  const existing = await supabase
    .from('games')
    .select('id')
    .eq('igdb_id', game.id)
    .maybeSingle();
  if (existing.data?.id) return existing.data.id;

  const inserted = await supabase
    .from('games')
    .insert({
      igdb_id: game.id,
      name: game.name,
      background_image: game.cover?.image_id
        ? getIGDBImageUrl(game.cover.image_id, 'cover_big')
        : null,
      released: game.first_release_date
        ? new Date(game.first_release_date * 1000).toISOString().slice(0, 10)
        : null,
    })
    .select('id')
    .single();
  if (inserted.data?.id) return inserted.data.id;

  // Someone else may have inserted it in between — read again
  const retry = await supabase
    .from('games')
    .select('id')
    .eq('igdb_id', game.id)
    .single();
  if (retry.error) throw retry.error;
  return retry.data.id;
}

async function requireUser() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('NOT_LOGGED_IN');
  return data.user;
}

/** Create or update the current user's review for a game. */
export async function submitReview(game: IGDBGame, rating: number, content: string) {
  const user = await requireUser();
  const gameId = await ensureGame(game);

  const { error } = await supabase.from('reviews').upsert(
    {
      game_id: gameId,
      user_id: user.id,
      rating,
      content: content.trim() || null,
    },
    { onConflict: 'game_id,user_id' }
  );
  if (error) throw error;
}

/** All community reviews for a game, newest first. */
export async function getGameReviews(igdbId: number): Promise<CommunityReview[]> {
  const { data: gameRow } = await supabase
    .from('games')
    .select('id')
    .eq('igdb_id', igdbId)
    .maybeSingle();
  if (!gameRow) return [];

  const { data, error } = await supabase
    .from('reviews')
    .select('id, rating, content, created_at, users(username)')
    .eq('game_id', gameRow.id)
    .order('created_at', { ascending: false });
  if (error) throw error;

  return (data || []).map((r: any) => ({
    id: r.id,
    rating: r.rating,
    content: r.content,
    created_at: r.created_at,
    username: r.users?.username || 'anonymous',
  }));
}

/** The current user's interactions (played/wishlist/liked), keyed by IGDB id. */
export async function loadMyInteractions(): Promise<UserInteraction[]> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];

  const { data, error } = await supabase
    .from('interactions')
    .select('id, type, games(igdb_id)')
    .eq('user_id', auth.user.id);
  if (error) throw error;

  return (data || [])
    .map((i: any) => ({ id: i.id, gameId: i.games?.igdb_id, type: i.type }))
    .filter((i: UserInteraction) => typeof i.gameId === 'number');
}

/** Persist a new interaction. Returns the stored row. */
export async function addInteractionDb(
  game: IGDBGame,
  type: InteractionType
): Promise<UserInteraction> {
  const user = await requireUser();
  const gameId = await ensureGame(game);

  const { data, error } = await supabase
    .from('interactions')
    .insert({ game_id: gameId, user_id: user.id, type })
    .select('id')
    .single();
  if (error) throw error;

  return { id: data.id, gameId: game.id, type };
}

/** Remove an interaction by row id. */
export async function removeInteractionDb(interactionId: string) {
  const { error } = await supabase.from('interactions').delete().eq('id', interactionId);
  if (error) throw error;
}

export interface FeedReview {
  id: string;
  rating: number;
  content: string | null;
  created_at: string;
  username: string;
  game: LibraryGame;
}

/**
 * Community feed: latest reviews from all users, newest first.
 * Paginated — pass increasing `page` values to load more.
 */
export async function getCommunityFeed(page = 0, pageSize = 20): Promise<FeedReview[]> {
  const from = page * pageSize;
  const { data, error } = await supabase
    .from('reviews')
    .select(
      'id, rating, content, created_at, users(username), games(igdb_id, name, background_image, released)'
    )
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1);
  if (error) throw error;

  return (data || [])
    .filter((r: any) => r.games)
    .map((r: any) => ({
      id: r.id,
      rating: r.rating,
      content: r.content,
      created_at: r.created_at,
      username: r.users?.username || 'anonymous',
      game: r.games,
    }));
}

export interface MyLibrary {
  interactions: Array<{ id: string; type: InteractionType; game: LibraryGame }>;
  reviews: Array<{
    id: string;
    rating: number;
    content: string | null;
    created_at: string;
    game: LibraryGame;
  }>;
}

/** Saved games and written reviews for any user id. */
async function fetchLibraryFor(userId: string): Promise<MyLibrary> {
  const [ints, revs] = await Promise.all([
    supabase
      .from('interactions')
      .select('id, type, created_at, games(igdb_id, name, background_image, released)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('reviews')
      .select('id, rating, content, created_at, games(igdb_id, name, background_image, released)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
  ]);
  if (ints.error) throw ints.error;
  if (revs.error) throw revs.error;

  return {
    interactions: (ints.data || [])
      .filter((i: any) => i.games)
      .map((i: any) => ({ id: i.id, type: i.type, game: i.games })),
    reviews: (revs.data || [])
      .filter((r: any) => r.games)
      .map((r: any) => ({
        id: r.id,
        rating: r.rating,
        content: r.content,
        created_at: r.created_at,
        game: r.games,
      })),
  };
}

/** Everything for the logged-in user's profile page. */
export async function loadMyLibrary(): Promise<MyLibrary> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { interactions: [], reviews: [] };
  return fetchLibraryFor(auth.user.id);
}

export interface PublicProfile {
  username: string;
  bio: string | null;
  created_at: string;
  library: MyLibrary;
}

/** Public profile by username — viewable by anyone. Returns null if not found. */
export async function getPublicProfile(username: string): Promise<PublicProfile | null> {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, username, bio, created_at')
    .eq('username', username)
    .maybeSingle();
  if (error) throw error;
  if (!user) return null;

  return {
    username: user.username,
    bio: user.bio,
    created_at: user.created_at,
    library: await fetchLibraryFor(user.id),
  };
}
