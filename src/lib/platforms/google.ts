import type { AdAccount } from "@prisma/client";
import { decrypt } from "@/lib/crypto";
import { NotConnectedError } from "@/lib/platforms/router";
import { deriveMetrics, round2, type RawMetrics } from "@/lib/platforms/types";

/**
 * Google Ads API client (REST).
 * Scope: https://www.googleapis.com/auth/adwords
 * Requires a developer token (server-only) and, for MCC-managed accounts, the
 * login-customer-id header. Access tokens are short-lived; refresh via the
 * refresh token before calling. Production API access + app verification are
 * external gates. Verify the current API version against live docs before shipping.
 */
const API_VERSION = "v18";
const BASE = `https://googleads.googleapis.com/${API_VERSION}`;

async function accessToken(account: AdAccount): Promise<string> {
  const refresh = decrypt(account.refreshToken);
  const existing = decrypt(account.accessToken);
  if (!refresh && !existing) throw new NotConnectedError("Google Ads");
  if (existing && account.tokenExpiry && account.tokenExpiry.getTime() > Date.now() + 60_000) {
    return existing;
  }
  if (!refresh) return existing as string;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET ?? "",
      grant_type: "refresh_token",
      refresh_token: refresh,
    }),
  });
  if (!res.ok) throw new Error(`Google token refresh ${res.status}`);
  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

function headers(token: string): Record<string, string> {
  const h: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "developer-token": process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? "",
    "Content-Type": "application/json",
  };
  if (process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID) {
    h["login-customer-id"] = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID.replace(/-/g, "");
  }
  return h;
}

function cid(account: AdAccount): string {
  return account.externalId.replace(/-/g, "");
}

export async function googleFetchMetrics(account: AdAccount): Promise<RawMetrics> {
  const token = await accessToken(account);
  const query = `
    SELECT metrics.cost_micros, metrics.clicks, metrics.impressions,
           metrics.conversions, metrics.conversions_value
    FROM customer WHERE segments.date DURING TODAY`;
  const res = await fetch(`${BASE}/customers/${cid(account)}/googleAds:search`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`Google Ads search ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { results?: GoogleRow[] };
  const agg = (json.results ?? []).reduce(
    (acc, r) => {
      const m = r.metrics ?? {};
      acc.spend += Number(m.costMicros ?? 0) / 1_000_000;
      acc.clicks += Number(m.clicks ?? 0);
      acc.impressions += Number(m.impressions ?? 0);
      acc.conversions += Number(m.conversions ?? 0);
      acc.value += Number(m.conversionsValue ?? 0);
      return acc;
    },
    { spend: 0, clicks: 0, impressions: 0, conversions: 0, value: 0 },
  );
  const m = deriveMetrics(agg.spend, agg.clicks, agg.conversions, agg.value);
  const ctr = agg.impressions > 0 ? (agg.clicks / agg.impressions) * 100 : 0;
  return { ...m, ctr: round2(ctr) };
}

export async function googlePauseCampaigns(account: AdAccount): Promise<void> {
  const token = await accessToken(account);
  // Find enabled campaigns.
  const search = await fetch(`${BASE}/customers/${cid(account)}/googleAds:search`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({
      query: `SELECT campaign.resource_name FROM campaign WHERE campaign.status = 'ENABLED'`,
    }),
  });
  if (!search.ok) throw new Error(`Google Ads search ${search.status}`);
  const json = (await search.json()) as { results?: { campaign?: { resourceName?: string } }[] };
  const operations = (json.results ?? [])
    .map((r) => r.campaign?.resourceName)
    .filter(Boolean)
    .map((rn) => ({ update: { resourceName: rn, status: "PAUSED" }, updateMask: "status" }));
  if (operations.length === 0) return;
  const res = await fetch(`${BASE}/customers/${cid(account)}/campaigns:mutate`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({ operations }),
  });
  if (!res.ok) throw new Error(`Google Ads mutate ${res.status}`);
}

export async function googleScaleBudgets(account: AdAccount, pct: number): Promise<void> {
  const token = await accessToken(account);
  const search = await fetch(`${BASE}/customers/${cid(account)}/googleAds:search`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({
      query: `SELECT campaign_budget.resource_name, campaign_budget.amount_micros
              FROM campaign_budget WHERE campaign.status = 'ENABLED'`,
    }),
  });
  if (!search.ok) throw new Error(`Google Ads search ${search.status}`);
  const json = (await search.json()) as {
    results?: { campaignBudget?: { resourceName?: string; amountMicros?: string } }[];
  };
  const operations = (json.results ?? [])
    .map((r) => r.campaignBudget)
    .filter((b): b is { resourceName: string; amountMicros: string } => Boolean(b?.resourceName))
    .map((b) => ({
      update: {
        resourceName: b.resourceName,
        amountMicros: Math.round(Number(b.amountMicros) * (1 + pct / 100)),
      },
      updateMask: "amount_micros",
    }));
  if (operations.length === 0) return;
  const res = await fetch(`${BASE}/customers/${cid(account)}/campaignBudgets:mutate`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({ operations }),
  });
  if (!res.ok) throw new Error(`Google Ads budget mutate ${res.status}`);
}

type GoogleRow = {
  metrics?: {
    costMicros?: string;
    clicks?: string;
    impressions?: string;
    conversions?: number;
    conversionsValue?: number;
  };
};
