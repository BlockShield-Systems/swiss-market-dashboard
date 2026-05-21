/** @jest-environment node */
describe("POST /api/ai/market-summary", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("returns 403 when AI market summaries are disabled", async () => {
    jest.doMock("@/lib/flags", () => ({
      aiMarketSummaryEnabled: jest.fn(async () => false),
    }));

    jest.doMock("ai", () => ({
      generateText: jest.fn(),
    }));

    jest.doMock("@/lib/api/coingecko", () => ({
      fetchCoinDetails: jest.fn(),
    }));

    jest.doMock("@/lib/db/queries/market-insights", () => ({
      createMarketInsight: jest.fn(),
    }));

    jest.doMock("@/lib/rate-limit", () => ({
      getAiMarketSummaryRateLimit: jest.fn(),
    }));

    jest.doMock("@/lib/request-ip", () => ({
      getClientIdentifier: jest.fn(),
    }));

    jest.doMock("@/lib/redis", () => ({
      getRedis: jest.fn(),
    }));

    const { POST } = await import("@/app/api/ai/market-summary/route");

    const response = await POST(
      new Request("https://dashboard.ai-techart.com/api/ai/market-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coinId: "bitcoin",
          locale: "de",
        }),
      }),
    );

    await expect(response.json()).resolves.toEqual({
      error: "AI market summaries are disabled.",
    });

    expect(response.status).toBe(403);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("returns 400 for invalid request bodies when AI is enabled and gateway auth exists", async () => {
    process.env.AI_GATEWAY_API_KEY = "test-key";

    jest.doMock("@/lib/flags", () => ({
      aiMarketSummaryEnabled: jest.fn(async () => true),
    }));

    jest.doMock("ai", () => ({
      generateText: jest.fn(),
    }));

    jest.doMock("@/lib/api/coingecko", () => ({
      fetchCoinDetails: jest.fn(),
    }));

    jest.doMock("@/lib/db/queries/market-insights", () => ({
      createMarketInsight: jest.fn(),
    }));

    jest.doMock("@/lib/rate-limit", () => ({
      getAiMarketSummaryRateLimit: jest.fn(),
    }));

    jest.doMock("@/lib/request-ip", () => ({
      getClientIdentifier: jest.fn(),
    }));

    jest.doMock("@/lib/redis", () => ({
      getRedis: jest.fn(),
    }));

    const { POST } = await import("@/app/api/ai/market-summary/route");

    const response = await POST(
      new Request("https://dashboard.ai-techart.com/api/ai/market-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coinId: "",
          locale: "invalid-locale",
        }),
      }),
    );

    const body = await response.json();

    expect(response.status).toBe(400);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(body.error).toBe("Invalid request body.");
    expect(body.issues).toBeDefined();

    delete process.env.AI_GATEWAY_API_KEY;
  });
});
