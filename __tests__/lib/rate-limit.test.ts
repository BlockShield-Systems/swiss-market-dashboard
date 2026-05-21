function createRatelimitMock() {
  const slidingWindow = jest.fn((limit: number, window: string) => ({
    limit,
    window,
  }));

  const RatelimitMock = jest.fn(function Ratelimit(config: unknown) {
    return {
      config,
    };
  });

  Object.assign(RatelimitMock, {
    slidingWindow,
  });

  return {
    RatelimitMock,
    slidingWindow,
  };
}

describe("rate-limit helpers", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("creates and memoizes the AI market summary rate limiter", async () => {
    const redisClient = { name: "redis-client" };
    const { RatelimitMock, slidingWindow } = createRatelimitMock();

    jest.doMock("@upstash/ratelimit", () => ({
      Ratelimit: RatelimitMock,
    }));

    jest.doMock("@/lib/redis", () => ({
      getRedis: jest.fn(() => redisClient),
    }));

    const { getAiMarketSummaryRateLimit } = await import("@/lib/rate-limit");

    const first = getAiMarketSummaryRateLimit();
    const second = getAiMarketSummaryRateLimit();

    expect(first).toBe(second);
    expect(slidingWindow).toHaveBeenCalledTimes(1);
    expect(slidingWindow).toHaveBeenCalledWith(5, "10 m");
    expect(RatelimitMock).toHaveBeenCalledTimes(1);
    expect(RatelimitMock).toHaveBeenCalledWith({
      redis: redisClient,
      limiter: {
        limit: 5,
        window: "10 m",
      },
      analytics: true,
      prefix: "ratelimit:ai-market-summary",
    });
  });

  it("creates and memoizes public and market-data API rate limiters", async () => {
    const redisClient = { name: "redis-client" };
    const { RatelimitMock, slidingWindow } = createRatelimitMock();

    jest.doMock("@upstash/ratelimit", () => ({
      Ratelimit: RatelimitMock,
    }));

    jest.doMock("@/lib/redis", () => ({
      getRedis: jest.fn(() => redisClient),
    }));

    const { getPublicApiRateLimit, getMarketDataRateLimit } = await import(
      "@/lib/public-api-rate-limit"
    );

    const publicFirst = getPublicApiRateLimit();
    const publicSecond = getPublicApiRateLimit();
    const marketFirst = getMarketDataRateLimit();
    const marketSecond = getMarketDataRateLimit();

    expect(publicFirst).toBe(publicSecond);
    expect(marketFirst).toBe(marketSecond);

    expect(slidingWindow).toHaveBeenCalledTimes(2);
    expect(slidingWindow).toHaveBeenNthCalledWith(1, 120, "1 m");
    expect(slidingWindow).toHaveBeenNthCalledWith(2, 60, "1 m");

    expect(RatelimitMock).toHaveBeenCalledTimes(2);
    expect(RatelimitMock).toHaveBeenNthCalledWith(1, {
      redis: redisClient,
      limiter: {
        limit: 120,
        window: "1 m",
      },
      analytics: true,
      prefix: "ratelimit:public-api",
    });
    expect(RatelimitMock).toHaveBeenNthCalledWith(2, {
      redis: redisClient,
      limiter: {
        limit: 60,
        window: "1 m",
      },
      analytics: true,
      prefix: "ratelimit:market-data-api",
    });
  });

  it("creates standardized rate-limit headers", async () => {
    const { createRateLimitHeaders } = await import("@/lib/public-api-rate-limit");

    const headers = createRateLimitHeaders(
      {
        limit: 60,
        remaining: 42,
        reset: 1779360000000,
      },
      {
        policy: "market-data-api",
        window: "1m",
      },
    );

    expect(headers.get("X-RateLimit-Limit")).toBe("60");
    expect(headers.get("X-RateLimit-Remaining")).toBe("42");
    expect(headers.get("X-RateLimit-Reset")).toBe("1779360000000");
    expect(headers.get("X-RateLimit-Policy")).toBe("market-data-api");
    expect(headers.get("X-RateLimit-Window")).toBe("1m");
  });
});
