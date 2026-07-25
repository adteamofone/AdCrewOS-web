import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createPortalSession } from "@/lib/billing";
import { isStripeConfigured } from "@/lib/stripe";

export async function POST() {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Billing is not configured." }, { status: 503 });
  }
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const url = await createPortalSession(session.user.id);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("portal error", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Portal failed" },
      { status: 500 },
    );
  }
}
