import { describe, it, expect } from "vitest";
import { mapStatus } from "@/lib/billing";

describe("Stripe status mapping", () => {
  it("maps trial and active correctly", () => {
    expect(mapStatus("trialing")).toBe("TRIALING");
    expect(mapStatus("active")).toBe("ACTIVE");
  });
  it("maps failure/cancel states", () => {
    expect(mapStatus("past_due")).toBe("PAST_DUE");
    expect(mapStatus("canceled")).toBe("CANCELED");
    expect(mapStatus("unpaid")).toBe("UNPAID");
    expect(mapStatus("incomplete")).toBe("INCOMPLETE");
    expect(mapStatus("incomplete_expired")).toBe("INCOMPLETE");
  });
  it("falls back to PENDING for unknown", () => {
    expect(mapStatus("paused")).toBe("PENDING");
  });
});
