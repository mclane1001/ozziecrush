-- ============================================================
-- OzzieCrush – Initial Schema
-- Target: Supabase Postgres, region ap-southeast-2 (Sydney)
-- Apply via: Supabase Dashboard → SQL Editor, or `supabase db push`
-- ============================================================

-- ============================
-- PROFILES
-- ============================
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  display_name    text not null,
  dob             date not null,
  gender          text not null,
  seeking         text[] not null default '{}',
  bio             text,
  location_suburb text,
  location_state  text,
  latitude        double precision,
  longitude       double precision,
  photos          text[] default '{}',
  verified        boolean default false,
  is_active       boolean default true,
  last_active_at  timestamptz default now(),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================
-- VERIFICATIONS
-- ============================
create table public.verifications (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references public.profiles(id) on delete cascade,
  provider           text not null,  -- 'hyperverge' | 'onfido' | 'au10tix'
  status             text not null default 'pending',  -- pending | approved | rejected
  document_type      text,           -- 'drivers_licence' | 'passport' | 'proof_of_age'
  provider_reference text,
  created_at         timestamptz default now(),
  reviewed_at        timestamptz
);

-- ============================
-- SWIPES
-- ============================
create table public.swipes (
  id         uuid primary key default gen_random_uuid(),
  swiper_id  uuid references public.profiles(id) on delete cascade,
  swiped_id  uuid references public.profiles(id) on delete cascade,
  direction  text not null check (direction in ('like','pass','superlike')),
  created_at timestamptz default now(),
  unique (swiper_id, swiped_id)
);
create index swipes_swiper_idx on public.swipes (swiper_id);
create index swipes_swiped_idx on public.swipes (swiped_id);

-- ============================
-- MATCHES
-- ============================
create table public.matches (
  id         uuid primary key default gen_random_uuid(),
  user_a     uuid references public.profiles(id) on delete cascade,
  user_b     uuid references public.profiles(id) on delete cascade,
  matched_at timestamptz default now(),
  is_active  boolean default true,
  unique (user_a, user_b)
);
create index matches_user_a_idx on public.matches (user_a);
create index matches_user_b_idx on public.matches (user_b);

-- ============================
-- MESSAGES
-- ============================
create table public.messages (
  id         uuid primary key default gen_random_uuid(),
  match_id   uuid references public.matches(id) on delete cascade,
  sender_id  uuid references public.profiles(id) on delete cascade,
  content    text not null,
  created_at timestamptz default now(),
  read_at    timestamptz
);
create index messages_match_idx on public.messages (match_id, created_at);

-- ============================
-- REPORTS (Online Safety Act 2021)
-- ============================
create table public.reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid references public.profiles(id) on delete cascade,
  reported_id  uuid references public.profiles(id) on delete cascade,
  reason       text not null check (reason in ('harassment','fake_profile','inappropriate_content','scam','other')),
  details      text,
  status       text default 'open' check (status in ('open','reviewing','actioned','dismissed')),
  created_at   timestamptz default now(),
  resolved_at  timestamptz
);

-- ============================
-- BLOCKS
-- ============================
create table public.blocks (
  id          uuid primary key default gen_random_uuid(),
  blocker_id  uuid references public.profiles(id) on delete cascade,
  blocked_id  uuid references public.profiles(id) on delete cascade,
  created_at  timestamptz default now(),
  unique (blocker_id, blocked_id)
);
create index blocks_blocker_idx on public.blocks (blocker_id);

-- ============================
-- SUBSCRIPTIONS
-- ============================
create table public.subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid references public.profiles(id) on delete cascade,
  tier                   text not null check (tier in ('free','plus','gold')),
  stripe_subscription_id text,
  status                 text not null default 'active' check (status in ('active','cancelled','past_due')),
  current_period_end     timestamptz,
  created_at             timestamptz default now()
);

-- ============================
-- PAYMENTS AUDIT
-- ============================
create table public.payments (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid references public.profiles(id) on delete cascade,
  stripe_payment_intent_id text,
  amount_cents             integer not null,
  currency                 text default 'aud',
  status                   text not null,
  created_at               timestamptz default now()
);

-- ============================
-- CONSENT LOG (Privacy Act APP 5)
-- ============================
create table public.consent_events (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.profiles(id) on delete cascade,
  consent_type text not null check (consent_type in ('privacy_policy','terms','marketing_opt_in')),
  version      text not null,
  accepted_at  timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles        enable row level security;
alter table public.verifications   enable row level security;
alter table public.swipes          enable row level security;
alter table public.matches         enable row level security;
alter table public.messages        enable row level security;
alter table public.reports         enable row level security;
alter table public.blocks          enable row level security;
alter table public.subscriptions   enable row level security;
alter table public.payments        enable row level security;
alter table public.consent_events  enable row level security;

-- Profiles
create policy "own profile rw" on public.profiles
  for all using (auth.uid() = id);

-- Verifications – users can only view their own
create policy "own verifications read" on public.verifications
  for select using (auth.uid() = user_id);

-- Swipes
create policy "own swipes" on public.swipes
  for all using (auth.uid() = swiper_id);

-- Matches
create policy "match participants" on public.matches
  for select using (auth.uid() = user_a or auth.uid() = user_b);

-- Messages
create policy "message participants" on public.messages
  for all using (
    auth.uid() in (
      select user_a from public.matches where id = match_id
      union
      select user_b from public.matches where id = match_id
    )
  );

-- Reports
create policy "own reports read"   on public.reports for select using (auth.uid() = reporter_id);
create policy "own reports insert" on public.reports for insert with check (auth.uid() = reporter_id);

-- Blocks
create policy "own blocks" on public.blocks
  for all using (auth.uid() = blocker_id);

-- Subscriptions
create policy "own subscription read" on public.subscriptions
  for select using (auth.uid() = user_id);

-- Payments
create policy "own payments read" on public.payments
  for select using (auth.uid() = user_id);

-- Consent events
create policy "own consent read"   on public.consent_events for select using (auth.uid() = user_id);
create policy "own consent insert" on public.consent_events for insert with check (auth.uid() = user_id);

-- ============================================================
-- DISCOVERY FEED FUNCTION
-- Excludes: already-swiped, blocked (either direction), reported,
--           own profile, inactive profiles, under-18
-- Called server-side only (service role) via /api/discovery/feed
-- ============================================================
create or replace function public.get_discovery_feed(
  p_user_id uuid,
  p_limit   int default 20
)
returns table (
  id              uuid,
  display_name    text,
  dob             date,
  bio             text,
  photos          text[],
  verified        boolean,
  location_suburb text,
  location_state  text
)
language sql security definer
as $$
  select
    p.id,
    p.display_name,
    p.dob,
    p.bio,
    p.photos,
    p.verified,
    p.location_suburb,
    p.location_state
  from public.profiles p
  where
    p.id != p_user_id
    and p.is_active = true
    and (current_date - p.dob) / 365 >= 18
    -- exclude already-swiped
    and p.id not in (
      select swiped_id from public.swipes where swiper_id = p_user_id
    )
    -- exclude mutual blocks
    and p.id not in (
      select blocked_id from public.blocks where blocker_id = p_user_id
      union
      select blocker_id from public.blocks where blocked_id = p_user_id
    )
    -- exclude profiles this user has reported
    and p.id not in (
      select reported_id from public.reports where reporter_id = p_user_id
    )
  order by p.last_active_at desc
  limit p_limit;
$$;

-- Grant execute to service role only (called from API layer)
revoke execute on function public.get_discovery_feed(uuid, int) from anon, authenticated;
