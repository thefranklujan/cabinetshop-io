# CabinetShop.io Stabilization Receipt — 2026-07-13

Factual record of the stabilization pass (Elon / Claude Code). Companion to
`docs/CODEX_PACKET_2026_07_13.md`, which reconciles this receipt with the Codex
audit of the same date.

## Repo state

- Started from: `7a6bbdb` (lean plan phases 2 to 5, pushed earlier today, preserved intact)
- Ended at: `4f951ad` on `main`, pushed to `thefranklujan/cabinetshop-io`
- Concurrent changes found and preserved: `src/app/platform/campaigns/page.tsx` was
  deleted on disk by a concurrent session before this pass. That deletion aligned with
  the Phase 4 instruction, so the removal was COMPLETED here (all campaign subroutes,
  2 campaign API routes, nav entry, dashboard references) rather than reverted.
  `/api/track` and `/api/unsubscribe` were deliberately kept so tracking pixels and
  unsubscribe links in already-sent campaign emails keep resolving.

## What changed (all in `4f951ad`)

**Lead capture (was: false success on every failed write)**
- `/api/early-access` rewritten: calls `submit_early_access()` (SECURITY DEFINER,
  validates, rate limits 5/email/hour, upserts `shop_database`, logs
  `platform_activity`), returns success ONLY on DB confirmation; failures return
  400/502 with a human message and `hello@cabinetshop.io` fallback.
- New `/api/contact` + functional contact form (was a dead button) writing to new
  `contact_messages` table via `submit_contact()`; triage UI at `/platform/inbox`
  (new page + sidebar entry + dashboard KPI).
- No service role key introduced anywhere; RLS on the tables stays locked.

**Honest copy**
- Pricing: fictional Starter/Shop/Scale plans, 14 day trial, SLA, API access,
  success manager, CSV import, and per-plan limits replaced with a single truthful
  Pilot card ($0, everything included) + clearly labeled planned pricing. FAQ rewritten.
- About/Contact/Footer: Austin replaced with Houston (Crafted Kitchens is Houston);
  "runs our shop every day" replaced with the true story (built out of the Houston
  shop, productized, in pilot); "We pick up the phone" replaced (no phone number exists).
- Landing/Features: removed unbuilt claims (drawings/photos, per-job inventory
  reservations, invoice generation, margin per job); "cryptographically enforced"
  corrected to database enforced; added the real gates/tasks/timeline features;
  "Free forever" replaced with pilot framing. Module count aligned at 15.
- Early access page: no more "login credentials within 48 hours" promise; Houston
  placeholders.

**Trust surfaces (all new)**
- `/privacy` (what is collected, where it lives, no selling, deletion path)
- `/terms` (pilot status, data ownership, as is warranty, ending service)
- `/support` (email support, bug reporting path, account deletion instructions)
- Footer links to all three.

**Infrastructure truth**
- Canonical host: `www.cabinetshop.io` 308-redirects to apex in middleware.
- Env validation: build/start now throw when `NEXT_PUBLIC_SUPABASE_URL` or
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` are missing.
- Vercel: `cabinetshop.io` + `www` confirmed ALREADY attached to project `app`
  (team craftedkitchens). Only DNS is missing (see Blocked).

**Schema hardening (authored, in `supabase/migrations/`)**
- `20260713170000_public_lead_capture.sql` (contact_messages + the two definer functions)
- `20260713171000_same_workspace_enforcement.sql` (generic BEFORE trigger on every
  child reference: projects.client_id, all project_id columns on 9 legacy tables,
  tasks/messages/template_items/projects.template_id)
- Plus the three July 13 lean migrations from `7a6bbdb` (tasks+member emails RPC,
  messages, job templates).

**Dependencies**
- next 14.2.5 → 14.2.35 (max of the 14.2 line; fixes the critical cache poisoning +
  middleware authorization bypass + SSRF advisories), eslint-config-next 14.2.35,
  @supabase/supabase-js 2.110.x, @supabase/ssr 0.12.x.
- Removed entirely (zero imports after campaigns removal): dompurify,
  isomorphic-dompurify, @types/dompurify, resend, clsx, tailwind-merge.
- `npm audit --omit=dev`: was 8 (1 critical, 2 high) → now 2 (1 high next, 1 moderate
  postcss bundled in next). Both remaining are fixed only in Next 15/16; none of their
  vectors apply (no rewrites, no i18n, no CSP nonces, no WebSocket upgrades, no
  remotePatterns). Next 15 upgrade is a packet item, not a pilot blocker.

## What was verified (exact commands/URLs)

- `npm run check` (lint + tsc + build): EXIT=0 on final tree (after clearing a
  corrupted node_modules and stale `.next/types` — both pre-existing).
- `npm test` (new vitest suite): 15/15 passing — `tests/lead-capture.test.ts`
  (success only on DB confirmation, 502 on failure, rate limit mapping, 400
  validation, malformed JSON) and `tests/middleware.test.ts` (www→apex 308 with
  path/query preserved, apex untouched, preview hosts untouched, /app + /platform
  redirect signed-out users to /sign-in, marketing/early-access public, signed-in
  user passes).
- Local browser verification (dev server, port 3010): all 9 public routes 200
  (`/ /features /pricing /about /contact /privacy /terms /support /early-access`);
  contact form submits and surfaces the honest 502 error with email fallback
  (verified in UI); `grep -i austin` across all pages: zero hits; mobile 375px:
  no horizontal overflow on /, /pricing, /contact, /support; zero console errors.
- `curl -X POST localhost:3010/api/contact` and `/api/early-access` against the
  LIVE DB (functions not yet applied): both correctly return 502 error JSON, NOT
  success — the false-success path is provably gone even pre-migration.
- DNS/domain: `dig` shows apex+www → GoDaddy parking A records (3.33.130.190 /
  15.197.148.33), NS ns45/ns46.domaincontrol.com, NO MX and NO TXT records (nothing
  to preserve). `npx vercel domains inspect cabinetshop.io`: attached to project
  `app`, Vercel intends ns1/ns2.vercel-dns.com.
- Live DB probes (anon REST): `tasks`, `messages`, `job_templates`,
  `template_items`, `workspace_member_emails()` all ABSENT (PGRST205/202) —
  **the July 13 migrations were NOT already applied; they still are not.**

## What remains BLOCKED (needs Frank)

1. **Supabase access.** The Supabase MCP connector fails (net::ERR_FAILED) and no
   local credentials exist. Reconnect it in claude.ai connector settings (or connect
   the Chrome extension with a supabase.com session). Until then the 5 pending
   migrations cannot be applied.
2. **Deploy is intentionally held.** `main` (4f951ad) requires the new tables/functions;
   deploying before migrations would break new pages. Order on unblock: apply 5
   migrations → run `verify_stabilization.sql` (rolled-back tx: RLS, same-workspace
   triggers, submit functions, rate limits, append-only) → `npx vercel deploy --prod
   --yes` + `npx vercel promote` from `App/` → live production verification (apex,
   www 308, SSL, early-access + contact round-trip, marketing pages).
3. **GoDaddy DNS.** Change nameservers for cabinetshop.io to `ns1.vercel-dns.com` /
   `ns2.vercel-dns.com` (cleanest; no mail/TXT records exist to preserve), or set
   A `@` → 76.76.21.21 and CNAME `www` → cname.vercel-dns.com. No GoDaddy access
   from this machine.

## Test data caveat

None created. Production data untouched (probe inserts were denied by policy and
not retried; verification writes happen only inside the rolled-back SQL script).
