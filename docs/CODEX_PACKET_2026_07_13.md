# CabinetShop.io — Implementation Packet for Codex (2026-07-13)

One authoritative packet reconciling the Codex independent audit (2026-07-13, vault
capture `cabinetshop-io-independent-product-and-app-store-a.md`) with the Claude Code
stabilization receipt (`docs/RECEIPT_2026_07_13_STABILIZATION.md`). Goal: complete
redesign toward an App Store presence without creating a second product or second
backend.

## 0. Ground truth as of commit `4f951ad`

Both audits agreed on the P0 list. Status after the stabilization pass:

| Codex P0 finding | Status |
|---|---|
| DNS parked, not on Vercel | Domain attached to Vercel project `app`; GoDaddy nameserver flip is the only remaining step (Frank) |
| 8 production vulnerabilities incl. critical Next 14.2.5 | FIXED: next 14.2.35, 6 unused packages removed; 2 residual advisories are Next 15-only fixes, no applicable vector |
| Early-access false success, silent lead loss | FIXED: definer-function write path, error-honest route, 15 regression tests |
| Contact form visual-only | FIXED: durable contact_messages + /platform/inbox triage |
| Overstated marketing/pricing claims | FIXED: honest pilot copy everywhere, planned pricing labeled as planned |
| No privacy/terms/deletion/support surfaces | Privacy, Terms, Support pages live; deletion is email-based (in-app deletion is an App Store REQUIREMENT, see §3) |
| No tests | vitest suite (routes + middleware) + rolled-back SQL verification script; RLS/gates/board E2E coverage still open |
| No same-workspace child validation | Migration authored (trigger on every child FK, old and new tables) |

Still pending before ANY deploy of main: apply 5 migrations (3 lean + 2 stabilization),
run `verify_stabilization.sql`, then deploy + promote + production verify.

## 1. Product thesis (unchanged, both audits agree)

One CabinetShop product. One Supabase backend (`ibarpcoigmpnicljeyzu`), RLS-enforced
multi-tenancy, 13-stage board + gates/readiness/constraints as the differentiator —
the operational middle between cabinet CAD systems and generic contractor PM tools.

Two clients:
- **Web (Next.js, existing):** owner/admin surface — workspace creation, onboarding,
  team, billing (future), reports, platform admin, marketing site.
- **Native iOS (new):** focused daily-operations companion for the shop floor and
  field. NOT a WebView wrapper.

## 2. Redesign instructions — web app

Follow the Crafted design workflow: produce a `design-spec.md` FIRST (Design Brief
Questionnaire with Frank), then implement. Non-negotiable style rules: no gradients,
orbs, noise, or glassmorphism; maximum 3 colors; generous spacing (inline styles for
spacing, not Tailwind spacing classes); no dashes in visible copy; every change
applied universally across similar pages; mobile + desktop with zero console errors.

Architecture work (Codex audit, confirmed by inspection):
1. **Kill the monolithic store.** `src/lib/store.tsx` loads ~16 workspace datasets in
   one client context on every page and reloads everything after most mutations.
   Move to per-module queries with caching, optimistic updates, and Supabase realtime
   deltas. This is the single biggest perf/scale item before more shops onboard.
2. **Separate concerns in-repo:** marketing site, shop app, platform console as
   distinct route groups with distinct layouts/providers (already partially true);
   no shared client store between them.
3. **Pagination + limits** on activity, messages, tasks, and platform lists.
4. **Files/photos:** Supabase Storage with per-workspace bucket policies — gates and
   punch lists need photo evidence; iOS capture depends on it.
5. **Notifications:** OneSignal per the house standard (push + in-app toasts) once
   iOS lands; email via a transactional provider only when something real exists to
   send (invites, approval requests).
6. **Billing (web only):** Stripe checkout + server-side entitlements table read by
   RLS/API. Keep iOS free of any purchase UI or upgrade language (§3).
7. **Testing bar:** RLS isolation suite, gate/readiness unit tests, board E2E
   (Playwright), plus the existing vitest + SQL verification scripts in CI.

## 3. Native iOS V1 (the App Store path)

Precedents: Command PRO v5 (Expo + Supabase native app, EAS build pipeline proven)
and My Home Projects (App Store approval 2026-07-13). Reuse that machinery.

- **Stack:** Expo React Native + @supabase/supabase-js auth/data. Shared TypeScript
  domain types + validation extracted to a package both clients import.
- **Screens (daily-ops focus):** Today (my tasks + due gates), Constraints,
  Production Board (read + stage moves w/ gate checks), Job detail (readiness panel,
  timeline, tasks, photos), Schedule, Shop Floor timer, More.
- **Native value:** camera capture to job timeline/punch items, push notifications
  (approval requested, gate overdue, job blocked), offline-tolerant timers and task
  ticks with queued sync, deep links (cabinetshop://job/<id>).
- **Business model shape for review:** iOS app is a free companion — sign in or
  accept an invite; NO pricing, upgrade, checkout, or external purchase links
  anywhere in the binary. Entitlements enforced server-side.
- **App Store compliance checklist (hard requirements):**
  - In-app account deletion (Guideline 5.1.1(v)) — email-based deletion is NOT
    sufficient once the app offers account creation; build a Settings → Delete
    Account flow that actually deletes (server function).
  - Privacy nutrition labels — filled on App Store Connect WEB, not in Xcode
    (house gotcha 2026-07).
  - Privacy manifest (PrivacyInfo.xcprivacy) for required-reason APIs.
  - Demo account for review with seeded, realistic shop data.
  - Screenshots at 1290x2796 (1320x2868 renders as storefront placeholders —
    verified on My Home Projects).
  - Support URL → cabinetshop.io/support (live), Privacy URL → /privacy (live).
- **Sequence gate:** iOS starts only after §0 pending items are deployed and the
  web operational core (files/photos, notifications, invites polish) is stable.

## 4. Platform console

Keep centered on: shops, onboarding funnel (prospects + inbox), usage, subscription
readiness, support (feedback + inbox), release health. Campaign tooling stays
removed; `/api/track` + `/api/unsubscribe` remain as dormant endpoints for old email
links. Add release-health basics: error tracking (Sentry) and a deploy/version stamp
in the footer.

## 5. Sequence (reconciled)

0. Frank unblocks: Supabase access + GoDaddy nameservers. Elon applies migrations,
   verifies, deploys, production-verifies (receipt §Blocked has the exact order).
1. Web redesign spec (`design-spec.md` with Frank) → store decomposition → files/
   photos → notifications → invites polish. Regression: full smoke + RLS suite.
2. Billing on web with honest pilot-to-paid transition (pilot shops grandfathered
   notice), entitlements server-side.
3. iOS V1 per §3 against the same backend; TestFlight with the pilot shop(s).
4. App Store submission with the §3 compliance checklist complete.

## 6. Hard constraints (do not violate)

- One backend. No second product. No WebView wrapper submitted to Apple.
- RLS stays the tenant boundary; every new table follows the proven policy pattern
  (`current_workspaces()` / `can_write_workspace()` / `is_workspace_admin()`) plus
  the same-workspace trigger for child references.
- Operational content (gate defs, checklist templates, lists, prompts) is DB-backed
  and Settings-editable; a redeploy for a content tweak is a failure mode.
- Never claim in copy what is not shipped. The pricing page pattern (planned,
  clearly labeled) is the template for pre-announcing anything.
- Preserve commits `7a6bbdb` (lean phases 2 to 5) and `4f951ad` (stabilization);
  build on them, do not regenerate them.
