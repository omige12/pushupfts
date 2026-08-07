create type public.fitness_goal as enum ('Ganhar força', 'Perder peso', 'Condicionamento', 'Massa muscular');

create table public.profiles (
    id uuid references auth.users(id) on delete cascade primary key,
    player_id text unique not null,
    name text not null,
    age integer,
    weight integer,
    height integer,
    goal fitness_goal default 'Ganhar força',
    level integer default 1 not null,
    xp bigint default 0 not null,
    wins integer default 0 not null,
    losses integer default 0 not null,
    record integer default 0 not null,
    total_pushups integer default 0 not null,
    streak integer default 0 not null,
    avatar_url text,
    achievements text[] default '{}',
    updated_at timestamp with time zone default now()
);

create table public.matches (
    id uuid primary key default gen_random_uuid(),
    player_id uuid references public.profiles(id) on delete cascade not null,
    opponent_name text not null,
    opponent_avatar text,
    duration integer not null, -- seconds
    player_score integer default 0 not null,
    opponent_score integer default 0 not null,
    status text default 'ongoing' check (status in ('ongoing', 'completed', 'abandoned')),
    result text check (result in ('win', 'loss', 'draw')),
    xp_gained integer default 0,
    created_at timestamp with time zone default now(),
    finished_at timestamp with time zone
);

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.matches to authenticated;
grant all on public.profiles to service_role;
grant all on public.matches to service_role;

alter table public.profiles enable row level security;
alter table public.matches enable row level security;

create policy "Users can view their own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "Users can insert their own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);

create policy "Users can view their own matches" on public.matches for select to authenticated using (auth.uid() = player_id);
create policy "Users can insert their own matches" on public.matches for insert to authenticated with check (auth.uid() = player_id);
create policy "Users can update their own matches" on public.matches for update to authenticated using (auth.uid() = player_id);