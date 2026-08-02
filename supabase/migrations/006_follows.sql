-- 006: Following
--
-- Users can follow/unfollow each other. Following someone who has blocked
-- you (or whom you've blocked) is rejected at the RLS layer. Blocking
-- severs any existing follow relationship in both directions.

create table follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CHECK (follower_id <> following_id),
  UNIQUE(follower_id, following_id)
);

CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

create policy "Anyone can view follows" on follows
  for select using (true);

create policy "Users can follow others" on follows
  for insert with check (
    auth.uid() = follower_id
    and not exists (
      select 1 from blocks b
      where (b.blocker_id = auth.uid() and b.blocked_id = following_id)
         or (b.blocker_id = following_id and b.blocked_id = auth.uid())
    )
  );

create policy "Users can unfollow" on follows
  for delete using (auth.uid() = follower_id);

-- Blocking severs any existing follow relationship, in both directions.
-- Lives here (not in 005_blocks.sql) because `follows` must exist first.
create or replace function public.sever_follows_on_block()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  delete from public.follows
  where (follower_id = new.blocker_id and following_id = new.blocked_id)
     or (follower_id = new.blocked_id and following_id = new.blocker_id);
  return new;
end;
$$;

create trigger blocks_sever_follows
  after insert on blocks
  for each row execute procedure public.sever_follows_on_block();
