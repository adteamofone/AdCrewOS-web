import type { AdAccount } from "@prisma/client";

/**
 * Routes platform actions to the correct client. Real implementations for
 * Google Ads and Meta Marketing are wired in their respective modules and
 * activated once OAuth tokens + platform approval are in place.
 */

export class NotConnectedError extends Error {
  constructor(platform: string) {
    super(`${platform} account is not connected / not yet approved for write actions.`);
    this.name = "NotConnectedError";
  }
}

export async function fetchMetrics(account: AdAccount) {
  if (account.platform === "GOOGLE") {
    const { googleFetchMetrics } = await import("@/lib/platforms/google");
    return googleFetchMetrics(account);
  }
  const { metaFetchMetrics } = await import("@/lib/platforms/meta");
  return metaFetchMetrics(account);
}

export async function pauseCampaigns(account: AdAccount): Promise<void> {
  if (account.platform === "GOOGLE") {
    const { googlePauseCampaigns } = await import("@/lib/platforms/google");
    return googlePauseCampaigns(account);
  }
  const { metaPauseCampaigns } = await import("@/lib/platforms/meta");
  return metaPauseCampaigns(account);
}

export async function scaleBudgets(account: AdAccount, pct: number): Promise<void> {
  if (account.platform === "GOOGLE") {
    const { googleScaleBudgets } = await import("@/lib/platforms/google");
    return googleScaleBudgets(account, pct);
  }
  const { metaScaleBudgets } = await import("@/lib/platforms/meta");
  return metaScaleBudgets(account, pct);
}
