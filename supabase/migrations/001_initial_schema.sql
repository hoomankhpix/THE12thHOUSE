create table public.artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bio text not null default '',
  profile_image_url text,
  homepage_content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.releases (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  title text not null,
  release_type text not null check (release_type in ('single', 'album')),
  release_date date not null,
  description text not null default '',
  artwork_url text,
  featured boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tracks (
  id uuid primary key default gen_random_uuid(),
  release_id uuid not null references public.releases(id) on delete cascade,
  title text not null,
  audio_url text,
  track_number integer not null check (track_number > 0),
  created_at timestamptz not null default now(),
  unique (release_id, track_number)
);

create table public.platform_links (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  platform text not null,
  url text not null,
  sort_order integer not null default 0,
  published boolean not null default true
);

create index releases_artist_published_idx on public.releases(artist_id, published, release_date desc);
create index releases_featured_idx on public.releases(featured) where featured = true;
create index tracks_release_order_idx on public.tracks(release_id, track_number);
create index platform_links_artist_order_idx on public.platform_links(artist_id, sort_order);

alter table public.artists enable row level security;
alter table public.releases enable row level security;
alter table public.tracks enable row level security;
alter table public.platform_links enable row level security;

create policy "Public can read artists" on public.artists for select using (true);
create policy "Public can read published releases" on public.releases for select using (published = true);
create policy "Public can read tracks from published releases" on public.tracks for select using (exists (select 1 from public.releases where releases.id = tracks.release_id and releases.published = true));
create policy "Public can read published platform links" on public.platform_links for select using (published = true);

create policy "Admins can manage artists" on public.artists for all using (auth.jwt() ->> 'role' = 'admin') with check (auth.jwt() ->> 'role' = 'admin');
create policy "Admins can manage releases" on public.releases for all using (auth.jwt() ->> 'role' = 'admin') with check (auth.jwt() ->> 'role' = 'admin');
create policy "Admins can manage tracks" on public.tracks for all using (auth.jwt() ->> 'role' = 'admin') with check (auth.jwt() ->> 'role' = 'admin');
create policy "Admins can manage platform links" on public.platform_links for all using (auth.jwt() ->> 'role' = 'admin') with check (auth.jwt() ->> 'role' = 'admin');

insert into storage.buckets (id, name, public) values ('artwork', 'artwork', true), ('audio', 'audio', false) on conflict (id) do nothing;

create policy "Public can view artwork" on storage.objects for select using (bucket_id = 'artwork');
create policy "Admins can manage artwork" on storage.objects for all using (bucket_id = 'artwork' and auth.jwt() ->> 'role' = 'admin') with check (bucket_id = 'artwork' and auth.jwt() ->> 'role' = 'admin');
create policy "Admins can manage audio" on storage.objects for all using (bucket_id = 'audio' and auth.jwt() ->> 'role' = 'admin') with check (bucket_id = 'audio' and auth.jwt() ->> 'role' = 'admin');