-- 008: Web Push subscriptions
--
-- One row per browser/device that opted into push alerts. The client
-- registers/removes its own subscription; the /api/push/notify server
-- route reads them with the service role key (bypasses RLS) to deliver
-- pushes when a notification row is inserted.

create table push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

create policy "Users can view their own push subscriptions" on push_subscriptions
  for select using (auth.uid() = user_id);

create policy "Users can register their own push subscriptions" on push_subscriptions
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own push subscriptions" on push_subscriptions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can remove their own push subscriptions" on push_subscriptions
  for delete using (auth.uid() = user_id);
