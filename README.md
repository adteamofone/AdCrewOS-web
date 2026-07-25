# AdCrewOS

Autonomous ad-ops SaaS for solopreneurs and one-person agencies running Google & Meta
ads. Monitors spend 24/7, auto-pauses on protective breaches, and proposes approval-gated
scale-ups — a "pro cockpit," not a dashboard you babysit.

## Stack

- **Next.js 16** (App Router) · TypeScript · Tailwind v4 (dark-only brand tokens)
- **Prisma** + Postgres (Neon / Vercel Postgres)
- **Auth.js v5** — credentials + Google + Meta sign-in
- **Stripe** — Checkout + Customer Portal + signature-verified webhooks
- **Upstash Redis** — cron run locks / rate limiting (graceful local fallback)
- **Vercel Blob** — logo uploads + generated PDFs
- **Resend** (email) + **Twilio** (SMS) alerting
- **@react-pdf/renderer** — server-side branded PDF reports (no headless Chrome)
- **Google Ads API** + **Meta Marketing API** — metrics + pause/scale actions

## Local development

```bash
npm install
cp .env.example .env        # fill in what you have; demo path works with sandbox values

# Option A — no system Postgres needed: in-process pglite over the PG wire protocol
npm run db:server           # terminal 1  (listens on :5432 by default)
#   set DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/postgres?pgbouncer=true"
npm run db:push             # terminal 2
npm run dev
```

Open http://localhost:3000. Sign up → (Stripe test checkout, or skip if unconfigured) →
onboarding → **Skip → use demo data** to explore the full cockpit with synthetic data
running through the real automation engine.

## Tests

```bash
npm run db:server &         # tests default to the pglite dev DB
npm test                    # engine, billing, demo-path, and cron/poller suites
```

## Stripe products

```bash
STRIPE_SECRET_KEY=sk_test_... npm run bootstrap:stripe
# prints STRIPE_PRICE_SOLO / STRIPE_PRICE_AGENCY — add them to your env
```

## Deploy (Vercel)

1. Import the repo into Vercel (team `ad-crew-os`).
2. Add all env vars from `.env.example` (Production + Preview).
3. Provision Postgres (Neon/Vercel Postgres), Upstash Redis, and a Blob store; paste tokens.
4. `vercel.json` registers the `/api/cron/poll-accounts` cron (`*/12 * * * *`).
   > Sub-daily crons require a Vercel **Pro** plan; Hobby caps crons at once/day.
5. Register OAuth redirect URIs:
   - Google: `${APP_URL}/api/auth/callback/google`
   - Meta:   `${APP_URL}/api/auth/callback/facebook`
6. Stripe webhook endpoint: `${APP_URL}/api/webhooks/stripe` → set `STRIPE_WEBHOOK_SECRET`.
7. **Domain:** add `adcrewos.com` in Vercel → Project → Domains, then point DNS
   (A `76.76.21.21` or the CNAME Vercel shows) at Vercel.

## External gates (cannot be completed in code)

- Google Ads production API access + OAuth app verification.
- **Meta App Review for `ads_management`** before live Meta write actions.
- DNS control for `adcrewos.com`.

See `DECISIONS.md` for the running log of production-grade calls made during the build.
