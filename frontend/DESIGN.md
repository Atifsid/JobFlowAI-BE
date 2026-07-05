---
name: JobFlowAI
description: A premium, dark-themed SaaS dashboard for running your own job search on autopilot — shadcn/ui-based, comparable to Vercel/Linear/Stripe/Clerk/Supabase.
colors:
  # Went fully monochrome 2026-07-05 (second palette revision same day):
  # user tried the warm-terracotta-accent direction rendered, didn't like
  # it, and asked for "the theme of shadcn... black and white... minimal"
  # instead. These are shadcn's own stock dark-mode "neutral" values
  # (oklch, chroma 0 throughout) converted to hex — no brand hue at all.
  # Status colors are the one deliberate exception, kept per explicit
  # instruction: real semantic meaning (job status / ATS result), not brand
  # decoration, so they stay colored while everything else goes gray.
  bg-page: "#0a0a0a"
  bg-surface: "#171717"
  bg-hover: "#262626"
  accent: "#e5e5e5"
  accent-hover: "#d4d4d4"
  accent-foreground: "#171717"
  success: "#10b981"
  warning: "#f59e0b"
  error: "#ff6467"
  neutral: "#a1a1a1"
  text-primary: "#fafafa"
  text-secondary: "#d4d4d4"
  text-muted: "#a1a1a1"
  border-color: "#262626"
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
    textColor: "{colors.accent-foreground}"
    rounded: "{rounded.button}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.accent-foreground}"
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
    backgroundColor: "rgba(255, 91, 87, 0.15)"
    textColor: "{colors.error}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  badge-neutral:
    backgroundColor: "rgba(167, 156, 151, 0.15)"
    textColor: "{colors.neutral}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
---

# Design System: JobFlowAI

## 1. Overview

**Creative North Star: "Monochrome instrument panel"**

(Second revision, same day — 2026-07-05. The "Premium SaaS cockpit" direction above kept a warm terracotta brand accent; the user looked at the rendered result, didn't like it, and asked to "follow the theme of shadcn... black and white... keep it minimal" instead. This supersedes the warm-accent direction — no brand hue anywhere now.)

JobFlowAI's UI is literally shadcn/ui's own stock dark "neutral" theme: near-black background, near-white foreground, grayscale surfaces, a light-gray/white primary (shadcn's standard dark-mode convention — an inverted, near-white button rather than a colored one). The only color left in the entire system is functional: the four status tones (success/warning/error/neutral) that carry real job-status/ATS meaning. Nothing is colored for brand or decoration.

Still explicitly rejected: templated AI-generated SaaS clichés (purple gradients, glassmorphism-as-default, gradient text, tiny uppercase tracked eyebrows on every section, the literal big-number-plus-gradient-accent hero-metric template) and corporate ATS sterility (Workday/Greenhouse-style dense enterprise forms).

**Key Characteristics:**
- Pure grayscale base and primary (chroma 0 throughout) — no brand hue anywhere
- Color exists only as functional signal: the four status tones, never used decoratively
- Restrained elevation: subtle shadows and hover-lift are allowed on genuinely interactive surfaces (cards that navigate somewhere, buttons) — still never gaudy, never a glow/blur effect
- Dense-but-breathable, left-aligned, system-font typography — no display serif, no decorative type
- Every screen scans quickly: stat readouts, compact row lists, and cards over narrative copy — polish serves scanability, it doesn't replace it

## 2. Colors

A near-black, near-white grayscale system with a restrained semantic set for status; nothing else is colored.

### Primary
- **Primary (light gray/white)** (`#e5e5e5`): The primary action color — used for primary buttons, the active nav state, and the score-ring fill. Not a brand hue; it's shadcn's standard dark-mode "inverted" primary (light surface, dark text). Reserved for the one primary action per view.
- **Primary Hover** (`#d4d4d4`): Slightly dimmer step for primary button hover/press states.
- **Primary Foreground** (`#171717`): Dark text/icon color used on top of the light Primary surface (buttons, the active sidebar item's icon if it needs contrast).

### Neutral
- **Near-black** (`#0a0a0a`): Page background.
- **Panel** (`#171717`): Surface background for cards, tables, and the sidebar — one step up from the page background.
- **Hover** (`#262626`): Hover/active background for interactive rows and nav links; doubles as the default border color.
- **Foreground** (`#fafafa`): Primary text — headings, values, primary labels.
- **Secondary Text** (`#d4d4d4`): Secondary text — nav labels, secondary copy.
- **Muted Text** (`#a1a1a1`): Muted text — stat card labels, timestamps, helper copy.

### Status (semantic, not decorative — the only color in the system)
- **Signal Green** (`#10b981`): Success state — matched skills, `DIRECT_APPLY`/`REFERRAL`-leaning signals.
- **Signal Amber** (`#f59e0b`): Warning state — borderline scores, pending states.
- **Signal Red** (`#ff6467`): Error state — failed requests, skipped/rejected statuses.
- **Signal Gray** (`#a1a1a1`): Neutral/inactive state — default badge tone when nothing else applies. (Same value as Muted Text — both are "no particular signal", so sharing the token is intentional, not an oversight.)

### Named Rules
**The Color-Is-Function Rule.** No hue exists in this system except the four status tones, and each marks a real job-status/ATS meaning — never decoration, never a "brand" color. Primary/nav/focus states are grayscale (light-on-dark inversion), not colored.

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

Borders still do most of the work — cards sit on Panel against Near-black with a 1px `border-color` border, and that value shift plus the border remains the primary depth cue at rest. What changed from the earlier flat-only direction: genuinely interactive cards (ones that navigate somewhere on click — a recent-activity row, a job card) may lift subtly on hover, the way Linear/Vercel treat clickable rows. This is a state change that reinforces interactivity, not decoration applied at rest.

### Shadow Vocabulary
- **Ambient** (`box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3)`): Default resting shadow on cards. Barely perceptible; reinforces the border, doesn't replace it.
- **Ambient Elevated** (`box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4)`): Hover/active state for interactive cards and rows (promoted from "modals only" — now also the hover treatment for clickable surfaces), plus genuinely overlaid surfaces (dialogs, popovers).
- Transitions on hover/lift: plain `transform`/`box-shadow` fade, ease-out, ~150-200ms. No bounce/elastic easing (matches the general no-gaudy-motion rule).

### Named Rules
**The Purposeful Elevation Rule.** Borders + Panel/Ink contrast still define a card at rest. Shadow lift is reserved for hover/active states on surfaces that are actually clickable — it's a state change communicating "this responds to you," never a static decorative flourish on non-interactive containers.

## 5. Components

Every control should feel considered and responsive: clear, legible state changes with a touch of tactile polish (subtle transform/shadow on press or hover where it fits) — the Vercel/Linear/Stripe standard, not decorative flourish for its own sake.

### Buttons
- **Shape:** 4px radius (`--radius-button`) — barely rounded, deliberately understated.
- **Primary:** Primary background (`#e5e5e5`), Primary Foreground (dark) text, 600 weight, `8px 16px` padding. One per view, reserved for the primary action (Search Jobs, Generate Resume, Send referral draft).
- **Secondary:** Transparent background, `border-color` border, primary text color. Used for every non-primary action (View Tracker, cancel, back).
- **Hover / Focus:** Primary hovers to Primary Hover (`#d4d4d4`); secondary hovers to Hover (`#262626`) background. Transition is a plain 0.2s background/border-color fade — no transform, no shadow change.
- **Disabled:** 0.6 opacity, `cursor: not-allowed`. No color shift beyond that.

### Badges (Chips)
- **Style:** Pill shape (999px radius), 15%-opacity tint of the status color as background, full-opacity status color as text, 12px/500 weight.
- **State:** Four tones only — success, warning, error, neutral — mapped directly to status/ATS semantics (matched keyword, needs review, skipped, default). Never used decoratively.

### Cards / Containers
- **Corner Style:** 6px radius (`--radius-card`) — slightly softer than buttons, still understated.
- **Background:** Panel (`#171717`) on Near-black page background.
- **Shadow Strategy:** Ambient shadow at rest. Cards/rows that navigate somewhere on click get Ambient Elevated + a subtle lift on hover (see Elevation) — non-interactive containers (e.g. a stat card with no click target) stay at Ambient only, since lift on a non-clickable surface would be a false affordance.
- **Border:** 1px solid `border-color` (`#262626`) — the primary edge definition at rest; on hover, interactive cards may also shift the border toward Hover or Primary depending on context.
- **Internal Padding:** `16px` (`--space-lg`).

### Inputs / Fields
- **Style:** Should match the card/button vocabulary — Panel background, `border-color` 1px border, 4px radius, body-size text.
- **Focus:** Border shifts to Primary; no glow or shadow bloom — consistent with the Purposeful Elevation Rule.
- **Error / Disabled:** Error border shifts to Signal Red with helper text in the same red; disabled follows the button disabled treatment (0.6 opacity).

### Navigation

(Updated 2026-07-05 — the sidebar/bottom-tabs shell described here previously was replaced by a shadcn/ui `Sidebar` + `AppShell` during the Foundation phase of the shadcn redesign; this section now describes what's actually built, under `src/components/layout/`.)

- **Sidebar** (desktop/tablet, shadcn `Sidebar` with `collapsible="icon"`): persistent column, collapsible to an icon rail. Nav items (Dashboard, Job Search, Tracker) use `SidebarMenuButton` — Secondary Text text at rest, Hover background + Foreground text when active. No accent color on the sidebar itself; hierarchy stays quiet here, consistent with the Color-Is-Function Rule. The "JobFlowAI" wordmark in `SidebarHeader` collapses to a "JF" mark (`group-data-[collapsible=icon]:hidden`/`:inline` pair) rather than clipping when the rail narrows.
- **Mobile** (<768px, shadcn breakpoint): sidebar becomes a `Sheet`-based drawer, triggered from the header's `SidebarTrigger`.
- **Header:** Sticky single-row bar, `border-bottom` 1px `border-color`. Contains just the sidebar trigger and a route-derived breadcrumb trail. (A ⌘K command palette for jumping to tracked jobs was tried and removed 2026-07-05 — searching from an already-tracked-jobs context didn't earn its place in the header.) No user profile dropdown, no notification bell — no backing auth/notifications API.

### Score Ring (signature component)
The SVG score circle is the system's one custom instrument — it displays the ATS keyword-coverage score of a generated resume (the product's only score): a ring track in Hover, filled proportionally in Primary with a rounded stroke cap, numeric score centered in Foreground Display-weight text. It should stay the only circular/radial data element in the system so it keeps its authority as the one signature gauge.

## 6. Do's and Don'ts

### Do:
- **Do** keep Primary (`#e5e5e5`) to one purpose per screen — the primary action or the thing currently in focus. Everything else stays neutral.
- **Do** use borders (`1px solid #262626`) as the primary depth/separation cue, on Panel (`#171717`) over Near-black (`#0a0a0a`).
- **Do** keep all four status colors (green/amber/red/gray) mapped strictly to status/ATS semantics — never decorative.
- **Do** keep every screen scannable in seconds: stat readouts, tables, and the score ring over narrative copy or long-form explanation.
- **Do** use the single system-sans stack for everything; differentiate purely by size, weight, and color-muting.

### Don't:
- **Don't** introduce a purple/gradient palette, gradient text, glassmorphism-as-default, tiny uppercase tracked eyebrows on every section, or the literal big-number-plus-gradient-accent hero-metric template — the templated AI-generated SaaS look, not the genuine Vercel/Linear/Stripe polish this system now targets.
- **Don't** build dense enterprise-ATS-style forms (Workday/Greenhouse-style) — sterile, bureaucratic layouts are an explicit anti-reference.
- **Don't** add hover lift/shadow to a card or container that has no click target — elevation-on-hover communicates interactivity, so it's a false affordance on something that doesn't respond to a click.
- **Don't** use `border-left`/`border-right` as a colored accent stripe on cards or list items. If something needs to stand out, use the badge/tint vocabulary or the accent color directly, not a stripe.
- **Don't** add a second typeface or a monospace variant "for a technical feel" — the One Family Rule holds; hierarchy comes from size/weight/color only.
- **Don't** use Primary for more than one element's worth of signal per screen — if two things are both accent-colored, one of them is wrong.
- **Don't** invent UI for capabilities the backend doesn't have (auth/profile, notifications, saved/recommended jobs) — ground every section in real data (see PRODUCT.md's Anti-references).
