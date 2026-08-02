-- 009: Avatar uploads
--
-- Profile pictures live in a public Storage bucket, one folder per user
-- (avatars/<user_id>/<file>). The public users.avatar_url column already
-- exists; this migration only adds the bucket and its access rules.
--
-- Size and type limits are set on the bucket itself, so they hold even if
-- someone bypasses the upload form.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152, -- 2 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Avatars are shown next to public reviews and profiles, so reads are open.
create policy "Avatar images are publicly readable" on storage.objects
  for select using (bucket_id = 'avatars');

-- Writes are restricted to the folder named after the user's own id.
create policy "Users can upload their own avatar" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can replace their own avatar" on storage.objects
  for update to authenticated using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own avatar" on storage.objects
  for delete to authenticated using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
