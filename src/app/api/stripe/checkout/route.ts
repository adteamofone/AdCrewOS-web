import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession } from "@/lib/billing";
import { isStripeConfigured } from "@/lib/stripe";
import { rateLimit } from "@/lib/ratelimit";
import { Tier } from "@prisma/client";

const schema = z.object({ tier: z.enum(["SOLO", "AGENCY"]).optional() });

export async function POST(req: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Billing is not configured." }, { status: 503 });
  }

  const limited = await rateLimit(req, "checkout", 10);
  if (limited) return limited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  const requestedTier = parsed.success ? parsed.data.tier : undefined;

  const sub = await prisma.subscription.findUnique({ where: { userId: session.user.id } });
  const tier: Tier = requestedTier ?? sub?.tier ?? "SOLO";

  try {
    const url = await createCheckoutSession(session.user.id, tier);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("checkout error", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed" },
      { status: 500 },
    );
  }
}
