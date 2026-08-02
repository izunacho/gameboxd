-- 007: Notifications
--
-- Notifies a user when someone they follow posts a new review, and when
-- someone starts following them. Rows are only ever created by the
-- SECURITY DEFINER trigger functions below — there is no INSERT policy,
-- so no client can forge a notification for another user.

create table notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,   -- recipient
  actor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- who caused it
  type TEXT NOT NULL CHECK (type IN ('new_review', 'new_follower')),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,        -- only for new_review
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_actor_id ON notifications(actor_id);
CREATE INDEX idx_notifications_review_id ON notifications(review_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

create policy "Users can view their own notifications" on notifications
  for select using (auth.uid() = user_id);

create policy "Users can mark their own notifications read" on notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- No INSERT policy on purpose — only the SECURITY DEFINER trigger functions
-- below (which bypass RLS) may create notifications.

create or replace function public.notify_followers_of_new_review()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.notifications (user_id, actor_id, type, review_id)
  select f.follower_id, new.user_id, 'new_review', new.id
  from public.follows f
  where f.following_id = new.user_id
    and not exists (
      select 1 from public.blocks b
      where (b.blocker_id = f.follower_id and b.blocked_id = new.user_id)
         or (b.blocker_id = new.user_id and b.blocked_id = f.follower_id)
    );
  return new;
end;
$$;

-- AFTER INSERT only (not UPDATE): submitReview()'s upsert only hits this
-- trigger the first time a user reviews a given game, so editing a review
-- never re-notifies followers.
create trigger reviews_notify_followers
  after insert on reviews
  for each row execute procedure public.notify_followers_of_new_review();

create or replace function public.notify_new_follower()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.notifications (user_id, actor_id, type)
  values (new.following_id, new.follower_id, 'new_follower');
  return new;
end;
$$;

create trigger follows_notify_new_follower
  after insert on follows
  for each row execute procedure public.notify_new_follower();
