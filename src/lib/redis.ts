import { Redis } from "@upstash/redis";

/**
 * Upstash Redis wrapper. Provides caching + a per-account run lock/dedupe.
 * Degrades gracefully when Upstash env is absent (local/demo): locks always
 * acquire (single-runner assumption) so the engine still functions.
 */

let client: Redis | null = null;

export function getRedis(): Redis | null {
  if (client) return client;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  client = new Redis({ url, token });
  return client;
}

/**
 * Acquire a lock for `key` for `ttlSeconds`. Returns true if acquired.
 * When Redis is unavailable, returns true (no distributed contention locally).
 */
export async function acquireLock(
  key: string,
  ttlSeconds = 300,
): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return true;
  const res = await redis.set(`lock:${key}`, Date.now(), {
    nx: true,
    ex: ttlSeconds,
  });
  return res === "OK";
}

export async function releaseLock(key: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.del(`lock:${key}`);
}
