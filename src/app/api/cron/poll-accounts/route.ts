import { NextResponse } from "next/server";
import { pollAllAccounts } from "@/lib/poller";

/**
 * Triggered by Vercel Cron (see vercel.json). Authorized via CRON_SECRET
 * bearer token (Vercel Cron sends `Authorization: Bearer $CRON_SECRET`).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const started = Date.now();
  const result = await pollAllAccounts();
  return NextResponse.json({ ...result, ms: Date.now() - started });
}
