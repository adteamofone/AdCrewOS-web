import { describe, it, expect } from "vitest";
import { evaluate, metricIsHigherBetter } from "@/lib/engine";
import type { MetricSnapshot, Target } from "@prisma/client";

function snap(partial: Partial<MetricSnapshot>): MetricSnapshot {
  return {
    id: "s1",
    adAccountId: "a1",
    ts: new Date(),
    spend: 100,
    clicks: 50,
    conversions: 3,
    ctr: 5,
    cpc: 2,
    cpa: 33,
    roas: 3,
    ...partial,
  } as MetricSnapshot;
}

function target(partial: Partial<Target>): Target {
  return {
    id: "t1",
    adAccountId: "a1",
    metric: "CPA",
    targetValue: 40,
    pauseThreshold: 75,
    scaleThreshold: 30,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...partial,
  } as Target;
}

describe("metric direction", () => {
  it("ROAS is higher-better, CPC/CPA lower-better", () => {
    expect(metricIsHigherBetter("ROAS")).toBe(true);
    expect(metricIsHigherBetter("CPA")).toBe(false);
    expect(metricIsHigherBetter("CPC")).toBe(false);
  });
});

describe("CPA (lower is better)", () => {
  const t = target({ metric: "CPA", pauseThreshold: 75, scaleThreshold: 30 });

  it("auto-pauses when CPA breaches above pause threshold", () => {
    const d = evaluate(t, snap({ cpa: 90 }));
    expect(d.action).toBe("pause");
  });

  it("proposes scale when CPA beats (drops below) scale threshold", () => {
    const d = evaluate(t, snap({ cpa: 25 }));
    expect(d.action).toBe("propose_scale");
    if (d.action === "propose_scale") expect(d.proposedPct).toBeGreaterThan(0);
  });

  it("does nothing in the healthy middle band", () => {
    const d = evaluate(t, snap({ cpa: 45 }));
    expect(d.action).toBe("none");
  });
});

describe("ROAS (higher is better)", () => {
  const t = target({ metric: "ROAS", pauseThreshold: 1.6, scaleThreshold: 4.2, targetValue: 3.2 });

  it("auto-pauses when ROAS falls below pause threshold", () => {
    const d = evaluate(t, snap({ roas: 1.2 }));
    expect(d.action).toBe("pause");
  });

  it("proposes scale when ROAS beats (exceeds) scale threshold", () => {
    const d = evaluate(t, snap({ roas: 4.8 }));
    expect(d.action).toBe("propose_scale");
  });

  it("does nothing in the healthy middle band", () => {
    const d = evaluate(t, snap({ roas: 3.1 }));
    expect(d.action).toBe("none");
  });
});
