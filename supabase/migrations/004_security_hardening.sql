-- 004: Security hardening
--
-- FIX 1 (important): user emails were publicly readable.
-- The "Users can view public profiles" policy allows SELECT for everyone,
-- and the table contained the email column — so anyone with the public anon
-- key could list every registered email. The email already lives safely in
-- auth.users (never exposed); the public profile doesn't need a copy.
alter table public.users drop column if exists email;

-- Trigger updated: no longer writes email, and survives username collisions
-- (appends a random suffix instead of failing the whole signup).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_username text;
begin
  base_username := coalesce(
    nullif(trim(new.raw_user_meta_data->>'username'), ''),
    split_part(new.email, '@', 1)
  );

  begin
    insert into public.users (id, username)
    values (new.id, base_username)
    on conflict (id) do nothing;
  exception when unique_violation then
    insert into public.users (id, username)
    values (new.id, base_username || '_' || substr(md5(random()::text), 1, 4))
    on conflict (id) do nothing;
  end;

  return new;
end;
$$;

-- FIX 2: server-side size limits. The 500-char limit on reviews only lived
-- in the browser; anyone could bypass it and insert megabytes of text.
alter table public.reviews
  add constraint reviews_content_max_length
  check (content is null or char_length(content) <= 2000);

alter table public.users
  add constraint users_username_max_length
  check (char_length(username) between 1 and 40);
