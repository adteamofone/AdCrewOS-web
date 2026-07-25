import Stripe from "stripe";

/**
 * Server-side Stripe client. Two surfaces are used across the app:
 *  - Checkout Sessions (new subscriptions, trial_period_days: 7)
 *  - Billing/Customer Portal (ongoing self-serve management)
 * plus signature-verified webhooks. Do not conflate them.
 */

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripe) return stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  stripe = new Stripe(key, {
    // Pin an API version for deterministic behavior.
    apiVersion: "2025-08-27.basil",
    appInfo: { name: "AdCrewOS" },
  });
  return stripe;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export const PRICE_ENV = {
  SOLO: "STRIPE_PRICE_SOLO",
  AGENCY: "STRIPE_PRICE_AGENCY",
} as const;
