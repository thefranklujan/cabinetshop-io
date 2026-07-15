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

---

## Deploy addendum — 2026-07-14

Executed per the unified handoff (baseline `d1d6c99`, verified no drift, tests re-run fresh: 15/15).

- **Migrations applied to live DB** (Supabase MCP recovered): `phase2_tasks_and_member_emails`,
  `phase3_job_messages`, `phase4_job_templates`, `public_lead_capture`,
  `same_workspace_enforcement`. Confirmed absent immediately before applying
  (live migration list ended at `20260611145908`).
- **Verification suite ran against live DB in an aborted transaction (nothing persisted):**
  owner CRUD on tasks, messages append-only (0 rows updatable), spoofed-author insert
  rejected, viewer read-only (0 rows on update), member-emails RPC returns own workspace
  and 0 rows for a foreign workspace, submit_early_access accepts valid + rejects invalid,
  contact rate limit trips on the 6th message in an hour, anon sees 0 rows in
  contact_messages/shop_database. Cross-workspace triggers proven with a REAL second-
  workspace project: task, message, gate, and template cross-references all rejected.
- **Deployed** `main` (`d1d6c99`) via `npx vercel deploy --prod --yes` →
  `app-f2nfba8ek-craftedkitchens.vercel.app`, confirmed current production (promote
  returned already-current). Build on Next 14.2.35, 37 pages.
- **Production verified** via https://app-phi-neon.vercel.app: all public routes 200,
  "Free in pilot" + "Houston, Texas" live, zero "Austin". **End-to-end form round-trips
  against production returned real success and real rows** (contact_messages,
  shop_database, platform_activity: 1 each), then the 3 verification rows were deleted
  (1/1/1 confirmed).
- **Supabase security advisors post-migration:** WARN-level only, no errors. Backlog:
  pin `search_path` on 8 legacy functions, revoke unneeded RPC EXECUTE on internal
  helper functions, enable leaked-password protection in Auth settings.
- **Still open:** (1) GoDaddy nameservers → ns1/ns2.vercel-dns.com (apex/www still
  parked; canonical redirect + SSL on the real domain verifiable only after this).
  (2) One human smoke: sign into production and glance at Tasks, Constraints, Team
  emails, Settings templates — password sign-in is a step Claude does not perform.

---

## Launch-gate addendum — 2026-07-14 (afternoon)

Baseline re-verified independently before any action: main == origin/main == `c4263ef`,
worktree clean, `npm test` fresh run 15/15 (2 files), production deployment
`app-f2nfba8ek` Ready and current, and the live migration list shows all five July
migrations applied (versions 20260714163250 through 20260714163421).

**DNS correction of record.** The July 13 claim "NO TXT records" was wrong: it checked
only the apex name. `_dmarc.cabinetshop.io TXT "v=DMARC1; p=quarantine; adkim=r;
aspf=r; rua=mailto:dmarc_rua@onsecureserver.net;"` EXISTS and must survive the cutover.
Therefore: do NOT switch nameservers. Keep GoDaddy DNS and change routing records only.
Vercel's current recommendation (re-pulled today via `vercel domains inspect`):
`A cabinetshop.io 76.76.21.21` [recommended]. Because `www` is already
`CNAME → cabinetshop.io` at GoDaddy, the ONLY required edit is the apex A records:

- DELETE: `A @ 3.33.130.190` and `A @ 15.197.148.33` (GoDaddy parking)
- ADD:    `A @ 76.76.21.21`
- Touch nothing else (keep `_dmarc` TXT, keep `www` CNAME, keep nameservers).

No authenticated GoDaddy session was available (Chrome extension not connected;
Claude does not enter passwords), so the edit itself is the remaining Frank step.
Post-change verification plan is unchanged: apex 200 product, www 308 to apex, SSL
both hosts, all public routes, fresh controlled form round-trips with readback cleanup.

**Production spot-check today (pre-DNS, via app-phi-neon.vercel.app):** security
headers verified live (HSTS preload, X-Frame-Options DENY, nosniff, referrer-policy,
permissions-policy); zero console errors and zero failed network requests on sign-in
and pricing (all assets 200 from dpl_8fFML4Wp…); mobile 375px no horizontal overflow;
`/app/dashboard` unauthenticated correctly redirects to `/sign-in` in production.
Form round-trips were NOT re-run today (yesterday's post-deploy round-trip with 1/1/1
row cleanup stands; next run happens on the real domain after DNS).

**Authenticated smoke: paused at authentication.** No stored session in the Browser
pane and no connected Chrome. The sign-in page is open and waiting; Frank completes
only the password step, then the full smoke (Dashboard, Board, Tasks, Constraints,
Projects, Team emails, Settings templates, desktop + mobile) proceeds without him.

**Design specification delivered (spec only, no implementation):**
`docs/design-spec.md` — proposed evolution (not teardown) of the current identity:
3 core colors (ink/paper/amber) + 5 semantic tokens, Archivo + IBM Plex Sans/Mono via
next/font (the app currently loads NO typeface), 8-step spacing scale, grouped sidebar
+ mobile bottom bar, locked board-card anatomy, shared empty/loading/error components,
responsive matrix, 6-step rollout. Six decisions flagged for Frank in §10; nothing
gets implemented until he approves.

---

## Rollout step 1 addendum — 2026-07-14 (evening)

Baseline re-verified: main == origin/main == `197ecc6` clean, `npm test` 15/15,
production `app-f2nfba8ek` current, all five July migrations present
(20260714163250–163421).

**Design spec APPROVED.** `docs/design-spec.md` PROPOSED → APPROVED with Frank's six
decisions recorded (Archivo + IBM Plex Sans/Mono; 4-item mobile bottom bar; right
drawer / mobile sheet; grouped sidebar; remove marketing glow in the marketing step;
park light theme) and the spacing clarification applied (routine spacing via
tokens/Tailwind classes/component variants; inline styles only for data-derived values).

**Rollout step 1 implemented and deployed** (commit `d85c7e6`, deploy
`dpl_81KsodupbGvm9fJjtiM29W11Pipn` = `app-8k3ew41qz`, READY + current production).
Files changed: `docs/design-spec.md`, `src/app/layout.tsx`, `src/app/globals.css`,
`tailwind.config.ts` only — no component/page/nav/behavior files.
- Fonts: next/font self-hosts Archivo (600/700/800), IBM Plex Sans (400/500/600),
  IBM Plex Mono (500/600), latin subset, display:swap, CSS variables on `<html>`.
- Tokens: ink/paper/amber core, neutral tints, 5 semantic status colors, typography,
  4–64 spacing scale, radius/focus/modal-shadow; mapped into Tailwind (Inter fallback
  removed). Foundational colors + shared component classes consume tokens at identical
  values (zero visual regression beyond the font swap); tabular-nums on tables + mono.

**Verification.** lint clean, `tsc --noEmit` clean, tests 15/15, production build
compiled with fonts self-hosted. Local production-build browser check (byte-identical
to the deploy) at 375 / 768 / 1440: body = IBM Plex Sans, h1 = Archivo, mono var =
IBM Plex Mono, tokens resolve (--ink #0a0a0a, --amber #f59e0b, --ok #34d399), no
horizontal overflow, hero glow preserved, four self-hosted woff2 files load (200),
zero console errors, zero failed requests. Live production (app-phi-neon.vercel.app)
confirmed serving `dpl_81Kso…` with the four woff2 fonts, all 10 public routes 200,
all five security headers, zero "Austin" / Houston present / "Free in pilot" live,
`/app/dashboard` 307 → /sign-in. (Browser-pane render of the live URL hung mid-check;
HTTP + identical-build browser evidence stand in its place.)

**Fresh production form round-trip (this session).** Via app-phi-neon (apex still
parked): Contact + Early Access both HTTP 200 `{"success":true}`; rows confirmed and
then deleted by exact id —
contact_messages `58825402-06f1-4aa3-a350-f6512421d30c`,
platform_activity `16ece420-658e-465e-abd2-67f103fed171`,
shop_database `1318e9c0-c431-45ae-ada8-b25990f5b51a` — separate readback proves
0/0/0 remaining. No test data left behind.

**NOT completed, exact blockers (browser-auth tooling, not code):**
- **GoDaddy DNS edit** (delete apex A 3.33.130.190 + 15.197.148.33, add A 76.76.21.21;
  keep NS, keep `www` CNAME → apex, keep `_dmarc` TXT). The `claude-in-chrome`
  extension is not connected this session (verified via repeated
  `list_connected_browsers` → [] and `tabs_context_mcp` → "not connected"); the in-app
  Browser pane holds no GoDaddy login; GoDaddy uses its own nameservers so Vercel CLI
  cannot touch the zone. DNS state re-captured today and still matches the safe-edit
  precondition exactly.
- **Real-domain verification** (apex serves product, www→apex 308, SSL both hosts):
  cascades from the DNS edit.
- **Authenticated app smoke** (Dashboard/Board/Tasks/Constraints/Projects/Team/
  Settings): needs a signed-in app session in a Claude-drivable browser; same
  unreachable-extension blocker. The app shell builds cleanly and inherits the global
  tokens/fonts, but per-page authenticated visual verification was not performed.
  To unblock either item: connect the Claude in Chrome extension (signed into the same
  account) with GoDaddy and the app open, then this work completes unattended.

---

## Re-issue re-verification — 2026-07-14 (late)

The step-1 task was re-issued. Re-checked the browser bridge first: `claude-in-chrome`
still not connected (`list_connected_browsers` → [], `tabs_context_mcp` → not
connected); no GoDaddy API key exists locally (searched env/dotfiles/repo); the in-app
Browser pane denies external navigation. So the GoDaddy DNS edit and authenticated
smoke remain blocked by the same root cause and were not performed.

Re-verified the deployed state is intact and current: HEAD == origin/main == `9b0501d`
clean; production = `app-8k3ew41qz` (`dpl_81Kso…`) Ready + current; `npm test` 15/15;
all 10 public routes 200; 4 self-hosted woff2 fonts served; all 5 security headers;
`austin=0 / houston=1 / "Free in pilot"=1`; migration tables tasks/messages/
job_templates/template_items/contact_messages all reachable via anon REST (200). DNS
unchanged (apex A 3.33.130.190 + 15.197.148.33; `www` CNAME → apex; `_dmarc` TXT
present; NS ns45/ns46.domaincontrol.com) — safe-edit precondition still exact.

Unblock path unchanged: connect the Claude in Chrome extension (same account, GoDaddy +
app tabs open) and the DNS edit + authenticated smoke complete unattended.

---

## Browser-bridge discovery — definitive (2026-07-14, re-authorized)

Re-authorized to complete the DNS + authenticated smoke through Frank's browser.
Ran the full Chrome discovery path, including the active pairing broadcast:
- `list_connected_browsers` → `[]` (retried 5+ times)
- `tabs_context_mcp` → "Claude in Chrome is not connected"
- `switch_browser` (broadcasts a Connect request to every Chrome with the extension,
  waits up to 2 min) → **"No other browsers available to switch to."**

The broadcast finding zero extension-equipped Chromes is definitive: no authenticated
Chrome is reachable from THIS Claude Code session (the extension is bound to another
session or its side panel is not attached here). The in-app Browser pane cannot
substitute — it holds no GoDaddy/app login and cannot perform the apex edit or the
authenticated smoke. GoDaddy uses its own nameservers (no Vercel-CLI path) and no
GoDaddy API key exists on disk. DNS edit + real-domain verification + authenticated
smoke remain the only open items, blocked solely on this bridge.

No drift: HEAD == origin/main == `05e842b`; production `app-8k3ew41qz` current; DNS
still parked (apex A 3.33.130.190 + 15.197.148.33, `www` CNAME → apex, `_dmarc` TXT
present, NS ns45/ns46.domaincontrol.com). Fix: attach the Claude in Chrome side panel
to THIS session (close any other Claude/Codex session holding it), then re-run.
