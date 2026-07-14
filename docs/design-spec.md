# CabinetShop.io — Design Specification (PROPOSED)

**Status: awaiting Frank's approval. No implementation until approved.**
Prepared 2026-07-14 per `docs/patterns/design-workflow.md` (DBQ structure) and the
redesign scope in `docs/CODEX_PACKET_2026_07_13.md`. Once approved, this file is law:
no visual decision ships that is not covered here, and deviations need explicit sign off.

---

## 0. Redesign context

- **What works (keep):** the dark, high-contrast shop identity; the amber accent; the
  13-stage board as the product's visual centerpiece; information-dense tables; the
  honest, direct copy voice; the readiness/constraints mental model.
- **What is broken (fix):** no typeface is loaded at all (system default everywhere,
  which reads generic and violates house rules); spacing is ad hoc pixel values with
  no scale; color usage has drifted (blue, sky, orange, emerald, red used untokenized);
  tables collapse poorly on mobile; nav is a plain link list with no grouping as the
  module count grew to 15; empty/loading/error states are inconsistent one-offs.
- **Scope: evolution, not teardown.** Same identity, systematized. This is a reskin +
  tokenization + component consolidation, not a rebrand.
- **Preserved brand assets:** the CabinetShop wordmark pattern ("CabinetShop" white +
  ".io" amber) and the two-bar mark in the logo tile.
- **Explicitly out of scope for this spec:** store decomposition, billing UI, native
  iOS. (Those follow the Codex packet after this spec is approved.)

## 1. Identity

- **Purpose:** the operating system for custom cabinet shops; production control, not
  generic project management.
- **Audience:** shop owners, foremen, office managers, and crew; on desktops in the
  office and phones/tablets on the floor and in the field.
- **Core action:** move real jobs through 13 stages with nothing missing.
- **Feel words:** shop-built, precise, load-bearing, calm under pressure, honest.
- **Anti-feel:** startup-y, playful, decorative, "AI dashboard".

## 2. Visual system

### Aesthetic
Industrial control panel. Dark like a CNC controller screen, with one warm signal
color. Flat surfaces, hairline borders, engineered corners. The board and the numbers
are the decoration; nothing else competes with them.

### Base theme
Dark only for v1 (matches shop lighting and current identity). A high-glare "shop
floor" light variant is a POST-APPROVAL exploration, not in this scope (see §10).

### Core colors (3, per house rule)
| Token | Hex | Role |
|---|---|---|
| `--ink` | `#0A0A0A` | app background |
| `--paper` | `#FAFAF7` | primary text |
| `--amber` | `#F59E0B` | the one accent: actions, active states, brand |

Derived neutrals (tints of ink, not new colors): `--surface #111111`,
`--surface-2 #161616`, `--line #1E1E1E`, `--line-strong #262626`,
`--muted #737373`, `--body #D4D4D4`.

### Semantic status colors (excluded from the 3-color budget, used ONLY for state)
| Token | Hex | Meaning |
|---|---|---|
| `--ok` | `#34D399` | ready, paid, approved, done |
| `--warn` | `#F59E0B` | warn-gate, aging 7+, pending attention (shares amber deliberately) |
| `--danger` | `#F87171` | blocked, overdue, declined, destructive |
| `--info` | `#60A5FA` | in-progress, informational |
| `--external` | `#FB923C` | waiting on client/vendor (external constraint) |

Rule: sky/teal/purple and any color not in these tables are banned. Every current
usage of `text-blue-400`, `text-sky-400`, etc. maps to one of the five semantic tokens.

### Typography (Google Fonts, loaded via `next/font`)
- **Display/headings: Archivo** (weights 600/700/800, with Archivo Expanded 700 for
  page titles and marketing heroes). Industrial grotesque, reads like machine labeling.
- **Body/UI: IBM Plex Sans** (400/500/600). Workhorse, excellent at 13 to 14px.
- **Data/mono: IBM Plex Mono** (500) for job numbers, SKUs, dollar figures in tables,
  and stage-age badges; always `font-variant-numeric: tabular-nums` for columns.
- Never Inter/Roboto/Arial/system defaults (currently the whole app is system default;
  this is the single highest-impact fix).

Type ramp (px): 11 label / 13 body / 14 emphasized / 16 section / 20 panel title /
28 page title / marketing hero clamps as today. Line-height 1.5 body, 1.1 display.

### Spacing tokens (inline styles, per house spacing law)
Scale: 4, 8, 12, 16, 24, 32, 48, 64. Named `--space-1` … `--space-8`. Cards pad 24;
page gutters 24 mobile / 32 desktop; section gaps 32; generous by default. No one-off
pixel values outside the scale.

### Radius, borders, elevation
`--radius-sm 8px` (chips, inputs), `--radius 12px` (buttons, cards), `--radius-lg 16px`
(modals, panels). Borders are the elevation system: `--line` default, `--line-strong`
hover, amber at 40% for active/focus. **No shadows except one modal shadow token; no
gradients, orbs, noise, glass, or blur anywhere** (the current marketing hero's radial
glow is removed).

## 3. Taste parameters

- **DESIGN_VARIANCE: 6** — distinctive within a disciplined system.
- **MOTION_INTENSITY: 2** — 150ms color/border transitions only; no entrance
  animations, no parallax, no skeleton shimmer (static skeleton blocks are fine).
- **VISUAL_DENSITY: 7** — this is an operations tool; density is a feature. Tables and
  the board stay tight; marketing pages breathe wider.

## 4. Layout and navigation

- **App shell:** fixed left sidebar 260px desktop; content max 1500px. Sidebar gains
  grouped sections to tame 15 modules: **Flow** (Dashboard, Production Board, Tasks,
  Constraints), **Jobs** (Projects, Clients, Schedule), **Shop** (Materials, Cut Lists,
  Purchase Orders, Shop Floor), **Money** (Invoices, Reports), **Admin** (Team,
  Settings). Group labels 11px uppercase muted.
- **Mobile (< 1024px):** sidebar becomes a full-height sheet from the left (as today),
  plus a NEW fixed bottom bar with the four Flow items (Dashboard, Board, Tasks,
  Constraints) for one-thumb shop-floor use. Bottom bar is the main mobile navigation;
  the sheet is the long tail.
- **Header:** search, workspace context, New Job. Unchanged structurally.
- **Marketing:** same tokens and fonts; light on density (VISUAL_DENSITY 4); hero is
  typography + the board preview, no background effects.

## 5. Component rules (single source, no local variants)

- **Button:** primary (amber fill, ink text), secondary (surface + line), destructive
  (danger border/text, fills on hover), ghost (text only). Heights 36/40. No other
  variants; no one-off buttons.
- **Card:** surface + line + radius 12 + pad 24. KPI card = card + 11px uppercase
  label + 24px value (mono for money) + optional semantic tone border at 40%.
- **Chip:** as today, but only semantic tones from §2.
- **Inputs:** current `.input` pattern tokenized; focus ring = amber border, no glow.
  Labels stay 11px uppercase.
- **Tables:** header row surface-2; row hover surface-2; money/ids in Plex Mono
  tabular; **mobile rule:** any table with more than 4 columns renders as stacked
  cards under 768px (shared `ResponsiveTable` component, one implementation).
- **Board card:** the flagship component. Locked anatomy: job number (mono 10px) /
  name (14px semibold) / client (12px muted) / footer row: priority dot + money (mono)
  / meta row: due date + stage-age badge + readiness chip / danger border when blocked.
  Nothing else may be added to the card without spec revision.
- **Modals/panels:** center modal ≤ 640px for forms; the Readiness/job panel becomes a
  right-side drawer (480px, full-height) on desktop, full-screen sheet on mobile.
- **Icons:** Lucide only, 16px in text rows, 20px nav, 1.75px stroke, never filled.
- **Empty/loading/error states (every module, one shared component):**
  - Empty: icon + one honest sentence + one primary action. No illustrations.
  - Loading: 3 static skeleton rows in surface-2 (no shimmer).
  - Error: danger-toned card with the actual message + retry. Never a silent blank.
  - These replace today's inconsistent per-page one-offs.

## 6. Content voice

As shipped in the stabilization pass: plain, first-person shop language, no dashes in
visible copy, no overstated claims, numbers over adjectives. Microcopy examples in the
codebase are the reference ("Nothing is waiting on anyone. Clear board.").

## 7. Accessibility

- Contrast: 4.5:1 minimum for text (verify `--muted` on `--surface`: 4.6:1 passes on
  ink, fails on surface-2 for small text — muted text on surface-2 must be 12px+
  semibold or bumped to `--body`).
- Every interactive element keyboard reachable, with a visible amber focus ring
  (2px offset), aria-labels on icon-only buttons, `prefers-reduced-motion` respected
  (trivially, given MOTION_INTENSITY 2).
- Touch targets 44px minimum on mobile (current board arrows and chip buttons fail
  this; the redesign fixes them).

## 8. Responsive matrix

Breakpoints: 375 (floor phone), 768 (tablet/van), 1024 (shop office), 1440 (owner
desk). Every page verified at 375 and 1440 minimum before done; no horizontal scroll,
no clipped controls, board scrolls horizontally inside its own container by design.

## 9. Rollout sequence (after Frank approves; each step ships alone)

1. Tokens + fonts (`globals.css` custom properties, next/font, tailwind config
   mapping) — zero layout change, app-wide.
2. Shell: grouped sidebar + mobile bottom bar.
3. Shared primitives: EmptyState/LoadingState/ErrorState, ResponsiveTable, drawer.
4. Board + dashboard to locked anatomies.
5. Remaining modules, one PR each, universal-edit rule enforced.
6. Marketing pages aligned last (already honest, just tokenized).

Store decomposition (Codex packet §2.1) runs as its own track after step 3, not
mixed into visual PRs.

## 10. Decisions that need Frank

1. **Font pair approval:** Archivo + IBM Plex Sans/Mono (recommended, industrial) vs
   alternative pair Space Grotesk + Source Sans 3 (rounder, friendlier). One choice.
2. **Mobile bottom bar:** yes/no. Recommended yes; it changes shop-floor ergonomics.
3. **Job panel as right drawer** instead of center modal: yes/no. Recommended yes.
4. **Sidebar grouping labels** as proposed in §4, or flat list as today.
5. **Marketing hero glow removal** (the current radial amber glow violates the
   no-gradient rule; recommend removing, but it is a visible brand change).
6. **Light "shop floor" theme:** park (recommended) or explore now.

## 11. Banned list (unchanged from house rules, restated for this project)

Gradients, orbs, noise textures, glassmorphism, shadows-as-decoration, purple,
Inter/Roboto/system fonts, skeleton shimmer, entrance animations, one-off spacing or
z-index values, inline styles that override shared components, any fourth core color.
