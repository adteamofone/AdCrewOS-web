/**
 * Idempotent Stripe bootstrap — creates the Solo, Pro & Agency Products +
 * monthly Prices programmatically so no manual dashboard setup is needed.
 * (Watchdog is free and has no Stripe product.)
 *
 * Idempotency: products are looked up by a stable `metadata.adcrewos_key`;
 * prices by (product, unit_amount, interval). Re-running is safe. If a plan's
 * price changed, a new active Price is created and the old one is deactivated
 * so Checkout always uses the current amount.
 *
 * Usage:  STRIPE_SECRET_KEY=sk_test_... npm run bootstrap:stripe
 * Then copy the printed STRIPE_PRICE_SOLO / STRIPE_PRICE_PRO / STRIPE_PRICE_AGENCY into env.
 */
import Stripe from "stripe";
import { PLANS } from "../src/lib/plans";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("STRIPE_SECRET_KEY is required.");
  process.exit(1);
}
const stripe = new Stripe(key, { appInfo: { name: "AdCrewOS bootstrap" } });

async function findProduct(adcrewosKey: string): Promise<Stripe.Product | null> {
  const res = await stripe.products.search({
    query: `metadata['adcrewos_key']:'${adcrewosKey}'`,
    limit: 1,
  });
  return res.data[0] ?? null;
}

async function ensureProduct(
  adcrewosKey: string,
  name: string,
  description: string,
): Promise<Stripe.Product> {
  const existing = await findProduct(adcrewosKey);
  if (existing) {
    console.log(`✓ product ${adcrewosKey} exists: ${existing.id}`);
    return existing;
  }
  const product = await stripe.products.create({
    name,
    description,
    metadata: { adcrewos_key: adcrewosKey },
  });
  console.log(`+ created product ${adcrewosKey}: ${product.id}`);
  return product;
}

async function ensurePrice(
  product: Stripe.Product,
  unitAmount: number,
): Promise<Stripe.Price> {
  const prices = await stripe.prices.list({ product: product.id, active: true, limit: 100 });
  const match = prices.data.find(
    (p) =>
      p.unit_amount === unitAmount &&
      p.currency === "usd" &&
      p.recurring?.interval === "month",
  );
  if (match) {
    console.log(`✓ price for ${product.metadata.adcrewos_key} exists: ${match.id}`);
    return match;
  }
  // Deactivate any stale active monthly prices so Checkout uses the new amount.
  for (const stale of prices.data) {
    if (stale.recurring?.interval === "month" && stale.currency === "usd") {
      await stripe.prices.update(stale.id, { active: false });
      console.log(`- deactivated stale price for ${product.metadata.adcrewos_key}: ${stale.id}`);
    }
  }
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: unitAmount,
    currency: "usd",
    recurring: { interval: "month" },
    metadata: { adcrewos_key: product.metadata.adcrewos_key },
  });
  console.log(`+ created price for ${product.metadata.adcrewos_key}: ${price.id}`);
  return price;
}

async function main() {
  const soloProduct = await ensureProduct("solo", "AdCrewOS Solo", PLANS.SOLO.tagline);
  const proProduct = await ensureProduct("pro", "AdCrewOS Pro", PLANS.PRO.tagline);
  const agencyProduct = await ensureProduct("agency", "AdCrewOS Agency", PLANS.AGENCY.tagline);

  const soloPrice = await ensurePrice(soloProduct, PLANS.SOLO.priceCents);
  const proPrice = await ensurePrice(proProduct, PLANS.PRO.priceCents);
  const agencyPrice = await ensurePrice(agencyProduct, PLANS.AGENCY.priceCents);

  console.log("\n─── Add these to your environment ───");
  console.log(`STRIPE_PRICE_SOLO=${soloPrice.id}`);
  console.log(`STRIPE_PRICE_PRO=${proPrice.id}`);
  console.log(`STRIPE_PRICE_AGENCY=${agencyPrice.id}`);
  console.log("\n(Watchdog is free — no Stripe product needed.)");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
