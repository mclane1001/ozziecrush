# OzzieCrush Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap the OzzieCrush dating app — Next.js 14 scaffold, Australian-branded landing page, and Supabase migration file — so the project is ready for feature development.

**Architecture:** Next.js 14 App Router with all client traffic routed through `/api/*` (never direct Supabase calls from the browser). Supabase handles auth (phone OTP), Postgres (Sydney region `ap-southeast-2`), and Storage. A single `supabase/migrations/` folder holds the canonical schema so it can be applied to any environment.

**Tech Stack:** Next.js 14, TypeScript 5, Tailwind CSS 3, Supabase JS v2, Stripe JS, Node 20+

## Global Constraints

- Node version: **≥20.0.0** (`engines` field in package.json)
- Next.js: **14.x** (App Router, not Pages Router)
- TypeScript: **strict mode** (`"strict": true` in tsconfig)
- Tailwind: **3.x**
- Supabase JS: **^2.0.0**
- Supabase region: **ap-southeast-2 (Sydney)** — data residency requirement
- No direct Supabase calls from browser components — all writes/reads through `/api/*`
- AU compliance: Privacy Act 1988 APPs, Online Safety Act 2021, NDB scheme
- Currency: **AUD** only
- Age gate: **18+** hard block
- Brand palette: `--oz-coral: #E8472A`, `--oz-cream: #FFF8F0`, `--oz-sand: #F5E6D3`, `--oz-dark: #1A0F00`, `--oz-muted: #7A5C4A`
- Domain: `ozziecrush.com.au`

---

## File Structure

```
C:\Users\paulm\Ozzicresh\
├── app/
│   ├── layout.tsx                  # Root layout — fonts, metadata
│   ├── page.tsx                    # Landing page (Phase 2)
│   ├── globals.css                 # Tailwind base + CSS vars
│   └── api/
│       ├── auth/
│       │   ├── signup/route.ts
│       │   ├── verify-otp/route.ts
│       │   └── age-gate-check/route.ts
│       ├── profile/
│       │   ├── create/route.ts
│       │   ├── update/route.ts
│       │   ├── upload-photo/route.ts
│       │   └── delete/route.ts
│       ├── discovery/
│       │   ├── feed/route.ts
│       │   └── swipe/route.ts
│       ├── matches/
│       │   ├── list/route.ts
│       │   └── [id]/
│       │       ├── messages/route.ts
│       │       └── unmatch/route.ts
│       ├── reports/
│       │   └── create/route.ts
│       ├── blocks/
│       │   ├── create/route.ts
│       │   └── delete/route.ts
│       ├── billing/
│       │   ├── create-checkout-session/route.ts
│       │   ├── webhook/route.ts
│       │   └── portal-session/route.ts
│       ├── privacy/
│       │   ├── export-data/route.ts
│       │   ├── delete-account/route.ts
│       │   └── consent-log/route.ts
│       └── admin/
│           ├── moderation-queue/route.ts
│           └── user-action/route.ts
├── lib/
│   ├── supabase/
│   │   ├── server.ts               # Supabase client (service role, server-only)
│   │   └── browser.ts              # Supabase client (anon key, browser-safe)
│   └── types/
│       └── database.ts             # TypeScript types mirroring DB schema
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Full schema + RLS + get_discovery_feed()
├── public/
│   └── og-image.png                # Placeholder OG image
├── .env.example
├── .env.local                      # Gitignored — real keys
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── CLAUDE.md                       # Copied from spec
```

---

## Task 1: Repo Init + Next.js 14 Scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.js`
- Create: `tailwind.config.ts`
- Create: `app/globals.css`
- Create: `app/layout.tsx`
- Create: `.env.example`
- Create: `.gitignore`
- Create: `CLAUDE.md`

**Interfaces:**
- Produces: a running `npm run dev` on port 3000 with a blank page

- [ ] **Step 1: Initialise git and create package.json**

```bash
cd C:\Users\paulm\Ozzicresh
git init
```

Create `package.json`:
```json
{
  "name": "ozziecrush",
  "version": "0.1.0",
  "private": true,
  "engines": { "node": ">=20.0.0" },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@supabase/supabase-js": "^2.45.0",
    "stripe": "^16.2.0",
    "@stripe/stripe-js": "^4.1.0"
  },
  "devDependencies": {
    "typescript": "^5.5.3",
    "@types/node": "^20.14.11",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "tailwindcss": "^3.4.6",
    "postcss": "^8.4.40",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-config-next": "14.2.5"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
npm install
```

Expected: `node_modules/` created, no peer-dep errors.

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create next.config.js**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
}
module.exports = nextConfig
```

- [ ] **Step 5: Create tailwind.config.ts**

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        coral:  '#E8472A',
        cream:  '#FFF8F0',
        sand:   '#F5E6D3',
        ozDark: '#1A0F00',
        muted:  '#7A5C4A',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 6: Create postcss.config.js**

```js
module.exports = {
  plugins: { tailwindcss: {}, autoprefixer: {} },
}
```

- [ ] **Step 7: Create app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --oz-coral: #E8472A;
  --oz-cream: #FFF8F0;
  --oz-sand:  #F5E6D3;
  --oz-dark:  #1A0F00;
  --oz-muted: #7A5C4A;
}

body {
  background-color: var(--oz-cream);
  color: var(--oz-dark);
  font-family: 'DM Sans', sans-serif;
}
```

- [ ] **Step 8: Create app/layout.tsx**

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'OzzieCrush — Find Your Someone in Australia',
  description: 'The dating app made for Aussies. Swipe, match, meet.',
  metadataBase: new URL('https://ozziecrush.com.au'),
  openGraph: {
    title: 'OzzieCrush',
    description: 'The dating app made for Aussies.',
    url: 'https://ozziecrush.com.au',
    siteName: 'OzzieCrush',
    locale: 'en_AU',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 9: Create a placeholder app/page.tsx**

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream">
      <h1 className="font-display text-4xl font-black text-coral">OzzieCrush 🦘</h1>
    </main>
  )
}
```

- [ ] **Step 10: Create .env.example**

```
# Supabase — project must be in ap-southeast-2 (Sydney)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=https://ozziecrush.com.au
```

- [ ] **Step 11: Create .gitignore**

```
# deps
/node_modules

# Next.js
/.next/
/out/

# env
.env
.env.local
.env.*.local

# misc
.DS_Store
*.pem
```

- [ ] **Step 12: Copy CLAUDE.md into repo**

Copy `C:\Users\paulm\OneDrive\Desktop\New folder (2)\CLAUDE.md` to `C:\Users\paulm\Ozzicresh\CLAUDE.md`.

- [ ] **Step 13: Verify dev server starts**

```bash
npm run dev
```

Expected output includes:
```
▲ Next.js 14.x.x
- Local: http://localhost:3000
```

Open `http://localhost:3000` — should show "OzzieCrush 🦘" in coral.

- [ ] **Step 14: Type-check passes**

```bash
npm run type-check
```

Expected: no errors.

- [ ] **Step 15: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 14 + Tailwind + TypeScript"
```

---

## Task 2: Supabase Client + TypeScript Types

**Files:**
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/browser.ts`
- Create: `lib/types/database.ts`
- Create: `.env.local` (from `.env.example`, with placeholder values for local dev)

**Interfaces:**
- Produces:
  - `createServerClient()` → `SupabaseClient` (server components + API routes)
  - `createBrowserClient()` → `SupabaseClient` (client components only)
  - `Database` TypeScript type (used in both clients)

- [ ] **Step 1: Create lib/types/database.ts**

```ts
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          dob: string
          gender: string
          seeking: string[]
          bio: string | null
          location_suburb: string | null
          location_state: string | null
          latitude: number | null
          longitude: number | null
          photos: string[]
          verified: boolean
          is_active: boolean
          last_active_at: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at' | 'last_active_at' | 'verified' | 'is_active' | 'photos'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      swipes: {
        Row: { id: string; swiper_id: string; swiped_id: string; direction: 'like' | 'pass' | 'superlike'; created_at: string }
        Insert: Omit<Database['public']['Tables']['swipes']['Row'], 'id' | 'created_at'>
        Update: never
      }
      matches: {
        Row: { id: string; user_a: string; user_b: string; matched_at: string; is_active: boolean }
        Insert: Omit<Database['public']['Tables']['matches']['Row'], 'id' | 'matched_at'>
        Update: Pick<Database['public']['Tables']['matches']['Row'], 'is_active'>
      }
      messages: {
        Row: { id: string; match_id: string; sender_id: string; content: string; created_at: string; read_at: string | null }
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at' | 'read_at'>
        Update: Pick<Database['public']['Tables']['messages']['Row'], 'read_at'>
      }
      reports: {
        Row: { id: string; reporter_id: string; reported_id: string; reason: string; details: string | null; status: string; created_at: string; resolved_at: string | null }
        Insert: Omit<Database['public']['Tables']['reports']['Row'], 'id' | 'status' | 'created_at' | 'resolved_at'>
        Update: Pick<Database['public']['Tables']['reports']['Row'], 'status' | 'resolved_at'>
      }
      blocks: {
        Row: { id: string; blocker_id: string; blocked_id: string; created_at: string }
        Insert: Omit<Database['public']['Tables']['blocks']['Row'], 'id' | 'created_at'>
        Update: never
      }
      subscriptions: {
        Row: { id: string; user_id: string; tier: string; stripe_subscription_id: string | null; status: string; current_period_end: string | null; created_at: string }
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at'>
        Update: Partial<Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'user_id' | 'created_at'>>
      }
    }
    Functions: {
      get_discovery_feed: {
        Args: { p_user_id: string; p_limit?: number }
        Returns: Array<{ id: string; display_name: string; dob: string; bio: string | null; photos: string[]; verified: boolean; location_suburb: string | null; location_state: string | null }>
      }
    }
  }
}
```

- [ ] **Step 2: Create lib/supabase/server.ts**

```ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

// Use service role — server-only, never expose to browser
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase server env vars')
  return createClient<Database>(url, key, {
    auth: { persistSession: false },
  })
}
```

- [ ] **Step 3: Create lib/supabase/browser.ts**

```ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

// Use anon key — safe for browser, limited by RLS
export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Missing Supabase browser env vars')
  return createClient<Database>(url, key)
}
```

- [ ] **Step 4: Create .env.local with placeholder values**

```
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-anon
SUPABASE_SERVICE_ROLE_KEY=placeholder-service
STRIPE_SECRET_KEY=sk_test_placeholder
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 5: Type-check passes**

```bash
npm run type-check
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add lib/ .env.example
git commit -m "feat: Supabase client helpers + TypeScript DB types"
```

---

## Task 3: API Route Skeletons

**Files:**
- Create: all `app/api/*/route.ts` files listed in the File Structure above (19 route files)

**Interfaces:**
- Consumes: `createServerClient()` from `@/lib/supabase/server`
- Produces: every route returns `{ error: 'Not implemented' }` with HTTP 501 until filled in — this lets the app build and type-check cleanly

- [ ] **Step 1: Create a shared response helper — lib/api.ts**

```ts
import { NextResponse } from 'next/server'

export const notImplemented = () =>
  NextResponse.json({ error: 'Not implemented' }, { status: 501 })

export const ok = (data: unknown) =>
  NextResponse.json(data, { status: 200 })

export const badRequest = (message: string) =>
  NextResponse.json({ error: message }, { status: 400 })

export const unauthorized = () =>
  NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

export const serverError = (message = 'Internal server error') =>
  NextResponse.json({ error: message }, { status: 500 })
```

- [ ] **Step 2: Create auth routes**

`app/api/auth/signup/route.ts`:
```ts
import { notImplemented } from '@/lib/api'
export async function POST() { return notImplemented() }
```

`app/api/auth/verify-otp/route.ts`:
```ts
import { notImplemented } from '@/lib/api'
export async function POST() { return notImplemented() }
```

`app/api/auth/age-gate-check/route.ts`:
```ts
import { notImplemented } from '@/lib/api'
export async function POST() { return notImplemented() }
```

- [ ] **Step 3: Create profile routes**

`app/api/profile/create/route.ts`:
```ts
import { notImplemented } from '@/lib/api'
export async function POST() { return notImplemented() }
```

`app/api/profile/update/route.ts`:
```ts
import { notImplemented } from '@/lib/api'
export async function PATCH() { return notImplemented() }
```

`app/api/profile/upload-photo/route.ts`:
```ts
import { notImplemented } from '@/lib/api'
export async function POST() { return notImplemented() }
```

`app/api/profile/delete/route.ts`:
```ts
import { notImplemented } from '@/lib/api'
export async function DELETE() { return notImplemented() }
```

- [ ] **Step 4: Create discovery routes**

`app/api/discovery/feed/route.ts`:
```ts
import { notImplemented } from '@/lib/api'
export async function GET() { return notImplemented() }
```

`app/api/discovery/swipe/route.ts`:
```ts
import { notImplemented } from '@/lib/api'
export async function POST() { return notImplemented() }
```

- [ ] **Step 5: Create matches routes**

`app/api/matches/list/route.ts`:
```ts
import { notImplemented } from '@/lib/api'
export async function GET() { return notImplemented() }
```

`app/api/matches/[id]/messages/route.ts`:
```ts
import { notImplemented } from '@/lib/api'
export async function GET() { return notImplemented() }
export async function POST() { return notImplemented() }
```

`app/api/matches/[id]/unmatch/route.ts`:
```ts
import { notImplemented } from '@/lib/api'
export async function POST() { return notImplemented() }
```

- [ ] **Step 6: Create reports, blocks, billing, privacy, admin routes**

`app/api/reports/create/route.ts`:
```ts
import { notImplemented } from '@/lib/api'
export async function POST() { return notImplemented() }
```

`app/api/blocks/create/route.ts`:
```ts
import { notImplemented } from '@/lib/api'
export async function POST() { return notImplemented() }
```

`app/api/blocks/delete/route.ts`:
```ts
import { notImplemented } from '@/lib/api'
export async function DELETE() { return notImplemented() }
```

`app/api/billing/create-checkout-session/route.ts`:
```ts
import { notImplemented } from '@/lib/api'
export async function POST() { return notImplemented() }
```

`app/api/billing/webhook/route.ts`:
```ts
import { notImplemented } from '@/lib/api'
export async function POST() { return notImplemented() }
```

`app/api/billing/portal-session/route.ts`:
```ts
import { notImplemented } from '@/lib/api'
export async function POST() { return notImplemented() }
```

`app/api/privacy/export-data/route.ts`:
```ts
import { notImplemented } from '@/lib/api'
export async function GET() { return notImplemented() }
```

`app/api/privacy/delete-account/route.ts`:
```ts
import { notImplemented } from '@/lib/api'
export async function DELETE() { return notImplemented() }
```

`app/api/privacy/consent-log/route.ts`:
```ts
import { notImplemented } from '@/lib/api'
export async function GET() { return notImplemented() }
export async function POST() { return notImplemented() }
```

`app/api/admin/moderation-queue/route.ts`:
```ts
import { notImplemented } from '@/lib/api'
export async function GET() { return notImplemented() }
```

`app/api/admin/user-action/route.ts`:
```ts
import { notImplemented } from '@/lib/api'
export async function POST() { return notImplemented() }
```

- [ ] **Step 7: Build succeeds**

```bash
npm run build
```

Expected: Build completes with no TypeScript errors. Every route compiles.

- [ ] **Step 8: Spot-check a skeleton route**

```bash
npm run dev
# In another terminal:
curl http://localhost:3000/api/auth/signup -X POST
```

Expected response: `{"error":"Not implemented"}` with status 501.

- [ ] **Step 9: Commit**

```bash
git add app/api/ lib/api.ts
git commit -m "feat: API route skeletons — all 19 routes return 501"
```

---

## Task 4: Landing Page

**Files:**
- Modify: `app/page.tsx` (replace placeholder)
- Create: `app/components/SwipeDemo.tsx`
- Create: `app/components/SignupForm.tsx`

**Interfaces:**
- Consumes: nothing from prior tasks (pure UI, no API calls yet)
- Produces: a complete, static marketing page at `/`

**Design spec:**
- Palette: coral `#E8472A`, cream `#FFF8F0`, sand `#F5E6D3`, dark `#1A0F00`
- Fonts: Playfair Display (headings), DM Sans (body)
- Sections in order: Nav → Hero (with SwipeDemo) → Features → How It Works → Early Access signup → Footer
- Fully responsive (mobile-first)
- Privacy Act / Online Safety Act badge in footer

- [ ] **Step 1: Create app/components/SwipeDemo.tsx**

```tsx
'use client'
import { useState } from 'react'

const DEMO_PROFILES = [
  { name: 'Mia, 26', location: 'Sydney NSW', emoji: '👩‍🦰', bio: 'Beach runs & flat whites ☕' },
  { name: 'Jake, 29', location: 'Melbourne VIC', emoji: '🧔', bio: 'Footy tragic & home cook 🏉' },
  { name: 'Priya, 24', location: 'Brisbane QLD', emoji: '👩‍🦱', bio: 'Hiker, reader, terrible puns 📚' },
]

export default function SwipeDemo() {
  const [index, setIndex] = useState(0)
  const [anim, setAnim] = useState<'like' | 'pass' | null>(null)
  const profile = DEMO_PROFILES[index % DEMO_PROFILES.length]

  function swipe(dir: 'like' | 'pass') {
    setAnim(dir)
    setTimeout(() => {
      setIndex(i => i + 1)
      setAnim(null)
    }, 350)
  }

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      <div
        className="relative w-64 h-80 rounded-3xl shadow-2xl flex flex-col justify-end overflow-hidden transition-transform duration-300"
        style={{
          background: 'linear-gradient(160deg, #F5E6D3 0%, #FFF8F0 100%)',
          transform: anim === 'like' ? 'rotate(8deg) translateX(60px)' : anim === 'pass' ? 'rotate(-8deg) translateX(-60px)' : 'none',
          opacity: anim ? 0 : 1,
          transition: 'transform 0.35s ease, opacity 0.35s ease',
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center text-8xl">{profile.emoji}</div>
        <div className="relative z-10 p-4 bg-gradient-to-t from-[#1A0F00cc] to-transparent rounded-b-3xl">
          <p className="text-white font-display font-bold text-lg leading-tight">{profile.name}</p>
          <p className="text-[#F5E6D3] text-sm">{profile.location}</p>
          <p className="text-[#F5E6D3] text-xs mt-1 opacity-80">{profile.bio}</p>
        </div>
      </div>
      <div className="flex gap-6">
        <button
          onClick={() => swipe('pass')}
          className="w-14 h-14 rounded-full bg-white shadow-lg text-2xl flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="Pass"
        >✕</button>
        <button
          onClick={() => swipe('like')}
          className="w-14 h-14 rounded-full bg-coral shadow-lg text-2xl flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="Like"
        >❤️</button>
      </div>
      <p className="text-muted text-xs">Tap ❤️ or ✕ to try it</p>
    </div>
  )
}
```

- [ ] **Step 2: Create app/components/SignupForm.tsx**

```tsx
'use client'
import { useState } from 'react'

export default function SignupForm() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address')
      return
    }
    // In prod this POSTs to /api/waitlist — for now just shows confirmation
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="text-center py-4">
        <p className="text-2xl mb-2">🦘</p>
        <p className="font-display font-bold text-xl text-coral">You're on the list!</p>
        <p className="text-muted text-sm mt-1">We'll email you when OzzieCrush launches.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
      <input
        type="email"
        value={email}
        onChange={e => { setEmail(e.target.value); setError('') }}
        placeholder="your@email.com"
        required
        className="flex-1 px-4 py-3 rounded-full border border-sand bg-white text-ozDark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-coral text-sm"
      />
      <button
        type="submit"
        className="px-6 py-3 rounded-full bg-coral text-white font-bold text-sm hover:bg-[#c93b21] transition-colors"
      >
        Get early access
      </button>
      {error && <p className="text-red-500 text-xs mt-1 sm:col-span-2">{error}</p>}
    </form>
  )
}
```

- [ ] **Step 3: Replace app/page.tsx with full landing page**

```tsx
import SwipeDemo from '@/app/components/SwipeDemo'
import SignupForm from '@/app/components/SignupForm'

export default function Home() {
  return (
    <div className="min-h-screen bg-cream text-ozDark">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <span className="font-display font-black text-2xl text-coral">OzzieCrush 🦘</span>
        <a
          href="#early-access"
          className="px-5 py-2 rounded-full bg-coral text-white text-sm font-semibold hover:bg-[#c93b21] transition-colors"
        >
          Get early access
        </a>
      </nav>

      {/* Hero */}
      <section className="flex flex-col lg:flex-row items-center gap-12 px-6 py-16 max-w-5xl mx-auto">
        <div className="flex-1 text-center lg:text-left">
          <p className="text-coral font-semibold text-sm uppercase tracking-widest mb-3">Made for Aussies 🇦🇺</p>
          <h1 className="font-display font-black text-5xl lg:text-6xl leading-tight mb-5">
            Find your<br />someone<br /><span className="text-coral">across Australia</span>
          </h1>
          <p className="text-muted text-lg mb-8 max-w-md mx-auto lg:mx-0">
            Real profiles, genuine connections. OzzieCrush is the dating app that puts safety and authenticity first — built for Australians, by Australians.
          </p>
          <div className="flex justify-center lg:justify-start">
            <a
              href="#early-access"
              className="px-8 py-4 rounded-full bg-coral text-white font-bold text-base hover:bg-[#c93b21] transition-colors shadow-lg"
            >
              Join the waitlist →
            </a>
          </div>
        </div>
        <div className="flex-shrink-0">
          <SwipeDemo />
        </div>
      </section>

      {/* Features */}
      <section className="bg-sand py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display font-black text-3xl text-center mb-12">Why OzzieCrush?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '✅', title: 'Verified profiles', body: 'Optional ID verification gives you a trust badge and filters out fakes.' },
              { icon: '🛡️', title: 'Safety first', body: 'Report & block in two taps. Our Safety team reviews every report within 24 hrs.' },
              { icon: '🇦🇺', title: 'Built for Australia', body: 'Privacy Act 1988 compliant. Your data stays in Sydney — never leaves Australia.' },
              { icon: '🔒', title: 'No bot guarantee', body: 'Phone OTP at signup + AI moderation keeps bots off the platform.' },
              { icon: '💬', title: 'Icebreaker prompts', body: 'Suggested openers make starting a conversation easy — no more blank stares.' },
              { icon: '💳', title: 'Fair pricing', body: 'Free to match. Premium unlocks unlimited likes and profile boosts.' },
            ].map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-lg mb-1">{f.title}</h3>
                <p className="text-muted text-sm">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="font-display font-black text-3xl text-center mb-12">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Create your profile', body: 'Sign up with your phone number, upload photos, write a short bio.' },
            { step: '2', title: 'Swipe & match', body: 'Like profiles you're interested in. When it's mutual — it's a match!' },
            { step: '3', title: 'Start chatting', body: 'Send a message, share a voice note, or use our icebreaker prompts to break the ice.' },
          ].map(s => (
            <div key={s.step} className="text-center">
              <div className="w-12 h-12 rounded-full bg-coral text-white font-black text-xl flex items-center justify-center mx-auto mb-4">{s.step}</div>
              <h3 className="font-bold text-lg mb-2">{s.title}</h3>
              <p className="text-muted text-sm">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Early Access */}
      <section id="early-access" className="bg-coral py-16 px-6">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-[#FFF8F0] font-semibold text-sm uppercase tracking-widest mb-3">Launching soon</p>
          <h2 className="font-display font-black text-4xl text-white mb-4">Be the first to know</h2>
          <p className="text-[#F5E6D3] mb-8">Drop your email and we'll let you know the moment OzzieCrush goes live.</p>
          <div className="flex justify-center">
            <SignupForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ozDark text-[#F5E6D3] py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <span className="font-display font-black text-xl text-coral">OzzieCrush 🦘</span>
            <div className="flex gap-4 text-sm">
              <a href="/privacy" className="hover:text-coral transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-coral transition-colors">Terms of Service</a>
              <a href="/safety" className="hover:text-coral transition-colors">Safety</a>
              <a href="mailto:support@ozziecrush.com.au" className="hover:text-coral transition-colors">Contact</a>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs bg-[#2a1f10] px-3 py-1 rounded-full">🇦🇺 Privacy Act 1988 compliant</span>
            <span className="text-xs bg-[#2a1f10] px-3 py-1 rounded-full">🛡️ Online Safety Act 2021</span>
            <span className="text-xs bg-[#2a1f10] px-3 py-1 rounded-full">🔒 Data stored in Sydney, AU</span>
            <span className="text-xs bg-[#2a1f10] px-3 py-1 rounded-full">18+ only</span>
          </div>
          <p className="text-xs text-[#7A5C4A]">© 2026 OzzieCrush. All rights reserved. ABN TBC. ozziecrush.com.au</p>
        </div>
      </footer>

    </div>
  )
}
```

- [ ] **Step 4: Verify page renders**

```bash
npm run dev
```

Open `http://localhost:3000`. Verify:
- Coral navbar with "OzzieCrush 🦘"
- Hero section with swipe card demo
- Tapping ❤️ or ✕ animates the card and cycles to next profile
- Features grid (6 cards)
- "How it works" 3-step section
- Early-access coral signup section with email form
- Dark footer with compliance badges

- [ ] **Step 5: Build succeeds**

```bash
npm run build && npm run type-check
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add app/
git commit -m "feat: OzzieCrush landing page — hero, swipe demo, features, signup"
```

---

## Task 5: Supabase Migration File

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

**Interfaces:**
- Consumes: nothing
- Produces: a single `.sql` file that can be pasted into Supabase SQL Editor or applied with `supabase db push` to create the full schema, RLS policies, and `get_discovery_feed()` function

- [ ] **Step 1: Create supabase/migrations/001_initial_schema.sql**

```sql
-- ============================================================
-- OzzieCrush — Initial Schema
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

-- Verifications — users can only view their own
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
```

- [ ] **Step 2: Verify the SQL file is syntactically valid**

Paste the entire file into the Supabase SQL Editor for your project (Dashboard → SQL Editor → New query). Click **Run**.

Expected: All statements execute without error. Check the Tables section in the left sidebar — you should see: `profiles`, `verifications`, `swipes`, `matches`, `messages`, `reports`, `blocks`, `subscriptions`, `payments`, `consent_events`.

- [ ] **Step 3: Verify RLS is on**

In Supabase Dashboard → Table Editor, click any table → select "RLS enabled" badge is visible.

Or run in SQL Editor:
```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;
```
Expected: `rowsecurity = true` for all 10 tables.

- [ ] **Step 4: Verify get_discovery_feed() exists**

```sql
select routine_name from information_schema.routines
where routine_schema = 'public' and routine_name = 'get_discovery_feed';
```
Expected: one row returned.

- [ ] **Step 5: Commit the migration file**

```bash
git add supabase/
git commit -m "feat: Supabase migration — full schema, RLS, get_discovery_feed()"
```

---
