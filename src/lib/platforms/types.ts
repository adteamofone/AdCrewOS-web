export type RawMetrics = {
  spend: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
};

export function deriveMetrics(
  spend: number,
  clicks: number,
  conversions: number,
  conversionValue: number,
): RawMetrics {
  const ctr = 0; // impressions not always fetched; left to caller if available
  const cpc = clicks > 0 ? spend / clicks : 0;
  const cpa = conversions > 0 ? spend / conversions : spend;
  const roas = spend > 0 ? conversionValue / spend : 0;
  return {
    spend: round2(spend),
    clicks: Math.round(clicks),
    conversions: round2(conversions),
    ctr: round2(ctr),
    cpc: round2(cpc),
    cpa: round2(cpa),
    roas: round2(roas),
  };
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
