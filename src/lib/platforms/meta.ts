import type { AdAccount } from "@prisma/client";
import { decrypt } from "@/lib/crypto";
import { NotConnectedError } from "@/lib/platforms/router";
import { deriveMetrics, round2, type RawMetrics } from "@/lib/platforms/types";

/**
 * Meta Marketing API client (Graph API).
 * Scopes: ads_read (read), ads_management (pause/scale). ads_management writes
 * require Meta App Review before they work on live accounts.
 * Verify current API version + scope names against live docs before shipping.
 */
const GRAPH = "https://graph.facebook.com/v21.0";

function token(account: AdAccount): string {
  const t = decrypt(account.accessToken);
  if (!t) throw new NotConnectedError("Meta");
  return t;
}

function actId(account: AdAccount): string {
  return account.externalId.startsWith("act_") ? account.externalId : `act_${account.externalId}`;
}

export async function metaFetchMetrics(account: AdAccount): Promise<RawMetrics> {
  const t = token(account);
  const params = new URLSearchParams({
    fields: "spend,clicks,ctr,cpc,actions,action_values",
    date_preset: "today",
    access_token: t,
  });
  const res = await fetch(`${GRAPH}/${actId(account)}/insights?${params}`);
  if (!res.ok) throw new Error(`Meta insights ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { data?: MetaInsight[] };
  const row = json.data?.[0];
  const spend = Number(row?.spend ?? 0);
  const clicks = Number(row?.clicks ?? 0);
  const conversions = sumActions(row?.actions, ["purchase", "offsite_conversion.fb_pixel_purchase"]);
  const value = sumActions(row?.action_values, ["purchase", "offsite_conversion.fb_pixel_purchase"]);
  const m = deriveMetrics(spend, clicks, conversions, value);
  return { ...m, ctr: round2(Number(row?.ctr ?? m.ctr)) };
}

export async function metaPauseCampaigns(account: AdAccount): Promise<void> {
  const t = token(account);
  const list = await fetch(
    `${GRAPH}/${actId(account)}/campaigns?fields=id,status&effective_status=["ACTIVE"]&access_token=${t}`,
  );
  if (!list.ok) throw new Error(`Meta campaigns ${list.status}`);
  const { data } = (await list.json()) as { data: { id: string }[] };
  for (const c of data ?? []) {
    await fetch(`${GRAPH}/${c.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PAUSED", access_token: t }),
    });
  }
}

export async function metaScaleBudgets(account: AdAccount, pct: number): Promise<void> {
  const t = token(account);
  const list = await fetch(
    `${GRAPH}/${actId(account)}/adsets?fields=id,daily_budget&access_token=${t}`,
  );
  if (!list.ok) throw new Error(`Meta adsets ${list.status}`);
  const { data } = (await list.json()) as { data: { id: string; daily_budget?: string }[] };
  for (const s of data ?? []) {
    if (!s.daily_budget) continue;
    const next = Math.round(Number(s.daily_budget) * (1 + pct / 100));
    await fetch(`${GRAPH}/${s.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ daily_budget: next, access_token: t }),
    });
  }
}

type MetaInsight = {
  spend?: string;
  clicks?: string;
  ctr?: string;
  cpc?: string;
  actions?: { action_type: string; value: string }[];
  action_values?: { action_type: string; value: string }[];
};

function sumActions(
  actions: { action_type: string; value: string }[] | undefined,
  types: string[],
): number {
  if (!actions) return 0;
  return actions
    .filter((a) => types.includes(a.action_type))
    .reduce((s, a) => s + Number(a.value || 0), 0);
}
