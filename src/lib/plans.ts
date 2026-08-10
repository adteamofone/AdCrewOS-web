import { Tier } from "@prisma/client";

/**
 * Plan definitions.
 *
 * Four tiers (pricing env-overridable):
 *   WATCHDOG (free) — monitor + alert only, NO auto-actions. Top-of-funnel wedge.
 *   SOLO / PRO / AGENCY — paid, full autopilot (auto-pause + approval-gated scale).
 *
 * `capabilities` drives what the automation engine is allowed to do for an
 * account owned by a user on this tier:
 *   - autoPause      : execute protective auto-pause on breach
 *   - approvalScale  : create approval-gated scale proposals on beat
 *   - whiteLabel     : Agency logo on reports
 *   - monitorOnly    : convenience flag = alert on breach but never act (Watchdog)
 */

export type PlanCapabilities = {
  autoPause: boolean;
  approvalScale: boolean;
  whiteLabel: boolean;
  monitorOnly: boolean;
};

export const PLANS = {
  WATCHDOG: {
    tier: "WATCHDOG" as Tier,
    name: "Watchdog",
    priceCents: 0,
    priceLabel: "Free",
    accountsPerPlatform: 1,
    trialDays: 0,
    paid: false,
    tagline: "A free watchdog for your ad spend.",
    capabilities: {
      autoPause: false,
      approvalScale: false,
      whiteLabel: false,
      monitorOnly: true,
    } as PlanCapabilities,
    features: [
      "1 Google or Meta account",
      "24/7 monitoring of your spend",
      "Instant breach alerts (email + SMS)",
      "No auto-actions — you stay hands-on",
      "Upgrade any time to let it act for you",
    ],
  },
  SOLO: {
    tier: "SOLO" as Tier,
    name: "Solo",
    priceCents: Number(process.env.PRICE_SOLO_CENTS ?? 8900),
    priceLabel: "$89",
    accountsPerPlatform: 1,
    trialDays: 7,
    paid: true,
    tagline: "For the operator running their own spend.",
    capabilities: {
      autoPause: true,
      approvalScale: true,
      whiteLabel: false,
      monitorOnly: false,
    } as PlanCapabilities,
    features: [
      "1 Google + 1 Meta account",
      "24/7 auto-pause on budget bleed",
      "One-tap scale approvals",
      "SMS + email alerts",
      "Branded PDF reports",
    ],
  },
  PRO: {
    tier: "PRO" as Tier,
    name: "Pro",
    priceCents: Number(process.env.PRICE_PRO_CENTS ?? 19900),
    priceLabel: "$199",
    accountsPerPlatform: 3,
    trialDays: 7,
    paid: true,
    tagline: "For prosumers and growing shops.",
    capabilities: {
      autoPause: true,
      approvalScale: true,
      whiteLabel: false,
      monitorOnly: false,
    } as PlanCapabilities,
    features: [
      "Up to 3 accounts per platform",
      "Everything in Solo",
      "Priority alerting",
      "Faster polling cadence",
      "Multi-account alert feed",
    ],
  },
  AGENCY: {
    tier: "AGENCY" as Tier,
    name: "Agency",
    priceCents: Number(process.env.PRICE_AGENCY_CENTS ?? 39900),
    priceLabel: "$399",
    accountsPerPlatform: 10,
    trialDays: 7,
    paid: true,
    tagline: "For the one-person shop running client books.",
    capabilities: {
      autoPause: true,
      approvalScale: true,
      whiteLabel: true,
      monitorOnly: false,
    } as PlanCapabilities,
    features: [
      "Up to 10 client accounts per platform",
      "Everything in Pro",
      "White-labeled reports (your logo)",
      "Per-client targets & thresholds",
      "Priority alerting",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

/** All tiers, in display order. */
export const TIER_ORDER: Tier[] = ["WATCHDOG", "SOLO", "PRO", "AGENCY"];

/** Paid tiers only (WATCHDOG is free and has no Stripe price). */
export const PAID_TIERS: Tier[] = ["SOLO", "PRO", "AGENCY"];

export function planForTier(tier: Tier) {
  switch (tier) {
    case "WATCHDOG":
      return PLANS.WATCHDOG;
    case "PRO":
      return PLANS.PRO;
    case "AGENCY":
      return PLANS.AGENCY;
    case "SOLO":
    default:
      return PLANS.SOLO;
  }
}

export function accountCap(tier: Tier): number {
  return planForTier(tier).accountsPerPlatform;
}

export function capabilities(tier: Tier): PlanCapabilities {
  return planForTier(tier).capabilities;
}

export function isPaidTier(tier: Tier): boolean {
  return planForTier(tier).paid;
}
