-- 011: Premium members and cosmetic preferences
--
-- Premium status lives in its own table with NO client-writable policies.
-- It cannot be a column on `users`: RLS policies are row-level, not
-- column-level, and "Users can update their own profile" (001) lets a user
-- update any column of their own row. A boolean there would be one console
-- call away from being self-granted. Adding WITH CHECK wouldn't help — a
-- policy has no access to the row's previous value.
--
-- The cosmetic preferences below DO live on `users` and are user-writable:
-- storing a preference isn't the same as granting the right to use it. The
-- app only renders them for users who appear in premium_members, so a
-- non-paying user setting accent_color achieves nothing.

create table premium_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'patreon')),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE -- null means it doesn't expire
);

CREATE INDEX idx_premium_members_user_id ON premium_members(user_id);

ALTER TABLE premium_members ENABLE ROW LEVEL SECURITY;

-- Readable by everyone: other people's badges have to render for visitors,
-- including logged-out ones.
create policy "Premium status is publicly readable" on premium_members
  for select using (true);

-- No INSERT, UPDATE or DELETE policy on purpose. Only the service role
-- (the Supabase dashboard today, a payment webhook later) can grant premium.

-- Cosmetic preferences. Values are ids from src/lib/cosmetics.ts; the
-- patterns keep the column from being pointed at arbitrary strings, the
-- same way users_avatar_url_preset does for avatars in migration 010.
alter table public.users
  add column accent_color TEXT,
  add column tick_color TEXT,
  add column avatar_frame TEXT;

alter table public.users
  add constraint users_accent_color_preset
  check (accent_color is null or accent_color ~ '^[a-z]+$');

alter table public.users
  add constraint users_tick_color_preset
  check (tick_color is null or tick_color ~ '^[a-z]+$');

alter table public.users
  add constraint users_avatar_frame_preset
  check (avatar_frame is null or avatar_frame ~ '^[a-z-]+$');

-- Pre-existing gap: reviews.content got a length limit in 004 but bio never
-- did, so the 300-char cap only existed in the browser.
alter table public.users
  add constraint users_bio_max_length
  check (bio is null or char_length(bio) <= 300);
