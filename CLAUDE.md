# CLAUDE.md — OzzieCrush Build Specification

**Project:** OzzieCrush
**Domain:** ozziecrush.com.au
**Market:** Australia only (18+)
**Mechanic:** Swipe-card discovery (Tinder-style), original brand/UX/matching logic
**Entity:** TBD — confirm ABN/company structure before launch (Australian company or existing entity trading as OzzieCrush)

---

## 0. Stack Decisions

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Next.js 14, App Router | Clean build, no reuse from other projects |
| Hosting | Vercel (Sydney edge) | Confirm edge region pinning |
| DB / Backend | Supabase, region **ap-southeast-2 (Sydney)** | Data residency in-country |
| Auth | Supabase Auth + phone OTP | Twilio or Supabase native SMS provider |
| Payments | **Stripe only** | AU cards, Apple Pay, Google Pay. No Razorpay/UPI — not relevant here |
| ID Verification | HyperVerge or Au10tix/Onfido | AU document set: driver's licence, passport, proof-of-age card |
| Realtime/Chat | Supabase Realtime (or Stream Chat if scale demands it later) | Start with Supabase Realtime |
| Push | Web Push / FCM via Supabase Edge Functions | |
| WAF/Edge security | Cloudflare in front of Vercel | Rate limiting, bot mitigation on swipe/match endpoints |

**Architecture principle (carried over as a general best practice, not project-specific):** all client requests route through the Next.js `/api/*` layer behind Cloudflare — never direct client-to-Supabase calls for anything beyond public read-only reference data. Enforce with RLS as the backstop, not the primary gate.

---

## 1. Compliance Framework (Australia-specific)

This replaces DPDP-style requirements entirely. Key AU regimes:

### Privacy Act 1988 + Australian Privacy Principles (APPs)
- **APP 1** — have a publicly available privacy policy (plain language, on ozziecrush.com.au)
- **APP 3** — collect only what's necessary for the service (no over-collection of sensitive data like sexual orientation/health unless clearly optional and purpose-stated)
- **APP 5** — collection notice at signup: what's collected, why, who it's shared with (payment processor, ID verification vendor, hosting)
- **APP 6** — no secondary use of data beyond stated purpose without consent (e.g. no selling profile data to advertisers without explicit opt-in)
- **APP 11** — reasonable security safeguards (encryption at rest/in transit, RLS, access logging)
- **APP 12/13** — users can request access to and correction of their data (build a self-service export/edit path, not just email-a-human)

### Notifiable Data Breaches (NDB) scheme
- Any breach likely to cause serious harm → notify OAIC and affected individuals "as soon as practicable" (no fixed 72-hour clock like DPDP, but operationally treat it the same — build the same incident response runbook)

### Online Safety Act 2021
- Must have a functioning **report/block** mechanism from day one — not a v2 feature
- Content moderation policy covering image-based abuse, harassment, non-consensual content
- eSafety Commissioner can issue removal notices — need an internal process to respond quickly
- Basic Online Safety Expectations apply if platform scale grows — keep a moderation log

### Age & Verification
- 18+ hard gate at signup (DOB entry + logic check, same pattern as prior age-gate work)
- ID verification: **optional but incentivized** tier (verified badge) rather than mandatory — matches market norm (Tinder/Bumble don't mandate) while giving you a trust differentiator if you choose to push it harder

### Anti-scam / Online Dating Safety
- ACCC/Scamwatch guidance on romance scams — include in-app safety tips, a way to flag suspicious financial requests, and pattern-detection hooks (e.g. flag accounts that push off-platform contact + money requests quickly)

---

## 2. Database Schema (PostgreSQL / Supabase)

```sql
-- ============================
-- PROFILES
-- ============================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  dob date not null,
  gender text not null,
  seeking text[] not null default '{}',
  bio text,
  location_suburb text,
  location_state text,
  latitude double precision,
  longitude double precision,
  photos text[] default '{}',
  verified boolean default false,
  is_active boolean default true,
  last_active_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================
-- VERIFICATIONS
-- ============================
create table verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  provider text not null, -- 'hyperverge' | 'onfido' | 'au10tix'
  status text not null default 'pending', -- pending | approved | rejected
  document_type text, -- 'drivers_licence' | 'passport' | 'proof_of_age'
  provider_reference text,
  created_at timestamptz default now(),
  reviewed_at timestamptz
);

-- ============================
-- SWIPES
-- ============================
create table swipes (
  id uuid primary key default gen_random_uuid(),
  swiper_id uuid references profiles(id) on delete cascade,
  swiped_id uuid references profiles(id) on delete cascade,
  direction text not null, -- 'like' | 'pass' | 'superlike'
  created_at timestamptz default now(),
  unique (swiper_id, swiped_id)
);

-- ============================
-- MATCHES
-- ============================
create table matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid references profiles(id) on delete cascade,
  user_b uuid references profiles(id) on delete cascade,
  matched_at timestamptz default now(),
  is_active boolean default true,
  unique (user_a, user_b)
);

-- ============================
-- MESSAGES
-- ============================
create table messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references matches(id) on delete cascade,
  sender_id uuid references profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now(),
  read_at timestamptz
);

-- ============================
-- REPORTS (Online Safety Act requirement)
-- ============================
create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references profiles(id) on delete cascade,
  reported_id uuid references profiles(id) on delete cascade,
  reason text not null, -- 'harassment' | 'fake_profile' | 'inappropriate_content' | 'scam' | 'other'
  details text,
  status text default 'open', -- open | reviewing | actioned | dismissed
  created_at timestamptz default now(),
  resolved_at timestamptz
);

-- ============================
-- BLOCKS
-- ============================
create table blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid references profiles(id) on delete cascade,
  blocked_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (blocker_id, blocked_id)
);

-- ============================
-- SUBSCRIPTIONS
-- ============================
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  tier text not null, -- 'free' | 'plus' | 'gold' -- name later, structure now
  stripe_subscription_id text,
  status text not null default 'active', -- active | cancelled | past_due
  current_period_end timestamptz,
  created_at timestamptz default now()
);

-- ============================
-- PAYMENTS AUDIT
-- ============================
create table payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  stripe_payment_intent_id text,
  amount_cents integer not null,
  currency text default 'aud',
  status text not null,
  created_at timestamptz default now()
);

-- ============================
-- PRIVACY / CONSENT LOG (APP 5 collection notice acknowledgement)
-- ============================
create table consent_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  consent_type text not null, -- 'privacy_policy' | 'terms' | 'marketing_opt_in'
  version text not null,
  accepted_at timestamptz default now()
);
```

---

## 3. Row Level Security (apply to every table)

```sql
alter table profiles enable row level security;
alter table verifications enable row level security;
alter table swipes enable row level security;
alter table matches enable row level security;
alter table messages enable row level security;
alter table reports enable row level security;
alter table blocks enable row level security;
alter table subscriptions enable row level security;
alter table payments enable row level security;
alter table consent_events enable row level security;

-- Profiles: users see their own full record; others see a filtered public view via API layer, not direct table access
create policy "own profile rw" on profiles
  for all using (auth.uid() = id);

-- Swipes: users can only insert their own swipes, read their own
create policy "own swipes" on swipes
  for all using (auth.uid() = swiper_id);

-- Matches: visible to either participant
create policy "match participants" on matches
  for select using (auth.uid() = user_a or auth.uid() = user_b);

-- Messages: only participants of the match
create policy "message participants" on messages
  for all using (
    auth.uid() in (
      select user_a from matches where id = match_id
      union
      select user_b from matches where id = match_id
    )
  );

-- Reports: reporter can insert/view own reports; no update/delete by users
create policy "own reports" on reports
  for select using (auth.uid() = reporter_id);
create policy "insert reports" on reports
  for insert with check (auth.uid() = reporter_id);

-- Blocks: own blocks only
create policy "own blocks" on blocks
  for all using (auth.uid() = blocker_id);

-- Subscriptions/payments: own records only, read-only from client (writes via service role from Stripe webhook)
create policy "own subscription read" on subscriptions
  for select using (auth.uid() = user_id);
create policy "own payments read" on payments
  for select using (auth.uid() = user_id);

-- Consent events: own records only
create policy "own consent read" on consent_events
  for select using (auth.uid() = user_id);
create policy "own consent insert" on consent_events
  for insert with check (auth.uid() = user_id);
```

**Note:** discovery feed (finding candidates to swipe on) must NOT be a direct table read against `profiles` — build a Postgres function (`get_discovery_feed(user_id)`) called via API route, service-role, applying distance/age/preference filters and excluding blocked/reported/already-swiped users server-side.

---

## 4. API Route Tree

```
/api/auth/
  signup
  verify-otp
  age-gate-check

/api/profile/
  create
  update
  upload-photo
  delete

/api/verification/
  submit
  status
  webhook (provider callback)

/api/discovery/
  feed          -- calls get_discovery_feed() Postgres function
  swipe         -- POST direction, checks for mutual match, creates match row

/api/matches/
  list
  [id]/messages (GET, POST)
  [id]/unmatch

/api/reports/
  create
  list (admin only)

/api/blocks/
  create
  delete

/api/billing/
  create-checkout-session   -- Stripe Checkout
  webhook                   -- Stripe events -> subscriptions/payments tables
  portal-session            -- Stripe customer portal (cancel/manage)

/api/privacy/
  export-data      -- APP 12 self-service export
  delete-account   -- right to erasure equivalent
  consent-log

/api/admin/
  moderation-queue
  user-action (suspend/ban)
```

---

## 5. Build Sequence (10 steps)

1. **Repo + infra setup** — Next.js 14 project, Supabase project (Sydney region), Vercel deploy, Cloudflare in front, domain `ozziecrush.com.au` DNS + SSL
2. **Auth + age gate** — phone OTP signup, DOB capture, 18+ hard block, consent log on signup (privacy policy + terms acceptance)
3. **Profile creation** — photo upload (Supabase Storage), bio, location capture, preference fields
4. **DB schema + RLS** — apply schema and policies above, write and test the `get_discovery_feed()` function
5. **Discovery + swipe UI** — card stack component (Framer Motion or `react-tinder-card`), swipe gesture → `/api/discovery/swipe`
6. **Matching engine** — mutual-like detection, match row creation, match notification
7. **Chat** — Supabase Realtime channel per match, message history, read receipts
8. **Safety layer** — report/block flows wired into UI (profile menu, chat menu), admin moderation queue
9. **Billing** — Stripe Checkout for subscription tiers, webhook handling, customer portal for self-serve cancellation
10. **Pre-launch hardening** — RLS audit, rate limiting on swipe/report endpoints, privacy policy + terms published, NDB incident response runbook drafted, App Store/Play Store listing + age rating

---

## 6. Differentiation Note (carried from planning discussion)

Swipe-card is the most commoditized mechanic in the AU market (Tinder owns it outright). Before heavy build investment, lock in **one clear reason a user picks OzzieCrush over Tinder** — e.g. verified-only discovery lane, zero-bot guarantee, regional/rural focus, or a specific community angle. This should shape onboarding copy and the first marketing push, not just backend features.

---

## 7. Pre-Production Checklist

- [ ] Privacy policy published (APP 1) at ozziecrush.com.au/privacy
- [ ] Terms of Service published
- [ ] Collection notice shown at signup (APP 5)
- [ ] Age gate tested against underage bypass attempts
- [ ] RLS enabled + tested on every table (no service-role leakage to client)
- [ ] Report/block flow live before public launch (Online Safety Act)
- [ ] Stripe webhook signature verification implemented
- [ ] NDB breach response runbook drafted and assigned owner
- [ ] Data export + account deletion self-service paths tested
- [ ] Domain SSL + Cloudflare WAF rules active
- [ ] Moderation queue has at least one human reviewer assigned pre-launch
