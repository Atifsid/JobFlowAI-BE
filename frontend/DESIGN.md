---
name: JobFlowAI
description: A dark, dense mission-control panel for running your own job search on autopilot.
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

**Creative North Star: "The Control Room"**

JobFlowAI's UI is a mission-control panel, not a storefront. There's one operator, one goal per screen, and the surface exists to get out of the way of a fast decision: scan the match, read the score, act, move to the next job. The near-black base reads like a console at rest; Burnt Clay is the one warm signal reserved for what actually needs attention — a score ring, a primary action, an active nav state. Everything else stays quiet on purpose.

This system explicitly rejects the generic AI-generated SaaS dashboard — no purple gradients, no hero-metric cards, no glassmorphism, no tiny uppercase eyebrows dressing up sections that don't need them. It equally rejects corporate ATS sterility — this isn't a compliance form, it's a tool one person actually wants to open. Because the job matching underneath is genuinely deterministic and explainable (see the project's matcher/decision pipeline), the visual language should read as instrumentation — legible readouts, not persuasion.

**Key Characteristics:**
- Near-black base with a single warm accent, used sparingly and consistently for signal (scores, primary actions, active states)
- Flat by default: borders and surface-color shifts carry hierarchy, not shadow or gradient
- Dense, left-aligned, system-font typography — no display serif, no decorative type
- Every screen scans in seconds: stat readouts, tables, and cards over narrative copy

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

Flat by default; borders do the work. Cards sit on Slate Panel against Near-black Ink with a 1px `border-color` border — that value shift plus the border is the primary depth cue. A shadow exists (`0 1px 3px rgba(0,0,0,0.3)`) but it's a faint ambient hint, not a design statement; it should never read as "lifted" or "floating." Nothing in this system uses a dramatic shadow, glow, or blur to imply depth — that reads as decorative, not instrumented.

### Shadow Vocabulary
- **Ambient** (`box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3)`): Default and only shadow on cards. Barely perceptible; reinforces the border, doesn't replace it.
- **Ambient Elevated** (`box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4)`): Reserved for genuinely overlaid surfaces (modals, popovers) if/when they're introduced — not for cards or buttons.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. The border and the Slate Panel/Ink contrast are what separate a card from the page — shadow is a supporting whisper, never the primary signal.

## 5. Components

Every control should feel utilitarian and immediate: fast, legible state changes, no decorative flourish. Controls are instruments, not marketing surfaces — a button press or a hover should feel instant and functional, not performative.

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
- **Shadow Strategy:** Ambient shadow only (see Elevation). Never elevated further on hover; cards aren't clickable surfaces that need to "lift."
- **Border:** 1px solid `border-color` (`#2d3748`) — this, not the shadow, is the primary edge definition.
- **Internal Padding:** `16px` (`--space-lg`).

### Inputs / Fields
- **Style:** Should match the card/button vocabulary — Slate Panel background, `border-color` 1px border, 4px radius, body-size text.
- **Focus:** Border shifts to Burnt Clay; no glow or shadow bloom — consistent with the Flat-By-Default rule.
- **Error / Disabled:** Error border shifts to Signal Red with helper text in the same red; disabled follows the button disabled treatment (0.6 opacity).

### Navigation
- **Sidebar** (desktop, ≥1024px): 220px fixed-width column, `border-right` 1px `border-color`. Links are body-size, Mid Fog text, `8px 12px` padding, 4px radius. Active link gets Slate Hover background and Bright Fog text — no accent color on the sidebar itself, hierarchy stays quiet here.
- **Bottom Tabs** (mobile/tablet, <1024px): Fixed bottom bar, Slate Panel background, `border-top` 1px `border-color`. Links are centered, 12px text, Mid Fog default. Active tab is the one place mobile nav uses Burnt Clay directly on text color — the signal color marking "you are here."
- **Header:** Single-row bar, `border-bottom` 1px `border-color`, product name at Headline scale. No search, no user menu — single-user tool, nothing to manage here.

### Score Ring (signature component)
The SVG score circle is the system's one custom instrument: a ring track in Slate Hover, filled proportionally in Burnt Clay with a rounded stroke cap, numeric score centered in Bright Fog Display-weight text. It's the clearest expression of the Control Room metaphor — a literal gauge — and should stay the only circular/radial data element in the system so it keeps its authority.

## 6. Do's and Don'ts

### Do:
- **Do** keep Burnt Clay (`#d97757`) to one purpose per screen — the primary action or the thing currently in focus. Everything else stays neutral.
- **Do** use borders (`1px solid #2d3748`) as the primary depth/separation cue, on Slate Panel (`#1a202c`) over Near-black Ink (`#0f1419`).
- **Do** keep all four status colors (green/amber/red/gray) mapped strictly to match/decision semantics — never decorative.
- **Do** keep every screen scannable in seconds: stat readouts, tables, and the score ring over narrative copy or long-form explanation.
- **Do** use the single system-sans stack for everything; differentiate purely by size, weight, and color-muting.

### Don't:
- **Don't** introduce a purple/gradient palette, hero-metric cards, glassmorphism, or tiny uppercase tracked eyebrows — the generic AI-generated SaaS dashboard look this system explicitly rejects.
- **Don't** build dense enterprise-ATS-style forms (Workday/Greenhouse-style) — sterile, bureaucratic layouts are an explicit anti-reference.
- **Don't** add shadow, glow, or lift beyond the Ambient shadow (`0 1px 3px rgba(0,0,0,0.3)`) to cards or buttons on hover. Flat-by-default holds even on interaction.
- **Don't** use `border-left`/`border-right` as a colored accent stripe on cards or list items. If something needs to stand out, use the badge/tint vocabulary or the accent color directly, not a stripe.
- **Don't** add a second typeface or a monospace variant "for a technical feel" — the One Family Rule holds; hierarchy comes from size/weight/color only.
- **Don't** use Burnt Clay for more than one element's worth of signal per screen — if two things are both accent-colored, one of them is wrong.
