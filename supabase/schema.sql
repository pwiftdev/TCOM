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
  banner_url text,
  icon_url text,
  owner_id uuid references users(id) on delete set null,
  visibility text default 'public' check (visibility in ('public','private','invite')),
  member_count int default 0,
  post_count int default 0,
  tags text[] default '{}',
  created_at timestamptz default now()
);

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

create index if not exists idx_posts_community_created on posts(community_id, created_at desc);

create or replace function increment_like_count(post_uuid uuid) returns void language sql as $$
  update posts set like_count = like_count + 1 where id = post_uuid;
$$;
create or replace function decrement_like_count(post_uuid uuid) returns void language sql as $$
  update posts set like_count = greatest(0, like_count - 1) where id = post_uuid;
$$;
create or replace function increment_reply_count(post_uuid uuid) returns void language sql as $$
  update posts set reply_count = reply_count + 1 where id = post_uuid;
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
