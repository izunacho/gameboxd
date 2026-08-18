-- 012: Patreon links
--
-- Maps a Hitboxd account to the Patreon account it verified ownership of via
-- OAuth. This cannot be a plain column on `users`: it must not be settable
-- by its own owner, or anyone could write in someone else's Patreon id and
-- ride their membership. Only the OAuth callback and the membership webhook
-- (both running with the service role, after verifying the link with
-- Patreon itself) may write this table — same shape as premium_members in
-- migration 011.

create table patreon_links (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  patreon_user_id TEXT NOT NULL UNIQUE,
  patreon_full_name TEXT,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE patreon_links ENABLE ROW LEVEL SECURITY;

-- Unlike premium_members, this doesn't need to be publicly readable — only
-- the owner needs to see "Connected as X" in their own settings.
create policy "Users can view their own Patreon link" on patreon_links
  for select using (auth.uid() = user_id);

-- No INSERT, UPDATE or DELETE policy on purpose. Only the service role
-- (the OAuth callback, the disconnect route, and the webhook) may write here.
