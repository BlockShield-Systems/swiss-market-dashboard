/** @jest-environment node */
describe("public API validation safeguards", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("returns 400 for invalid weather city keys", async () => {
    const { GET } = await import("@/app/api/weather/route");

    const response = await GET(
      new Request("https://dashboard.ai-techart.com/api/weather?key=unknown-city"),
    );

    await expect(response.json()).resolves.toEqual({
      error: "Invalid city key",
    });

    expect(response.status).toBe(400);
    expect(response.headers.get("X-API-Route")).toBe("weather-forecast");
    expect(response.headers.get("X-Data-Source")).toBe("open-meteo");
    expect(response.headers.get("X-Cache")).toBe("MISS");
    expect(response.headers.get("X-Cache-TTL")).toBe("1800");
    expect(response.headers.get("X-Cache-Scope")).toBe("shared-data-service");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("returns 400 for missing crypto market-chart coin IDs", async () => {
    const { GET } = await import("@/app/api/crypto/[id]/market-chart/route");

    const response = await GET(
      new Request("https://dashboard.ai-techart.com/api/crypto/%20/market-chart"),
      {
        params: Promise.resolve({
          id: " ",
        }),
      },
    );

    await expect(response.json()).resolves.toEqual({
      error: "Missing coin id.",
    });

    expect(response.status).toBe(400);
    expect(response.headers.get("X-API-Route")).toBe("crypto-market-chart");
    expect(response.headers.get("X-Data-Source")).toBe("coingecko");
    expect(response.headers.get("X-Cache")).toBe("MISS");
    expect(response.headers.get("X-Cache-TTL")).toBe("300");
    expect(response.headers.get("X-Cache-Scope")).toBe("shared-data-service");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("returns 400 for missing crypto OHLC coin IDs", async () => {
    const { GET } = await import("@/app/api/crypto/[id]/ohlc/route");

    const response = await GET(
      new Request("https://dashboard.ai-techart.com/api/crypto/%20/ohlc"),
      {
        params: Promise.resolve({
          id: " ",
        }),
      },
    );

    await expect(response.json()).resolves.toEqual({
      error: "Missing coin id.",
    });

    expect(response.status).toBe(400);
    expect(response.headers.get("X-API-Route")).toBe("crypto-ohlc-chart");
    expect(response.headers.get("X-Data-Source")).toBe("coingecko");
    expect(response.headers.get("X-Cache")).toBe("MISS");
    expect(response.headers.get("X-Cache-TTL")).toBe("300");
    expect(response.headers.get("X-Cache-Scope")).toBe("shared-data-service");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
});
