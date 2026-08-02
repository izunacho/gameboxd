-- 010: Preset avatars
--
-- Profile pictures are chosen from a fixed set of app-provided sprites in
-- /public/avatars, so avatar_url always points at one of our own static
-- files. The constraint keeps it that way even if someone writes to the
-- column directly: without it, any string would be accepted and rendered,
-- which would let a user point their avatar at an arbitrary external URL.
--
-- Replaces the earlier uploads approach. If the avatars storage bucket was
-- created for that, it is no longer used and can be deleted from
-- Storage in the Supabase dashboard.

-- Clear anything that isn't a preset (e.g. an uploaded file URL), otherwise
-- the constraint below cannot be added.
update public.users
set avatar_url = null
where avatar_url is not null
  and avatar_url !~ '^/avatars/[a-z0-9-]+\.svg$';

alter table public.users
  add constraint users_avatar_url_preset
  check (avatar_url is null or avatar_url ~ '^/avatars/[a-z0-9-]+\.svg$');
