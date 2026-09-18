-- Additive migration: keeps the existing tables and backfills the new contract.

alter table public.artists
  add column if not exists slug text,
  add column if not exists biography text,
  add column if not exists image_url text,
  add column if not exists website text,
  add column if not exists created_at timestamptz default now();

update public.artists
set biography = coalesce(nullif(biography, ''), bio, ''),
    image_url = coalesce(nullif(image_url, ''), profile_image_url)
where biography is null or image_url is null;

update public.artists
set slug = lower(regexp_replace(trim(name), '[^a-zA-Z0-9]+', '-', 'g'))
where slug is null or slug = '';

alter table public.artists alter column biography set default '';
alter table public.artists alter column biography set not null;
alter table public.artists alter column created_at set not null;

alter table public.releases
  add column if not exists slug text,
  add column if not exists type text,
  add column if not exists created_at timestamptz default now();

update public.releases
set type = coalesce(nullif(type, ''), release_type),
    slug = coalesce(nullif(slug, ''), lower(regexp_replace(trim(title), '[^a-zA-Z0-9]+', '-', 'g')))
where type is null or slug is null or slug = '';

alter table public.releases alter column type set not null;
alter table public.releases alter column slug set not null;
alter table public.releases alter column created_at set not null;

alter table public.tracks
  add column if not exists duration text,
  add column if not exists track_order integer;

update public.tracks
set track_order = coalesce(track_order, track_number)
where track_order is null;

alter table public.tracks alter column track_order set not null;
alter table public.tracks add constraint tracks_track_order_positive check (track_order > 0);

alter table public.platform_links
  add column if not exists release_id uuid references public.releases(id) on delete cascade,
  add column if not exists label text;

alter table public.platform_links alter column artist_id drop not null;
alter table public.platform_links add constraint platform_links_parent_check check (artist_id is not null or release_id is not null);
alter table public.platform_links add constraint platform_links_url_check check (url ~* '^https?://') not valid;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'platform_links_platform_check') then
    alter table public.platform_links add constraint platform_links_platform_check check (platform in ('SoundCloud', 'Spotify', 'Apple Music', 'YouTube Music', 'YouTube', 'Bandcamp', 'Deezer', 'Tidal', 'Custom'));
  end if;
end $$;

create unique index if not exists artists_slug_unique_idx on public.artists(slug);
create unique index if not exists releases_artist_slug_unique_idx on public.releases(artist_id, slug);
create unique index if not exists tracks_release_order_unique_idx on public.tracks(release_id, track_order);
create index if not exists releases_public_feed_idx on public.releases(published, release_date desc);
create index if not exists platform_links_release_order_idx on public.platform_links(release_id, sort_order);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'releases_type_check') then
    alter table public.releases add constraint releases_type_check check (type in ('single', 'album'));
  end if;
end $$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "Public can read artists" on public.artists;
drop policy if exists "Public can read published releases" on public.releases;
drop policy if exists "Public can read tracks from published releases" on public.tracks;
drop policy if exists "Public can read published platform links" on public.platform_links;
drop policy if exists "Admins can manage artists" on public.artists;
drop policy if exists "Admins can manage releases" on public.releases;
drop policy if exists "Admins can manage tracks" on public.tracks;
drop policy if exists "Admins can manage platform links" on public.platform_links;

create policy "Public can read artists"
  on public.artists for select to anon, authenticated using (true);

create policy "Public can read published releases"
  on public.releases for select to anon, authenticated using (published = true);

create policy "Public can read tracks from published releases"
  on public.tracks for select to anon, authenticated
  using (exists (select 1 from public.releases where releases.id = tracks.release_id and releases.published = true));

create policy "Public can read platform links"
  on public.platform_links for select to anon, authenticated using (published = true);

create policy "Admins can manage artists"
  on public.artists for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Admins can manage releases"
  on public.releases for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Admins can manage tracks"
  on public.tracks for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Admins can manage platform links"
  on public.platform_links for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('artwork', 'artwork', true), ('audio', 'audio', false)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public can view artwork" on storage.objects;
drop policy if exists "Admins can manage artwork" on storage.objects;
drop policy if exists "Admins can manage audio" on storage.objects;

create policy "Public can view artwork"
  on storage.objects for select to anon, authenticated using (bucket_id = 'artwork');

create policy "Admins can upload artwork"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'artwork'
    and public.is_admin()
    and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp', 'avif')
    and (metadata ->> 'mimetype') in ('image/jpeg', 'image/png', 'image/webp', 'image/avif')
    and nullif(metadata ->> 'size', '')::bigint between 1 and 10485760
  );

create policy "Admins can update artwork"
  on storage.objects for update to authenticated
  using (bucket_id = 'artwork' and public.is_admin())
  with check (bucket_id = 'artwork' and public.is_admin());

create policy "Admins can delete artwork"
  on storage.objects for delete to authenticated using (bucket_id = 'artwork' and public.is_admin());

create policy "Admins can upload audio"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'audio'
    and public.is_admin()
    and lower(storage.extension(name)) in ('mp3', 'wav', 'm4a', 'ogg', 'flac')
    and (metadata ->> 'mimetype') in ('audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/ogg', 'audio/flac')
    and nullif(metadata ->> 'size', '')::bigint between 1 and 104857600
  );

create policy "Admins can read audio"
  on storage.objects for select to authenticated using (bucket_id = 'audio' and public.is_admin());

create policy "Admins can update audio"
  on storage.objects for update to authenticated
  using (bucket_id = 'audio' and public.is_admin())
  with check (bucket_id = 'audio' and public.is_admin());

create policy "Admins can delete audio"
  on storage.objects for delete to authenticated using (bucket_id = 'audio' and public.is_admin());