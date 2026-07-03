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

Fast, focused, no-nonsense. A utilitarian power tool, not a showcase —
dense information, minimal chrome, optimized for scanning speed over
decorative polish. Closer in feel to a terminal or IDE than a consumer
SaaS dashboard: quiet confidence rather than persuasion, because there's
no one here to persuade.

## Anti-references

- **Generic AI-generated SaaS dashboard** — purple gradients, hero-metric
  cards, glassmorphism, tiny uppercase eyebrows. The templated look this
  tool should never resemble, especially since match scoring here is
  genuinely deterministic and explainable — it shouldn't be dressed up
  in the same visual language as tools that fake that.
- **Corporate ATS software** — Workday/Greenhouse-style dense enterprise
  forms. Sterile, bureaucratic, built for HR compliance rather than a
  single person moving fast.

## Design Principles

- **Speed over spectacle.** Every screen optimizes for "scan, decide,
  act" in seconds. No animation, copy, or layout choice should slow that
  down in the name of looking impressive.
- **Density over decoration.** This is a single-user power tool, not a
  marketing surface — favor information density and tight, purposeful
  spacing over generous whitespace used for its own sake.
- **Explainable, not opaque.** Match scoring, decisions, and next actions
  are deterministic and reasoned (see CLAUDE.md's matcher/decision
  pipeline) — the UI should show *why* a job scored the way it did, not
  bury it behind a black-box-style badge.
- **Quiet confidence, not corporate stiffness.** Functional and precise
  without sliding into sterile ATS-form territory — this is a personal
  tool the user actually wants to open.
- **One master resume, tailored views.** The backend has one source of
  truth (master resume) rendered differently per job; the frontend
  should mirror that — consistent presentation patterns reused across
  jobs, not bespoke one-off layouts per screen.

## Accessibility & Inclusion

Standard WCAG AA baseline: sufficient color contrast, full keyboard
navigation, semantic HTML. Single known user, no specific accommodation
needs beyond that baseline — but don't cut corners on it, since AA
hygiene (contrast, focus states, semantic structure) is also what keeps
the UI fast to scan.
