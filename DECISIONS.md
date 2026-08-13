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

## Deploy checkpoint (2026-07-25)
- Repo moved to `adteamofone/AdCrewOS-web` (option 2, per Charles). Old `adcrewos` repo untouched.
- README rewritten as a plain-English, non-technical user guide; technical/dev+deploy docs moved to DEVELOPMENT.md.
- Vercel account (`ad-crew-os`, hobby) is brand-new: **0 integrations installed, GitHub not connected**. Two steps require a one-time OAuth click in the Vercel dashboard that an API token cannot perform:
  1. Connect GitHub + import the repo (installs the Vercel GitHub App).
  2. Provision Postgres — marketplace store creation (`POST /v1/storage/stores/integration/direct`) needs an installed integration config (`icfg_...`); none exist yet, so a provider (Neon/Supabase) must be connected once via the Storage tab.
- Redis (Upstash) and Blob are optional for the demo preview: `redis.ts` falls back to no-op locks; Blob only backs logo upload. Postgres + secrets are the only hard requirements for a working demo-mode preview.
- Prod secrets (NEXTAUTH_SECRET, TOKEN_ENCRYPTION_KEY, CRON_SECRET) generated and held for injection once the project exists.

## Pricing restructure — four tiers incl. free Watchdog (2026-08-02)
Decision (confirmed w/ Charles): replace the 2-tier Solo/Agency model with four tiers:
- **Watchdog — Free**: 1 account, monitor + alerts only, NO auto-actions (top-of-funnel wedge).
- **Solo — $89/mo**: 1 acct/platform, full autopilot (auto-pause + approval-gated scale).
- **Pro — $199/mo**: up to 3 accts/platform, priority alerting ("most popular" anchor).
- **Agency — $399/mo**: up to 10 client accts/platform, white-label reports.

Implementation:
- `src/lib/plans.ts` — added WATCHDOG/PRO; each plan now carries `paid`, `capabilities`
  ({autoPause, approvalScale, whiteLabel, monitorOnly}); helpers `capabilities()`, `isPaidTier()`,
  `PAID_TIERS`, `TIER_ORDER`.
- Prisma `Tier` enum → WATCHDOG|SOLO|PRO|AGENCY; new `AutomationType.MONITOR_ALERT`.
  Applied via `prisma db push` (repo uses db push, not migration files).
- Engine (`src/lib/engine.ts`) gained `EngineOptions.monitorOnly`: on breach it logs a
  MONITOR_ALERT + fires `onMonitorAlert` (deduped 6h) but never pauses; scale beats ignored.
- Poller derives `monitorOnly` from the account owner's tier capabilities.
- `src/lib/alerts.ts` — new `alertMonitor()` (breach heads-up + upgrade nudge).
- Free tier skips Stripe: register creates Watchdog subs as ACTIVE (paid stay PENDING);
  checkout rejects WATCHDOG; signup form routes Watchdog straight to onboarding.
- Stripe bootstrap now creates Solo/Pro/Agency products; deactivates stale prices so a price
  change is picked up. New env: STRIPE_PRICE_PRO, PRICE_PRO_CENTS; amounts updated to 8900/19900/39900.
- UI: landing pricing shows 4 tiers (Pro = "Most popular", Watchdog = "Free forever"); signup
  tier picker + settings updated (Watchdog shows an upgrade card instead of billing portal).
- Tests: added `tests/watchdog.test.ts` (monitor-only alerts+logs but never pauses; full mode
  still pauses). Suite 16/16 green; production build passes (17 routes).

Still placeholder: exact prices (Charles may fine-tune); annual plans + founding-member
lifetime lock are planned but not yet built.

## Production launch verification (2026-08-13)

Infra completed on team `ad-crew-os`:
- Env injected to `adcrew-os-web` (prod/preview/dev): AUTH_SECRET/NEXTAUTH_SECRET,
  TOKEN_ENCRYPTION_KEY, CRON_SECRET, APP_URL/NEXTAUTH_URL, ENABLE_DEMO, ALERT_FROM_EMAIL,
  PRICE_*_CENTS. No secrets in the repo.
- Neon Postgres schema synced (`prisma db push`).
- **Vercel Blob store `adcrewos-blob` created and connected** → BLOB_READ_WRITE_TOKEN
  auto-injected; logo uploads + stored report PDFs live.
- Prod deploy READY at https://adcrew-os-web.vercel.app (adcrewos.com wiring: see DEVELOPMENT.md).

Live end-to-end verified against production (demo-data path):
- Signup (Solo) → checkout gracefully skipped w/o Stripe key → 4-step onboarding →
  Skip→demo seeding → dashboard cockpit.
- Engine via `/api/cron/poll-accounts` (Bearer CRON_SECRET): protective breach →
  AUTO_PAUSE (account PAUSED, Resume works); scale beat → SCALE_PROPOSAL **PENDING**,
  never auto-executed; one-tap Approve +20% → SCALE_APPLIED; Dismiss works.
- Reports: Solo PDF renders the AdCrewOS mark; after uploading a logo in /settings
  (Agency), the same report renders the uploaded logo. Both verified from downloaded PDFs.

Still gated on external credentials (env vars already wired): Stripe live/test keys,
Resend, Twilio, Google Ads OAuth + dev token, Meta app + App Review, adcrewos.com DNS.
