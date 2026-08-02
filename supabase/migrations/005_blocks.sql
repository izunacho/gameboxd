-- 005: Blocking
--
-- Users can block each other. Blocking hides profiles and reviews mutually
-- (both directions) at the RLS layer, so every existing and future query
-- against `users`/`reviews` is automatically filtered without app changes.

create table blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CHECK (blocker_id <> blocked_id),
  UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX idx_blocks_blocker_id ON blocks(blocker_id);
CREATE INDEX idx_blocks_blocked_id ON blocks(blocked_id);

ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

-- Unlike follows/likes, the block list itself is not publicly browsable —
-- only the two parties involved can see a given block row.
create policy "Users can view their own block relationships" on blocks
  for select using (auth.uid() = blocker_id or auth.uid() = blocked_id);

create policy "Users can block others" on blocks
  for insert with check (auth.uid() = blocker_id);

create policy "Users can unblock" on blocks
  for delete using (auth.uid() = blocker_id);

-- Mutual invisibility: replace the existing public-read policies on users
-- and reviews so a blocked pair (in either direction) never see each
-- other's profile or reviews. Anonymous visitors (auth.uid() is null) are
-- unaffected — blocking only applies between the two users involved.
drop policy "Users can view public profiles" on users;
create policy "Users can view public profiles unless blocked" on users
  for select using (
    auth.uid() = id
    or not exists (
      select 1 from blocks b
      where (b.blocker_id = auth.uid() and b.blocked_id = users.id)
         or (b.blocker_id = users.id and b.blocked_id = auth.uid())
    )
  );

drop policy "Anyone can view reviews" on reviews;
create policy "Anyone can view reviews unless blocked" on reviews
  for select using (
    auth.uid() = user_id
    or not exists (
      select 1 from blocks b
      where (b.blocker_id = auth.uid() and b.blocked_id = reviews.user_id)
         or (b.blocker_id = reviews.user_id and b.blocked_id = auth.uid())
    )
  );
