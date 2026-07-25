# AdCrewOS — Build Decisions

Running log of production-grade calls made where the spec left room. Kept per the
build prompt's instruction ("note it briefly in a DECISIONS.md, and keep building").

## Stack & framework
- **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4.** create-next-app
  pinned the latest stable. Tailwind v4 is CSS-config based; brand tokens live in
  `globals.css` under `@theme` rather than `tailwind.config.js`.
- **Prisma** (over Drizzle) for the ORM — spec allowed either; Prisma's migration +
  typed client story is the faster production call.
- **Auth.js v5 (next-auth@beta)** with the Prisma adapter. v5 is the App-Router-native
  line and the current shipping guidance.

## Data model
- Added NextAuth adapter tables (Account/Session/VerificationToken) alongside the spec
  entities.
- `AutomationEvent` carries a `status` state machine so SCALE_PROPOSAL events have a
  real approve/dismiss/execute lifecycle (spec requires one-tap approve/dismiss).
- `Target.pauseThreshold` / `scaleThreshold` are interpreted per-metric by the engine
  (for CPC/CPA lower is better → breach = observed ABOVE threshold; for ROAS higher is
  better → breach = observed BELOW threshold). Documented in the engine module.
- Tokens stored encrypted (AES-256-GCM) via `TOKEN_ENCRYPTION_KEY`.

## Pricing
- Solo $97/mo, Agency $297/mo, both monthly with a 7-day trial — treated as
  **placeholders** per spec (`PRICE_SOLO_CENTS` / `PRICE_AGENCY_CENTS` env-overridable).

## Automation engine
- Hybrid mode, no toggle (v1). Auto-pause on protective breach; propose-only on scale.
- Poll cadence targeted at every ~12 min via Vercel Cron; Redis (Upstash) provides a
  per-account lock + run dedupe. Falls back to a no-op lock when Redis env is absent so
  local/demo runs still work.
- Demo accounts run the identical engine against a seeded synthetic generator.

## Deployment
- Real GitHub repo → Vercel (team `ad-crew-os`). Not Viktor Spaces (different stack,
  no custom-domain support).
- All third-party keys wired via env vars; app boots + demo path works with sandbox
  values so nothing hard-blocks on missing production credentials.

## Known external gates (cannot be completed autonomously)
- Google Ads production API access / OAuth app verification.
- **Meta App Review for `ads_management`** — required before live Meta actions.
- adcrewos.com DNS pointing to Vercel.
- Provisioning of Neon/Upstash/Blob/Resend/Twilio accounts + keys.
