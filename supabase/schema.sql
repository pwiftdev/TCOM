create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  x_id text unique not null,
  username text not null,
  display_name text,
  avatar_url text,
  bio text,
  followers_count int default 0,
  following_count int default 0,
  x_access_token text,
  x_refresh_token text,
  last_x_sync timestamptz,
  created_at timestamptz default now()
);

create table if not exists communities (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  contract_address text,
  pump_fun_link text,
  banner_url text,
  icon_url text,
  owner_id uuid references users(id) on delete set null,
  visibility text default 'public' check (visibility in ('public','private','invite')),
  member_count int default 0,
  post_count int default 0,
  tags text[] default '{}',
  created_at timestamptz default now()
);

alter table communities add column if not exists contract_address text;
alter table communities add column if not exists pump_fun_link text;

create table if not exists community_members (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references communities(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  role text default 'member' check (role in ('member','moderator','owner')),
  joined_at timestamptz default now(),
  unique(community_id, user_id)
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references communities(id) on delete cascade,
  author_id uuid references users(id) on delete set null,
  parent_post_id uuid references posts(id) on delete cascade,
  content text not null check (char_length(content) <= 500),
  media_urls text[] default '{}',
  like_count int default 0,
  reply_count int default 0,
  is_pinned bool default false,
  created_at timestamptz default now()
);

create table if not exists post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

create table if not exists community_invites (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references communities(id) on delete cascade,
  created_by uuid references users(id) on delete set null,
  max_uses int,
  use_count int default 0,
  expires_at timestamptz
);

create table if not exists community_bans (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references communities(id) on delete cascade not null,
  user_id uuid references users(id) on delete cascade not null,
  banned_by uuid references users(id) on delete set null,
  reason text,
  created_at timestamptz default now(),
  unique(community_id, user_id)
);

create index if not exists idx_posts_community_created on posts(community_id, created_at desc);
create index if not exists idx_community_bans_community on community_bans(community_id, created_at desc);

create or replace function increment_like_count(post_uuid uuid) returns void language sql as $$
  update posts set like_count = like_count + 1 where id = post_uuid;
$$;
create or replace function decrement_like_count(post_uuid uuid) returns void language sql as $$
  update posts set like_count = greatest(0, like_count - 1) where id = post_uuid;
$$;
create or replace function increment_reply_count(post_uuid uuid) returns void language sql as $$
  update posts set reply_count = reply_count + 1 where id = post_uuid;
$$;
create or replace function decrement_reply_count(post_uuid uuid) returns void language sql as $$
  update posts set reply_count = greatest(0, reply_count - 1) where id = post_uuid;
$$;
create or replace function decrement_post_count(community_slug text) returns void language sql as $$
  update communities set post_count = greatest(0, post_count - 1) where slug = community_slug;
$$;
create or replace function increment_member_count(community_slug text) returns void language sql as $$
  update communities set member_count = member_count + 1 where slug = community_slug;
$$;
create or replace function decrement_member_count(community_slug text) returns void language sql as $$
  update communities set member_count = greatest(0, member_count - 1) where slug = community_slug;
$$;
create or replace function increment_post_count(community_slug text) returns void language sql as $$
  update communities set post_count = post_count + 1 where slug = community_slug;
$$;

-- Voice chat feature removed
drop index if exists idx_voice_rooms_community_active;
drop table if exists community_voice_rooms;

-- Storage bucket for post media (frontend uploads directly)
insert into storage.buckets (id, name, public)
values ('post-media', 'post-media', true)
on conflict (id) do update set public = excluded.public;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'post_media_public_read'
  ) then
    create policy post_media_public_read
      on storage.objects
      for select
      using (bucket_id = 'post-media');
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'post_media_public_insert'
  ) then
    create policy post_media_public_insert
      on storage.objects
      for insert
      with check (bucket_id = 'post-media');
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'post_media_public_update'
  ) then
    create policy post_media_public_update
      on storage.objects
      for update
      using (bucket_id = 'post-media')
      with check (bucket_id = 'post-media');
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'post_media_public_delete'
  ) then
    create policy post_media_public_delete
      on storage.objects
      for delete
      using (bucket_id = 'post-media');
  end if;
end
$$;

-- Storage buckets for community assets (backend uploads)
insert into storage.buckets (id, name, public)
values
  ('community-banners', 'community-banners', true),
  ('community-icons', 'community-icons', true)
on conflict (id) do update set public = excluded.public;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'community_banners_public_read'
  ) then
    create policy community_banners_public_read
      on storage.objects
      for select
      using (bucket_id = 'community-banners');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'community_icons_public_read'
  ) then
    create policy community_icons_public_read
      on storage.objects
      for select
      using (bucket_id = 'community-icons');
  end if;
end
$$;
