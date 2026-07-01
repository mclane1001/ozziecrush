# Fix Report — Post-Review Fixes

**Date:** 2026-07-01
**Status:** DONE

## Fixes Applied

### Fix 1 — Missing TS types in `lib/types/database.ts`
Added `verifications`, `payments`, and `consent_events` table definitions inside `Database['public']['Tables']` after the `subscriptions` entry.

### Fix 2 — Missing `/api/verification/` routes
Created three skeleton route files matching the existing pattern:
- `app/api/verification/submit/route.ts` (POST)
- `app/api/verification/status/route.ts` (GET)
- `app/api/verification/webhook/route.ts` (POST)

### Fix 3 — SQL age check precision
In `supabase/migrations/001_initial_schema.sql`, replaced integer-division age check:
```sql
-- before
and (current_date - p.dob) / 365 >= 18
-- after
and date_part('year', age(p.dob)) >= 18
```
The new form uses Postgres `age()` which correctly handles leap years and partial years.

### Fix 4 — Missing `blocks_blocked_idx` index
Added `create index blocks_blocked_idx on public.blocks (blocked_id);` immediately after the existing `blocks_blocker_idx` in the migration.

## Verification

- `npm run type-check` ✅ zero errors
- `npm run build` ✅ 28 static/dynamic routes compiled, all three new verification routes present in build output
