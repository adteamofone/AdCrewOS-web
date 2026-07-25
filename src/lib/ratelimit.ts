import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { getRedis } from "@/lib/redis";

/**
 * Sliding-window rate limiting for public/auth endpoints.
 * Backed by Upstash when configured; in-memory fallback otherwise so local
 * dev still enforces limits within a single process.
 */

const limiters = new Map<string, Ratelimit>();
const memory = new Map<string, { count: number; reset: number }>();

function clientKey(req: Request, bucket: string): string {
  const fwd = req.headers.get("x-forwarded-for") || "";
  const ip = fwd.split(",")[0]?.trim() || "local";
  return `rl:${bucket}:${ip}`;
}

function getLimiter(bucket: string, perMinute: number): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;
  const key = `${bucket}:${perMinute}`;
  let l = limiters.get(key);
  if (!l) {
    l = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(perMinute, "60 s"),
      prefix: "adcrewos",
    });
    limiters.set(key, l);
  }
  return l;
}

/** Returns a 429 NextResponse when the caller is over budget, else null. */
export async function rateLimit(
  req: Request,
  bucket: string,
  perMinute = 30,
): Promise<NextResponse | null> {
  const key = clientKey(req, bucket);
  const limiter = getLimiter(bucket, perMinute);

  if (limiter) {
    const { success } = await limiter.limit(key);
    if (!success) return tooMany();
    return null;
  }

  // In-memory fallback (single process).
  const now = Date.now();
  const rec = memory.get(key);
  if (!rec || rec.reset < now) {
    memory.set(key, { count: 1, reset: now + 60_000 });
    return null;
  }
  rec.count += 1;
  if (rec.count > perMinute) return tooMany();
  return null;
}

function tooMany(): NextResponse {
  return NextResponse.json(
    { error: "Too many requests. Slow down." },
    { status: 429, headers: { "Retry-After": "60" } },
  );
}
