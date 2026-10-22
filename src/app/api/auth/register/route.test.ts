import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  create: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: mocks.findUnique,
      create: mocks.create,
    },
  },
}));

import { POST } from "./route";

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    mocks.findUnique.mockReset();
    mocks.create.mockReset();
  });

  it("returns a service-unavailable error when the database cannot be reached", async () => {
    mocks.findUnique.mockRejectedValue(new Error("database unavailable"));

    const response = await POST(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: "new-user@example.com",
          password: "Testing123!",
          tier: "WATCHDOG",
        }),
      }),
    );

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: "Account service is temporarily unavailable. Please try again.",
    });
  });
});
