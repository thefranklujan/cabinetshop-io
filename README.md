# CabinetShop.io

A niche operating system for custom cabinet shops — clients, quotes, a 13-stage
production board, materials, cut lists, purchase orders, shop-floor time, scheduling,
invoices, and reporting. Built to FrankOS standards alongside Command PRO and MatFlow.

Three surfaces live in one Next.js app:

- **Marketing** (`/`, `/features`, `/pricing`, `/about`, `/contact`, `/early-access`) — public site + early-access funnel.
- **Shop app** (`/app/*`) — the per-shop workspace. Auth-gated; one workspace per shop, multi-tenant.
- **Platform admin** (`/platform/*`) — SaaS-owner console: all shops, prospect database, email campaigns with open/click tracking, activity log. Gated by the `is_platform_admin` RPC.

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14.2 (App Router) + React 18 + TypeScript |
| Auth | **Supabase Auth** (email/password) — *not* Clerk |
| Database | Supabase Postgres, **RLS-enforced** multi-tenancy |
| Email | Resend (platform outreach campaigns) |
| Styling | Tailwind CSS 3.4 + Lucide icons |
| Hosting | Vercel |

> Tenant isolation is enforced in the database, not just the app: every shop table is
> gated by `workspace_id in (select current_workspaces())`, where `current_workspaces()`
> returns the caller's workspaces from `workspace_members`. The client never filters by
> workspace itself — RLS is the source of truth. Keep it that way.

## Local setup

```bash
cp .env.example .env.local   # fill in the Supabase values (see below)
npm install
npm run dev                  # http://localhost:3000
```

Get the Supabase URL + anon key from the **CabinetShop.io** project
(ref `ibarpcoigmpnicljeyzu`) → Project Settings → API. `RESEND_API_KEY` and
`TRACKING_HMAC_SECRET` are only needed to send/track outreach email locally.

## Scripts

| Script | Does |
|--------|------|
| `npm run dev` | Next dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (`next/core-web-vitals`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run check` | lint + typecheck + build — run before every push |

## Database & migrations

The database foundation is versioned in [`supabase/migrations/`](supabase/migrations).
These files were captured **verbatim** from the live project's migration ledger
(`supabase_migrations.schema_migrations`) and are kept in sync with it — filenames match the
remote `<version>_<name>.sql` so the Supabase CLI treats them as already applied. Do not
renumber them.

What's captured: all 17 tables, RLS enablement + every policy, the tenant-isolation helper
`current_workspaces()`, the signup→workspace/invite trigger `handle_new_user()`, the
owner-bootstrap trigger `add_owner_as_member()`, and the platform RPCs
(`is_platform_admin`, `is_platform_admin_check`, `platform_stats`,
`increment_campaign_opens`, `increment_campaign_clicks`).

Working with migrations (requires the Supabase CLI + the project access token):

```bash
supabase link --project-ref ibarpcoigmpnicljeyzu
supabase migration list      # local files vs. remote ledger
supabase db pull             # capture new remote changes into a migration file
supabase db push             # apply new local migrations to the remote DB
```

**Discipline:** schema/RLS/function changes go through a new migration file committed to
this repo — never hand-edit tables in the Supabase dashboard. If you must, immediately
`supabase db pull` so the repo stays the source of truth.

## Deployment

Hosted on Vercel, auto-deploys on push to `main`. Verify before pushing with `npm run check`.

## Roadmap

Built from the 2026-06-08 audit. Current phase: **foundation** (repo hygiene + DB capture).
Next up: verify tenant isolation end-to-end with two test users, enforce the
`admin/member/viewer` roles (currently defined in the DB but not enforced in the UI), and
make Settings persist. Then the core cabinet-shop workflow (estimating/quoting), shop-floor
mobile polish, and billing/launch readiness.
