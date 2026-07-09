-- 003: Adapt the games catalog to IGDB and allow users to populate it.

-- The column was named after the old RAWG API; we store IGDB ids now.
alter table games rename column rawg_id to igdb_id;

-- Logged-in users can add games to the shared catalog.
-- Needed the first time anyone reviews or saves a game.
create policy "Authenticated users can add games" on games
  for insert to authenticated with check (true);
