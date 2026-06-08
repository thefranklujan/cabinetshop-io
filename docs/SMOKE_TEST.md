# CabinetShop.io — Smoke Test Checklist

Manual pre-release pass. Work top to bottom; each item is a quick yes/no. Use **two
browsers/profiles** (or an incognito window) so you can hold two roles at once.

> Suggested test cast (one shop): an **owner** account, plus an invited **admin**,
> **member**, and **viewer**. The owner is created automatically on signup.

---

## 1. Auth & onboarding
- [ ] Sign up a brand-new account at `/sign-up`.
- [ ] First login lands on `/onboarding` and prompts to name the shop.
- [ ] After naming, you land in `/app/dashboard`; the sidebar shows the shop name + your role (`owner`).
- [ ] Sign out (sidebar footer) → redirected to `/sign-in`.
- [ ] Sign back in → land in `/app/dashboard`.
- [ ] Visiting `/app/*` while signed out redirects to `/sign-in`.

## 2. Workspace selection / switcher
- [ ] With only one shop, **no** switcher appears in the sidebar (just the shop name in the footer).
- [ ] Belong to a second shop (accept an invite from another owner, or create a second account that invites you), then reload: a **Shop** switcher appears at the top of the sidebar.
- [ ] Switching shops reloads the app showing that shop's data only (no merged rows).
- [ ] The selection **persists** across a full page reload and across sign-out/sign-in.

## 3. Settings persistence (owner/admin)
- [ ] Open `/app/settings` as owner/admin: existing values load (not blank/mock).
- [ ] Edit shop name, email, phone, address, hourly rate, tax rate, currency → **Save Changes**.
- [ ] Success banner shows; sidebar shop name updates.
- [ ] Reload the page → values persisted.
- [ ] As **member** or **viewer**: Settings is **not** in the nav; visiting `/app/settings` directly shows a read-only notice and disabled fields with no Save button.

## 4. Role behavior (RBAC)
- [ ] **owner/admin**: see Team + Settings nav, "New Job" button, and create/delete controls across modules.
- [ ] **member**: can create/edit records, but **no delete buttons**, **no** Team/Settings nav.
- [ ] **viewer**: read-only everywhere — no create buttons, inline selects/inputs disabled, no delete.
- [ ] Attempting a blocked action surfaces a clear message (no silent failure / no console crash).

## 5. Team invite & role change (owner/admin)
- [ ] `/app/team` → **Invite Member** with a role (admin/member/viewer) creates a pending invite.
- [ ] Revoke a pending invite (trash icon) removes it.
- [ ] When the invited email signs up, they're added to the shop with the invited role.
- [ ] Change an existing member's role via the per-member dropdown (admin/member/viewer) → persists on reload.
- [ ] The **owner** row shows a static "owner" chip — it cannot be demoted or removed.
- [ ] As member/viewer, the Team page is read-only (no invite, no role dropdowns, no revoke).

## 6. Dashboard & navigation
- [ ] `/app/dashboard` renders KPIs without errors.
- [ ] Every sidebar nav item routes correctly and highlights the active item.

## 7. Smoke CRUD (as owner/admin)
For each module: **create** one record, confirm it appears, edit it, then delete it.
- [ ] Clients
- [ ] Projects
- [ ] Materials (and inline in-stock edit)
- [ ] Cut Lists (add part, toggle done, delete)
- [ ] Purchase Orders (and inline status change)
- [ ] Schedule (event appears on the calendar + table)
- [ ] Invoices (and inline status change)

## 8. Production board
- [ ] `/app/board` shows jobs grouped by stage.
- [ ] Drag a card to a new stage → it moves and persists on reload.
- [ ] Back/Forward buttons on a card move it one stage.
- [ ] As **viewer**: cards are not draggable and have no move buttons.

## 9. Mobile / responsive
- [ ] At ~375px width: sidebar collapses to the hamburger drawer; opening/closing works.
- [ ] No horizontal scroll on any page; tables scroll within their card, not the page.
- [ ] Modals (New Client, etc.) are usable on mobile.

## 10. Platform admin (`/platform`)
- [ ] As a **platform admin** (email in `platform_admins`): `/platform` loads the all-shops console, campaigns, prospect database, activity.
- [ ] As a **non-admin** signed-in user: visiting `/platform` redirects to `/app` (no access).
- [ ] Signed out: `/platform` redirects to `/sign-in`.

## 11. Health
- [ ] **Zero console errors** on each page (open DevTools console while clicking through).
- [ ] No failed network requests (red) in the Network tab during normal use.
- [ ] **Vercel deploy sanity**: latest `main` deploy is green; production URL loads the marketing site and `/sign-in` without errors.
- [ ] `npm run check` passes locally (lint + typecheck + build).

---

### Notes / known scope (not bugs)
- Estimating/quoting, billing/Stripe, and editable production-stage lists are **not built yet** (intentionally deferred).
- Team member identities show a shortened user id rather than email (email join is a later enhancement).
