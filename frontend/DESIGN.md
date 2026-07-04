---
name: JobFlowAI
description: A premium, dark-themed SaaS dashboard for running your own job search on autopilot — shadcn/ui-based, comparable to Vercel/Linear/Stripe/Clerk/Supabase.
colors:
  bg-page: "#0f1419"
  bg-surface: "#1a202c"
  bg-hover: "#2d3748"
  accent: "#d97757"
  accent-hover: "#c86644"
  success: "#10b981"
  warning: "#f59e0b"
  error: "#ef4444"
  neutral: "#6b7280"
  text-primary: "#f3f4f6"
  text-secondary: "#d1d5db"
  text-muted: "#9ca3af"
  border-color: "#2d3748"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.5px"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  button: "4px"
  card: "6px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#ffffff"
    rounded: "{rounded.button}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "#ffffff"
    rounded: "{rounded.button}"
    padding: "8px 16px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.button}"
    padding: "8px 16px"
  button-secondary-hover:
    backgroundColor: "{colors.bg-hover}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.button}"
    padding: "8px 16px"
  card:
    backgroundColor: "{colors.bg-surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.card}"
    padding: "16px"
  badge-success:
    backgroundColor: "rgba(16, 185, 129, 0.15)"
    textColor: "{colors.success}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  badge-warning:
    backgroundColor: "rgba(245, 158, 11, 0.15)"
    textColor: "{colors.warning}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  badge-error:
    backgroundColor: "rgba(239, 68, 68, 0.15)"
    textColor: "{colors.error}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  badge-neutral:
    backgroundColor: "rgba(107, 114, 128, 0.15)"
    textColor: "{colors.neutral}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
---

# Design System: JobFlowAI

## 1. Overview

**Creative North Star: "Premium SaaS cockpit"**

(Superseded 2026-07-04's "Control Room" direction on 2026-07-05 — the user explicitly chose a polished, modern SaaS aesthetic comparable to Vercel, Linear, Stripe Dashboard, Clerk, and Supabase over the earlier terminal/console metaphor, while keeping the same real data and single-user scope.)

JobFlowAI's UI should read like those reference products: confident, clean, well-considered — not a bare-bones utility screen, but not maximalist or decorative either. The near-black base and Burnt Clay accent carry over unchanged (they already work, and a warm accent against near-black reads as premium in exactly the products this now aims to resemble); what changes is the willingness to use restrained elevation, hover/active motion, and card-based composition the way Linear/Vercel do, rather than treating every shadow or lift as "decorative."

Still explicitly rejected: templated AI-generated SaaS clichés (purple gradients, glassmorphism-as-default, gradient text, tiny uppercase tracked eyebrows on every section, the literal big-number-plus-gradient-accent hero-metric template) and corporate ATS sterility (Workday/Greenhouse-style dense enterprise forms). "Premium" means Vercel/Linear/Stripe-quality polish, not either of those extremes.

**Key Characteristics:**
- Near-black base with a single warm accent, used sparingly and consistently for signal (scores, primary actions, active/current states)
- Restrained elevation: subtle shadows and hover-lift are allowed on genuinely interactive surfaces (cards that navigate somewhere, buttons) — still never gaudy, never a glow/blur effect
- Dense-but-breathable, left-aligned, system-font typography — no display serif, no decorative type
- Every screen scans quickly: stat readouts, compact row lists, and cards over narrative copy — polish serves scanability, it doesn't replace it

## 2. Colors

A near-black console with one warm accent color and a restrained semantic set for status; everything else is grayscale.

### Primary
- **Burnt Clay** (`#d97757`): The single accent. Used for primary buttons, the active nav state, and the score-ring fill — signals "this is the thing to look at or act on." Reserved deliberately; if everything is Burnt Clay, nothing is.
- **Burnt Clay Hover** (`#c86644`): Darker step for primary button hover/press states only.

### Neutral
- **Near-black Ink** (`#0f1419`): Page background. The console's resting state.
- **Slate Panel** (`#1a202c`): Surface background for cards, tables, the bottom-tab bar — one step up from Ink.
- **Slate Hover** (`#2d3748`): Hover/active background for interactive rows and nav links; doubles as the default border color.
- **Bright Fog** (`#f3f4f6`): Primary text — headings, values, primary labels.
- **Mid Fog** (`#d1d5db`): Secondary text — nav labels, secondary copy.
- **Low Fog** (`#9ca3af`): Muted text — stat card labels, timestamps, helper copy.

### Status (semantic, not decorative)
- **Signal Green** (`#10b981`): Success state — matched skills, `DIRECT_APPLY`/`REFERRAL`-leaning signals.
- **Signal Amber** (`#f59e0b`): Warning state — borderline scores, pending states.
- **Signal Red** (`#ef4444`): Error state — failed requests, `SKIP` decisions.
- **Signal Gray** (`#6b7280`): Neutral/inactive state — default badge tone when nothing else applies.

### Named Rules
**The One Signal Rule.** Burnt Clay is the only warm color on any screen. It marks exactly one thing per view: the primary action or the thing currently in focus (an active score ring, the selected nav item). Status colors (green/amber/red/gray) are reserved for match/decision semantics, never used as decoration.

## 3. Typography

**Display Font:** -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
**Body Font:** same stack (single family, no pairing)
**Label/Mono Font:** none — labels use the same sans at a smaller size and heavier weight

**Character:** One system-native sans, used across every role, differentiated only by size and weight. This is deliberate: a console doesn't need a second typeface to feel considered, and a native stack keeps every screen fast to render and native-feeling to the OS it runs on.

### Hierarchy
- **Display** (600, 28px, 1.2 line-height, -0.5px tracking): Page titles ("Dashboard", stat card values). The only place large type appears.
- **Headline** (600, 16px, 1.3 line-height): Section headings within a page ("Recent Activity", "Quick Start").
- **Body** (400, 14px, 1.6 line-height): Default text everywhere — table cells, card copy, form labels. Cap prose blocks (e.g. tailored resume preview text) at 65–75ch.
- **Label** (500, 12px, muted color): Stat card labels, badges, timestamps — small supporting text, always paired with a more prominent value nearby.

### Named Rules
**The One Family Rule.** No second typeface, no monospace flourish for "technical" feel. Hierarchy comes entirely from size, weight, and color-muting within one system sans — consistent with the console metaphor: instrumentation, not editorial design.

## 4. Elevation

Borders still do most of the work — cards sit on Slate Panel against Near-black Ink with a 1px `border-color` border, and that value shift plus the border remains the primary depth cue at rest. What changed from the earlier flat-only direction: genuinely interactive cards (ones that navigate somewhere on click — a recent-activity row, a job card) may lift subtly on hover, the way Linear/Vercel treat clickable rows. This is a state change that reinforces interactivity, not decoration applied at rest.

### Shadow Vocabulary
- **Ambient** (`box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3)`): Default resting shadow on cards. Barely perceptible; reinforces the border, doesn't replace it.
- **Ambient Elevated** (`box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4)`): Hover/active state for interactive cards and rows (promoted from "modals only" — now also the hover treatment for clickable surfaces), plus genuinely overlaid surfaces (dialogs, popovers, the command palette).
- Transitions on hover/lift: plain `transform`/`box-shadow` fade, ease-out, ~150-200ms. No bounce/elastic easing (matches the general no-gaudy-motion rule).

### Named Rules
**The Purposeful Elevation Rule.** Borders + Slate Panel/Ink contrast still define a card at rest. Shadow lift is reserved for hover/active states on surfaces that are actually clickable — it's a state change communicating "this responds to you," never a static decorative flourish on non-interactive containers.

## 5. Components

Every control should feel considered and responsive: clear, legible state changes with a touch of tactile polish (subtle transform/shadow on press or hover where it fits) — the Vercel/Linear/Stripe standard, not decorative flourish for its own sake.

### Buttons
- **Shape:** 4px radius (`--radius-button`) — barely rounded, deliberately understated.
- **Primary:** Burnt Clay background (`#d97757`), white text, 600 weight, `8px 16px` padding. One per view, reserved for the primary action (Search Jobs, Generate Resume, Send referral draft).
- **Secondary:** Transparent background, `border-color` border, primary text color. Used for every non-primary action (View Tracker, cancel, back).
- **Hover / Focus:** Primary hovers to Burnt Clay Hover (`#c86644`); secondary hovers to Slate Hover (`#2d3748`) background. Transition is a plain 0.2s background/border-color fade — no transform, no shadow change.
- **Disabled:** 0.6 opacity, `cursor: not-allowed`. No color shift beyond that.

### Badges (Chips)
- **Style:** Pill shape (999px radius), 15%-opacity tint of the status color as background, full-opacity status color as text, 12px/500 weight.
- **State:** Four tones only — success, warning, error, neutral — mapped directly to match/decision semantics (matched skill, borderline, skipped, default). Never used decoratively.

### Cards / Containers
- **Corner Style:** 6px radius (`--radius-card`) — slightly softer than buttons, still understated.
- **Background:** Slate Panel (`#1a202c`) on Near-black Ink page background.
- **Shadow Strategy:** Ambient shadow at rest. Cards/rows that navigate somewhere on click get Ambient Elevated + a subtle lift on hover (see Elevation) — non-interactive containers (e.g. a stat card with no click target) stay at Ambient only, since lift on a non-clickable surface would be a false affordance.
- **Border:** 1px solid `border-color` (`#2d3748`) — the primary edge definition at rest; on hover, interactive cards may also shift the border toward Slate Hover or Burnt Clay depending on context.
- **Internal Padding:** `16px` (`--space-lg`).

### Inputs / Fields
- **Style:** Should match the card/button vocabulary — Slate Panel background, `border-color` 1px border, 4px radius, body-size text.
- **Focus:** Border shifts to Burnt Clay; no glow or shadow bloom — consistent with the Flat-By-Default rule.
- **Error / Disabled:** Error border shifts to Signal Red with helper text in the same red; disabled follows the button disabled treatment (0.6 opacity).

### Navigation

(Updated 2026-07-05 — the sidebar/bottom-tabs shell described here previously was replaced by a shadcn/ui `Sidebar` + `AppShell` during the Foundation phase of the shadcn redesign; this section now describes what's actually built, under `src/components/layout/`.)

- **Sidebar** (desktop/tablet, shadcn `Sidebar` with `collapsible="icon"`): persistent column, collapsible to an icon rail. Nav items (Dashboard, Job Search, Tracker) use `SidebarMenuButton` — Mid Fog text at rest, Slate Hover background + Bright Fog text when active. No accent color on the sidebar itself; hierarchy stays quiet here, consistent with the One Signal Rule.
- **Mobile** (<768px, shadcn breakpoint): sidebar becomes a `Sheet`-based drawer, triggered from the header's `SidebarTrigger`.
- **Header:** Sticky single-row bar, `border-bottom` 1px `border-color`. Contains the sidebar trigger, a route-derived breadcrumb trail, and a ⌘K command-palette trigger (jump to any tracked job by title/company — real data via `dashboardService`, not a static search). No user profile dropdown, no notification bell — still correct that there's nothing to manage there (no auth/notifications API), but the header is no longer literally "no search": the command palette is a real, data-backed feature, not a decorative search box.

### Score Ring (signature component)
The SVG score circle is the system's one custom instrument: a ring track in Slate Hover, filled proportionally in Burnt Clay with a rounded stroke cap, numeric score centered in Bright Fog Display-weight text. It should stay the only circular/radial data element in the system so it keeps its authority as the one signature gauge.

## 6. Do's and Don'ts

### Do:
- **Do** keep Burnt Clay (`#d97757`) to one purpose per screen — the primary action or the thing currently in focus. Everything else stays neutral.
- **Do** use borders (`1px solid #2d3748`) as the primary depth/separation cue, on Slate Panel (`#1a202c`) over Near-black Ink (`#0f1419`).
- **Do** keep all four status colors (green/amber/red/gray) mapped strictly to match/decision semantics — never decorative.
- **Do** keep every screen scannable in seconds: stat readouts, tables, and the score ring over narrative copy or long-form explanation.
- **Do** use the single system-sans stack for everything; differentiate purely by size, weight, and color-muting.

### Don't:
- **Don't** introduce a purple/gradient palette, gradient text, glassmorphism-as-default, tiny uppercase tracked eyebrows on every section, or the literal big-number-plus-gradient-accent hero-metric template — the templated AI-generated SaaS look, not the genuine Vercel/Linear/Stripe polish this system now targets.
- **Don't** build dense enterprise-ATS-style forms (Workday/Greenhouse-style) — sterile, bureaucratic layouts are an explicit anti-reference.
- **Don't** add hover lift/shadow to a card or container that has no click target — elevation-on-hover communicates interactivity, so it's a false affordance on something that doesn't respond to a click.
- **Don't** use `border-left`/`border-right` as a colored accent stripe on cards or list items. If something needs to stand out, use the badge/tint vocabulary or the accent color directly, not a stripe.
- **Don't** add a second typeface or a monospace variant "for a technical feel" — the One Family Rule holds; hierarchy comes from size/weight/color only.
- **Don't** use Burnt Clay for more than one element's worth of signal per screen — if two things are both accent-colored, one of them is wrong.
- **Don't** invent UI for capabilities the backend doesn't have (auth/profile, notifications, saved/recommended jobs, a resume-score endpoint) — ground every section in real data (see PRODUCT.md's Anti-references).
