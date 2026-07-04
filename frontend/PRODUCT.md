# Product

## Register

product

## Users

A single user: the developer, using this personally to run their own job
search. Sessions are short and frequent — checking in between other work
to scan new matches, make a quick apply/skip/referral call, or push a
tailored resume out the door. High trust in the data (it's their own
resume, their own tracker); no onboarding, no permissions model, no
multi-tenant concerns. The job to be done on any given screen is a fast
decision, not a leisurely read.

## Product Purpose

JobFlowAI automates the mechanical parts of a job search — searching,
matching against a master resume, tailoring, tracking, finding referral
contacts — collapsing what used to be a 2–3hr manual workflow into
under 2 minutes per job. The frontend is the cockpit for that pipeline:
surface the deterministic match score and reasoning, let the user make
a fast call, and get out of the way. Success looks like: open the
dashboard, understand the state of every job at a glance, act on it in
one or two clicks, move on.

## Brand Personality

Polished, modern, premium SaaS — comparable to Vercel, Linear, Stripe
Dashboard, Clerk, or Supabase. This superseded an earlier "Control Room /
terminal" direction (2026-07-04): the user explicitly chose the
SaaS-comparable direction on 2026-07-05 when redesigning the frontend
with shadcn/ui, even though it's a single-user tool — the reasoning is
that "single-user" describes the audience, not a reason to look
utilitarian. Confident, clean, and considered, the way those reference
products feel — not maximalist, not decorative for its own sake, but not
deliberately stripped-down either.

**Color, specifically (revised same day, second pass):** monochrome —
shadcn/ui's own stock black/white/gray dark theme, no custom brand hue.
The first pass tried a warm terracotta accent; the user saw it rendered
and asked to "follow the theme of shadcn... black and white... keep it
minimal" instead. Color is reserved entirely for status semantics
(success/warning/error/neutral job-decision states) — not used for
primary actions, nav, or brand identity. See DESIGN.md's Color-Is-
Function Rule.

## Anti-references

- **Generic AI-generated SaaS dashboard clichés** — purple gradients,
  glassmorphism-as-default, tiny uppercase tracked eyebrows on every
  section, gradient text, side-stripe borders as accents, the literal
  "big number + small label + gradient accent" hero-metric template.
  Premium SaaS products avoid these too — the goal is Vercel/Linear/
  Stripe-quality polish, not templated AI-generated polish.
- **Corporate ATS software** — Workday/Greenhouse-style dense enterprise
  forms. Sterile, bureaucratic, built for HR compliance rather than a
  single person moving fast. Still an anti-reference: "premium SaaS"
  doesn't mean "enterprise form density."
- **Fabricated data.** This app has one real user and one real backend —
  never dress up the UI with sections that imply data the API doesn't
  have (saved jobs, recommendations, a resume score endpoint, a
  notifications/user-profile system). Ground every section in what
  `frontend/src/types/index.ts` and the backend actually return; design
  a real empty state instead of inventing content.

## Design Principles

- **Premium polish over utilitarian bareness.** Comparable in visual
  quality to Vercel/Linear/Stripe/Clerk/Supabase — considered spacing,
  clear hierarchy, purposeful hover/focus/active states, subtle
  elevation where it earns its place (see DESIGN.md's Elevation
  section, updated 2026-07-05 to allow restrained shadow/hover-lift on
  genuinely interactive surfaces).
  - **Fast decisions, still.** The underlying job-to-be-done hasn't
  changed — scan the state of every job, act in one or two clicks, move
  on. Polish should never come at the cost of scanability: hierarchy and
  density choices still serve "decide fast," they're just no longer
  expressed through bare-bones/flat-only styling.
- **Explainable, not opaque.** Match scoring, decisions, and next actions
  are deterministic and reasoned (see CLAUDE.md's matcher/decision
  pipeline) — the UI should show *why* a job scored the way it did, not
  bury it behind a black-box-style badge.
- **One master resume, tailored views.** The backend has one source of
  truth (master resume) rendered differently per job; the frontend
  should mirror that — consistent presentation patterns (shared shadcn
  components, one design language) reused across pages, not bespoke
  one-off layouts per screen.
- **Real data only.** Every section maps to an actual API field or a
  value computed from real API data (e.g. an average score derived from
  real per-job scores). No mock data, no hardcoded placeholder content,
  no sections implying capabilities (auth, notifications, saved/
  recommended jobs) that don't exist in the backend.

## Accessibility & Inclusion

Standard WCAG AA baseline: sufficient color contrast, full keyboard
navigation, semantic HTML. Single known user, no specific accommodation
needs beyond that baseline — but don't cut corners on it, since AA
hygiene (contrast, focus states, semantic structure) is also what keeps
the UI fast to scan.
