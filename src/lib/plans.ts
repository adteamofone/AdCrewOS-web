import { Tier } from "@prisma/client";

/** Plan definitions — pricing placeholders, env-overridable. */

export const PLANS = {
  SOLO: {
    tier: "SOLO" as Tier,
    name: "Solo",
    priceCents: Number(process.env.PRICE_SOLO_CENTS ?? 9700),
    priceLabel: "$97",
    accountsPerPlatform: 1,
    trialDays: 7,
    tagline: "For the operator running their own spend.",
    features: [
      "1 Google + 1 Meta account",
      "24/7 auto-pause on budget bleed",
      "One-tap scale approvals",
      "SMS + email alerts",
      "Branded PDF reports",
    ],
  },
  AGENCY: {
    tier: "AGENCY" as Tier,
    name: "Agency",
    priceCents: Number(process.env.PRICE_AGENCY_CENTS ?? 29700),
    priceLabel: "$297",
    accountsPerPlatform: 10,
    trialDays: 7,
    tagline: "For the one-person shop running client books.",
    features: [
      "Up to 10 client accounts per platform",
      "Everything in Solo",
      "White-labeled reports (your logo)",
      "Per-client targets & thresholds",
      "Priority alerting",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export function planForTier(tier: Tier) {
  return tier === "AGENCY" ? PLANS.AGENCY : PLANS.SOLO;
}

export function accountCap(tier: Tier): number {
  return planForTier(tier).accountsPerPlatform;
}
