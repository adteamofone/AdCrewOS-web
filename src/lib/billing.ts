import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { planForTier } from "@/lib/plans";
import { SubscriptionStatus, Tier } from "@prisma/client";

const APP_URL = process.env.APP_URL || "http://localhost:3000";

export function priceIdForTier(tier: Tier): string {
  const id = tier === "AGENCY" ? process.env.STRIPE_PRICE_AGENCY : process.env.STRIPE_PRICE_SOLO;
  if (!id) {
    throw new Error(
      `Missing Stripe price for ${tier}. Run \`npm run bootstrap:stripe\` and set STRIPE_PRICE_${tier}.`,
    );
  }
  return id;
}

/** Map Stripe subscription status -> our enum. */
export function mapStatus(s: Stripe.Subscription.Status | string): SubscriptionStatus {
  switch (s) {
    case "trialing":
      return "TRIALING";
    case "active":
      return "ACTIVE";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
      return "CANCELED";
    case "unpaid":
      return "UNPAID";
    case "incomplete":
    case "incomplete_expired":
      return "INCOMPLETE";
    default:
      return "PENDING";
  }
}

/** Create (or reuse) the Stripe customer for a user. */
export async function ensureCustomer(userId: string): Promise<string> {
  const stripe = getStripe();
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (sub?.stripeCustomerId) return sub.stripeCustomerId;

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name ?? undefined,
    metadata: { userId },
  });

  await prisma.subscription.upsert({
    where: { userId },
    create: { userId, stripeCustomerId: customer.id, tier: "SOLO", status: "PENDING" },
    update: { stripeCustomerId: customer.id },
  });
  return customer.id;
}

/** Hosted Checkout session for a new subscription with a 7-day trial. */
export async function createCheckoutSession(userId: string, tier: Tier): Promise<string> {
  const stripe = getStripe();
  const customerId = await ensureCustomer(userId);
  const plan = planForTier(tier);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: userId,
    line_items: [{ price: priceIdForTier(tier), quantity: 1 }],
    subscription_data: {
      trial_period_days: plan.trialDays,
      metadata: { userId, tier },
    },
    metadata: { userId, tier },
    allow_promotion_codes: true,
    success_url: `${APP_URL}/onboarding?checkout=success`,
    cancel_url: `${APP_URL}/signup?checkout=canceled`,
  });

  await prisma.subscription.update({
    where: { userId },
    data: { tier },
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return session.url;
}

/** Customer Portal for ongoing self-serve billing (separate surface from Checkout). */
export async function createPortalSession(userId: string): Promise<string> {
  const stripe = getStripe();
  const customerId = await ensureCustomer(userId);
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${APP_URL}/settings`,
  });
  return session.url;
}

/** Apply a Stripe subscription object to our DB. */
export async function syncSubscriptionFromStripe(sub: Stripe.Subscription): Promise<void> {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const record = await prisma.subscription.findFirst({ where: { stripeCustomerId: customerId } });
  if (!record) return;

  const tierMeta = (sub.metadata?.tier as Tier | undefined) ?? record.tier;
  // period end lives on the first item in newer Stripe API shapes
  const periodEnd =
    (sub as unknown as { current_period_end?: number }).current_period_end ??
    sub.items?.data?.[0]?.current_period_end;

  await prisma.subscription.update({
    where: { id: record.id },
    data: {
      tier: tierMeta,
      stripeSubscriptionId: sub.id,
      status: mapStatus(sub.status),
      trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    },
  });
}
