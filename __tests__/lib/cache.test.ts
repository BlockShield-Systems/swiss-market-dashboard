/** @jest-environment node */

async function importCacheWithRedis(redisClient: unknown) {
  jest.resetModules();

  jest.doMock("@/lib/redis", () => ({
    getRedis: jest.fn(() => redisClient),
  }));

  return import("@/lib/cache");
}

async function importCacheWithFailingRedis(error: Error) {
  jest.resetModules();

  jest.doMock("@/lib/redis", () => ({
    getRedis: jest.fn(() => {
      throw error;
    }),
  }));

  return import("@/lib/cache");
}

describe("cache header utilities", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("creates full standardized cache headers", async () => {
    const { createCacheHeaders } = await import("@/lib/cache");

    const headers = createCacheHeaders({
      cacheStatus: "HIT",
      ttlSeconds: 300,
      dataSource: "coingecko",
      cacheScope: "shared-data-service",
      apiRoute: "crypto-market-chart",
    });

    expect(headers.get("X-Cache")).toBe("HIT");
    expect(headers.get("X-Cache-TTL")).toBe("300");
    expect(headers.get("X-Data-Source")).toBe("coingecko");
    expect(headers.get("X-Cache-Scope")).toBe("shared-data-service");
    expect(headers.get("X-API-Route")).toBe("crypto-market-chart");
    expect(headers.get("Cache-Control")).toBe("no-store");
  });

  it("creates minimal cache headers when optional metadata is omitted", async () => {
    const { createCacheHeaders } = await import("@/lib/cache");

    const headers = createCacheHeaders({
      cacheStatus: "MISS",
    });

    expect(headers.get("X-Cache")).toBe("MISS");
    expect(headers.get("Cache-Control")).toBe("no-store");
    expect(headers.get("X-Cache-TTL")).toBeNull();
    expect(headers.get("X-Data-Source")).toBeNull();
    expect(headers.get("X-Cache-Scope")).toBeNull();
    expect(headers.get("X-API-Route")).toBeNull();
  });

  it("keeps zero TTL as an explicit header value", async () => {
    const { createCacheHeaders } = await import("@/lib/cache");

    const headers = createCacheHeaders({
      cacheStatus: "SKIP",
      ttlSeconds: 0,
    });

    expect(headers.get("X-Cache")).toBe("SKIP");
    expect(headers.get("X-Cache-TTL")).toBe("0");
    expect(headers.get("Cache-Control")).toBe("no-store");
  });

  it("merges headers and lets later sources override earlier values", async () => {
    const { mergeHeaders } = await import("@/lib/cache");

    const first = new Headers({
      "X-Cache": "MISS",
      "X-Data-Source": "coingecko",
      "Cache-Control": "no-store",
    });

    const second = new Headers({
      "X-Cache": "HIT",
      "X-API-Route": "crypto-global",
    });

    const merged = mergeHeaders(first, undefined, second);

    expect(merged.get("X-Cache")).toBe("HIT");
    expect(merged.get("X-Data-Source")).toBe("coingecko");
    expect(merged.get("X-API-Route")).toBe("crypto-global");
    expect(merged.get("Cache-Control")).toBe("no-store");
  });
});

describe("Redis JSON cache helpers", () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetModules();
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it("returns HIT with cached data when Redis contains a value", async () => {
    const cachedData = {
      active_cryptocurrencies: 17394,
    };

    const redisClient = {
      get: jest.fn().mockResolvedValue(cachedData),
      set: jest.fn(),
    };

    const { getCachedJson } = await importCacheWithRedis(redisClient);

    await expect(getCachedJson("crypto:global")).resolves.toEqual({
      data: cachedData,
      status: "HIT",
    });

    expect(redisClient.get).toHaveBeenCalledWith("crypto:global");
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("returns MISS when Redis returns null", async () => {
    const redisClient = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn(),
    };

    const { getCachedJson } = await importCacheWithRedis(redisClient);

    await expect(getCachedJson("missing:key")).resolves.toEqual({
      data: null,
      status: "MISS",
    });

    expect(redisClient.get).toHaveBeenCalledWith("missing:key");
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("returns MISS when Redis returns undefined", async () => {
    const redisClient = {
      get: jest.fn().mockResolvedValue(undefined),
      set: jest.fn(),
    };

    const { getCachedJson } = await importCacheWithRedis(redisClient);

    await expect(getCachedJson("undefined:key")).resolves.toEqual({
      data: null,
      status: "MISS",
    });

    expect(redisClient.get).toHaveBeenCalledWith("undefined:key");
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("returns SKIP when Redis initialization fails", async () => {
    const error = new Error("Redis env missing");

    const { getCachedJson } = await importCacheWithFailingRedis(error);

    await expect(getCachedJson("crypto:global")).resolves.toEqual({
      data: null,
      status: "SKIP",
    });

    expect(warnSpy).toHaveBeenCalledWith("Redis cache read failed:", error);
  });

  it("returns SKIP when Redis read fails", async () => {
    const error = new Error("Redis read failed");

    const redisClient = {
      get: jest.fn().mockRejectedValue(error),
      set: jest.fn(),
    };

    const { getCachedJson } = await importCacheWithRedis(redisClient);

    await expect(getCachedJson("crypto:global")).resolves.toEqual({
      data: null,
      status: "SKIP",
    });

    expect(redisClient.get).toHaveBeenCalledWith("crypto:global");
    expect(warnSpy).toHaveBeenCalledWith("Redis cache read failed:", error);
  });

  it("writes JSON data to Redis with the configured TTL", async () => {
    const redisClient = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue("OK"),
    };

    const { setCachedJson } = await importCacheWithRedis(redisClient);

    const data = {
      total_market_cap_chf: 2098811272232.52,
    };

    await expect(
      setCachedJson({
        key: "crypto:global",
        data,
        ttlSeconds: 60,
      }),
    ).resolves.toBeUndefined();

    expect(redisClient.set).toHaveBeenCalledWith("crypto:global", data, {
      ex: 60,
    });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("swallows Redis write failures and logs a warning", async () => {
    const error = new Error("Redis write failed");

    const redisClient = {
      get: jest.fn(),
      set: jest.fn().mockRejectedValue(error),
    };

    const { setCachedJson } = await importCacheWithRedis(redisClient);

    await expect(
      setCachedJson({
        key: "crypto:global",
        data: {
          active_cryptocurrencies: 17394,
        },
        ttlSeconds: 60,
      }),
    ).resolves.toBeUndefined();

    expect(redisClient.set).toHaveBeenCalledWith(
      "crypto:global",
      {
        active_cryptocurrencies: 17394,
      },
      {
        ex: 60,
      },
    );
    expect(warnSpy).toHaveBeenCalledWith("Redis cache write failed:", error);
  });

  it("swallows Redis initialization failures during writes", async () => {
    const error = new Error("Redis env missing");

    const { setCachedJson } = await importCacheWithFailingRedis(error);

    await expect(
      setCachedJson({
        key: "crypto:global",
        data: {
          active_cryptocurrencies: 17394,
        },
        ttlSeconds: 60,
      }),
    ).resolves.toBeUndefined();

    expect(warnSpy).toHaveBeenCalledWith("Redis cache write failed:", error);
  });
});
