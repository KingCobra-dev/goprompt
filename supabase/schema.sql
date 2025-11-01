-- PromptsGo simplified schema for Supabase

-- Ensure required extensions
create extension if not exists pgcrypto;

-- Users table (profiles)
create table if not exists users (
  id uuid primary key default auth.uid(),
  username text unique not null,
  email text unique not null,
  full_name text,
  bio text,
  avatar_url text,
  role text default 'free' check (role in ('free','pro','admin')),
  subscription_status text default 'active' check (subscription_status in ('active','cancelled','past_due')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Repositories
create table if not exists repos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  description text,
  visibility text default 'public' check (visibility in ('public','private')),
  star_count int default 0,
  fork_count int default 0,
  tags jsonb default '[]',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, name)
);

-- Prompts
create table if not exists prompts (
  id uuid primary key default gen_random_uuid(),
  repo_id uuid not null references repos(id) on delete cascade,
  title text not null,
  content text not null,
  description text,
  type text default 'text' check (type in ('text','image','code','conversation','agent','chain')),
  model_compatibility jsonb default '[]',
  tags jsonb default '[]',
  visibility text default 'public' check (visibility in ('public','private')),
  category text default 'other',
  language text,
  version text default '1.0.0',
  parent_id uuid references prompts(id),
  view_count int default 0,
  hearts int default 0,
  save_count int default 0,
  fork_count int default 0,
  comment_count int default 0,
  template text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Stars
create table if not exists stars (
  user_id uuid not null references users(id) on delete cascade,
  repo_id uuid not null references repos(id) on delete cascade,
  created_at timestamp with time zone default now(),
  primary key (user_id, repo_id)
);

-- Saves
create table if not exists saves (
  user_id uuid not null references users(id) on delete cascade,
  repo_id uuid not null references repos(id) on delete cascade,
  created_at timestamp with time zone default now(),
  primary key (user_id, repo_id)
);

-- Comments
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  repo_id uuid references repos(id) on delete cascade,
  prompt_id uuid references prompts(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Prompt Images
create table if not exists prompt_images (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid not null references prompts(id) on delete cascade,
  url text not null,
  alt_text text,
  caption text,
  is_primary boolean default false,
  size int,
  mime_type text,
  width int,
  height int,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table users enable row level security;
alter table repos enable row level security;
alter table prompts enable row level security;
alter table stars enable row level security;
alter table saves enable row level security;
alter table comments enable row level security;
alter table prompt_images enable row level security;

-- Example RLS policies
create policy if not exists "Users can view public repos" on repos for select using (visibility = 'public' or user_id = auth.uid());
create policy if not exists "Users can create their own repos" on repos for insert with check (auth.uid() = user_id);

-- Repo owner can update/delete
create policy if not exists "Users can update own repos" on repos for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists "Users can delete own repos" on repos for delete using (auth.uid() = user_id);

-- Public read access to basic user profiles (demo/dev)
create policy if not exists "Public can read user profiles" on users for select using (true);
-- Users can update their own profile
create policy if not exists "Users can update own profile" on users for update using (auth.uid() = id) with check (auth.uid() = id);

-- Prompts policies: visible if parent repo is public or owned by user
create policy if not exists "Select prompts if repo public or owner" on prompts
  for select using (
    exists(
      select 1 from repos r where r.id = prompts.repo_id and (r.visibility = 'public' or r.user_id = auth.uid())
    )
  );

create policy if not exists "Insert prompts into own repo" on prompts
  for insert with check (
    exists(
      select 1 from repos r where r.id = repo_id and r.user_id = auth.uid()
    )
  );

create policy if not exists "Update prompts in own repo" on prompts
  for update using (
    exists(
      select 1 from repos r where r.id = prompts.repo_id and r.user_id = auth.uid()
    )
  ) with check (
    exists(
      select 1 from repos r where r.id = prompts.repo_id and r.user_id = auth.uid()
    )
  );

create policy if not exists "Delete prompts in own repo" on prompts
  for delete using (
    exists(
      select 1 from repos r where r.id = prompts.repo_id and r.user_id = auth.uid()
    )
  );

-- Stars & saves: users can manage their own rows
create policy if not exists "User can read own stars" on stars for select using (user_id = auth.uid());
create policy if not exists "User can star repos" on stars for insert with check (user_id = auth.uid());
create policy if not exists "User can unstar" on stars for delete using (user_id = auth.uid());

create policy if not exists "User can read own saves" on saves for select using (user_id = auth.uid());
create policy if not exists "User can save repos" on saves for insert with check (user_id = auth.uid());
create policy if not exists "User can unsave" on saves for delete using (user_id = auth.uid());

-- Comments: allow reading; write restricted to owner
create policy if not exists "Anyone can read comments" on comments for select using (true);
create policy if not exists "User can create comments" on comments for insert with check (user_id = auth.uid());
create policy if not exists "User can update own comments" on comments for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy if not exists "Select prompt images if prompt accessible" on prompt_images
  for select using (
    exists(
      select 1 from prompts p
      join repos r on r.id = p.repo_id
      where p.id = prompt_images.prompt_id and (r.visibility = 'public' or r.user_id = auth.uid())
    )
  );

create policy if not exists "Insert images into own prompts" on prompt_images
  for insert with check (
    exists(
      select 1 from prompts p
      join repos r on r.id = p.repo_id
      where p.id = prompt_id and r.user_id = auth.uid()
    )
  );

create policy if not exists "Update images in own prompts" on prompt_images
  for update using (
    exists(
      select 1 from prompts p
      join repos r on r.id = p.repo_id
      where p.id = prompt_images.prompt_id and r.user_id = auth.uid()
    )
  );

create policy if not exists "Delete images in own prompts" on prompt_images
  for delete using (
    exists(
      select 1 from prompts p
      join repos r on r.id = p.repo_id
      where p.id = prompt_images.prompt_id and r.user_id = auth.uid()
    )
  );

-- -------------------------------
-- Auth → Public users sync trigger
-- Automatically create a row in public.users when a new auth user signs up
-- -------------------------------

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- derive a base username from metadata or email
  declare base_username text;
  declare final_username text;
  begin
  base_username := coalesce(new.raw_user_meta_data->>'user_name', split_part(new.email, '@', 1));
  final_username := public.generate_unique_username(base_username);

  insert into public.users (id, email, username, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    final_username,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    'free'
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

-- Keep email/name/avatar in sync on auth.users updates (optional)
create or replace function public.sync_auth_user_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.users
     set email = new.email,
         full_name = coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', full_name),
         avatar_url = coalesce(new.raw_user_meta_data->>'avatar_url', avatar_url)
   where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update on auth.users
  for each row execute procedure public.sync_auth_user_update();

-- ----------------------------------
-- Unique username helper
-- Generates an available username by appending a numeric suffix if needed
-- ----------------------------------
create or replace function public.generate_unique_username(base text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  candidate text := lower(regexp_replace(base, '[^a-z0-9_]+', '', 'g'));
  suffix int := 0;
begin
  if candidate is null or length(candidate) = 0 then
    candidate := 'user';
  end if;

  -- ensure starts with a letter
  if candidate ~ '^[0-9]' then
    candidate := 'u_' || candidate;
  end if;

  -- loop until we find a free username
  while exists (select 1 from public.users u where u.username = candidate) loop
    suffix := suffix + 1;
    candidate := lower(regexp_replace(base, '[^a-z0-9_]+', '', 'g')) || suffix::text;
    if candidate ~ '^[0-9]' then
      candidate := 'u_' || candidate;
    end if;
  end loop;
  return candidate;
end;
$$;

-- Indexes
create index if not exists idx_repos_user_id on repos(user_id);
create index if not exists idx_repos_visibility on repos(visibility);
create index if not exists idx_prompts_repo_id on prompts(repo_id);
create index if not exists idx_prompt_images_prompt_id on prompt_images(prompt_id);
create index if not exists idx_stars_user_id on stars(user_id);
create index if not exists idx_stars_repo_id on stars(repo_id);
create index if not exists idx_comments_repo_id on comments(repo_id);
create index if not exists idx_comments_user_id on comments(user_id);