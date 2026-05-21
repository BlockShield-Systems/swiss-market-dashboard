/** @jest-environment node */

export {};

type CacheStatus = "HIT" | "MISS" | "SKIP";

type CacheResult<T> = {
  data: T | null;
  status: CacheStatus;
};

type CachedDataResult<T> = {
  data: T;
  cacheStatus: CacheStatus;
  cacheTtlSeconds: number;
};

type CryptoGlobalData = {
  active_cryptocurrencies: number;
  market_cap_percentage: Record<string, number>;
  total_market_cap_chf: number;
  total_volume_chf: number;
};

type MarketChartPoint = {
  timestamp: number;
  date: string;
  price: number;
  marketCap: number | null;
  volume: number | null;
};

type OhlcPoint = {
  timestamp: number;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

type WeatherData = {
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    wind_speed_10m_max: number[];
  };
};

type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

type RateLimitHeaderOptions = {
  policy?: string;
  window?: string;
};

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const cryptoGlobalData: CryptoGlobalData = {
  active_cryptocurrencies: 12000,
  market_cap_percentage: {
    btc: 54.3,
    eth: 17.2,
  },
  total_market_cap_chf: 2_500_000_000_000,
  total_volume_chf: 90_000_000_000,
};

const weatherData: WeatherData = {
  daily: {
    time: ["2026-05-21"],
    weather_code: [1],
    temperature_2m_max: [22.5],
    temperature_2m_min: [12.4],
    precipitation_sum: [0],
    wind_speed_10m_max: [15],
  },
};

const marketChartData: MarketChartPoint[] = [
  {
    timestamp: 1700000000000,
    date: new Date(1700000000000).toISOString(),
    price: 42000,
    marketCap: 800000000,
    volume: 50000000,
  },
];

const ohlcData: OhlcPoint[] = [
  {
    timestamp: 1700000000000,
    date: new Date(1700000000000).toISOString(),
    open: 41000,
    high: 43000,
    low: 40000,
    close: 42000,
  },
];

const mockReadCachedCryptoGlobalData = jest.fn() as jest.MockedFunction<
  () => Promise<CacheResult<CryptoGlobalData>>
>;

const mockFetchAndCacheCryptoGlobalData = jest.fn() as jest.MockedFunction<
  (cacheStatus?: CacheStatus) => Promise<CachedDataResult<CryptoGlobalData>>
>;

const mockReadCachedWeatherForecast = jest.fn() as jest.MockedFunction<
  (cityKey: string) => Promise<CacheResult<WeatherData>>
>;

const mockFetchAndCacheWeatherForecast = jest.fn() as jest.MockedFunction<
  (city: unknown, cacheStatus?: CacheStatus) => Promise<CachedDataResult<WeatherData>>
>;

const mockReadCachedCoinMarketChart = jest.fn() as jest.MockedFunction<
  (coinId: string, days: 7 | 30 | 90) => Promise<CacheResult<MarketChartPoint[]>>
>;

const mockFetchAndCacheCoinMarketChart = jest.fn() as jest.MockedFunction<
  (
    coinId: string,
    days: 7 | 30 | 90,
    cacheStatus?: CacheStatus,
  ) => Promise<CachedDataResult<MarketChartPoint[]>>
>;

const mockReadCachedCoinOhlcChart = jest.fn() as jest.MockedFunction<
  (coinId: string, days: 7 | 30 | 90) => Promise<CacheResult<OhlcPoint[]>>
>;

const mockFetchAndCacheCoinOhlcChart = jest.fn() as jest.MockedFunction<
  (
    coinId: string,
    days: 7 | 30 | 90,
    cacheStatus?: CacheStatus,
  ) => Promise<CachedDataResult<OhlcPoint[]>>
>;

const mockPublicApiLimit = jest.fn() as jest.MockedFunction<
  (identifier: string) => Promise<RateLimitResult>
>;

const mockMarketDataLimit = jest.fn() as jest.MockedFunction<
  (identifier: string) => Promise<RateLimitResult>
>;

function createRequest(path: string) {
  return new Request(`https://dashboard.ai-techart.com${path}`, {
    headers: {
      "x-forwarded-for": "203.0.113.10",
    },
  });
}

function createRouteContext(id: string): RouteContext {
  return {
    params: Promise.resolve({
      id,
    }),
  };
}

function createRateLimitResult(
  success: boolean,
  remaining: number,
): RateLimitResult {
  return {
    success,
    limit: 60,
    remaining,
    reset: 1_700_000_000,
  };
}

function createMockRateLimitHeaders(
  result: RateLimitResult,
  options: RateLimitHeaderOptions = {},
) {
  const headers = new Headers();

  headers.set("X-RateLimit-Limit", String(result.limit));
  headers.set("X-RateLimit-Remaining", String(result.remaining));
  headers.set("X-RateLimit-Reset", String(result.reset));

  if (options.policy) {
    headers.set("X-RateLimit-Policy", options.policy);
  }

  if (options.window) {
    headers.set("X-RateLimit-Window", options.window);
  }

  return headers;
}

function expectCacheHeaders(
  response: Response,
  expected: {
    apiRoute: string;
    dataSource: string;
    cacheStatus: CacheStatus;
    ttl: string;
  },
) {
  expect(response.headers.get("X-API-Route")).toBe(expected.apiRoute);
  expect(response.headers.get("X-Data-Source")).toBe(expected.dataSource);
  expect(response.headers.get("X-Cache")).toBe(expected.cacheStatus);
  expect(response.headers.get("X-Cache-TTL")).toBe(expected.ttl);
  expect(response.headers.get("X-Cache-Scope")).toBe("shared-data-service");
  expect(response.headers.get("Cache-Control")).toBe("no-store");
}

function expectRateLimitHeaders(
  response: Response,
  expected: {
    policy: string;
    remaining: string;
  },
) {
  expect(response.headers.get("X-RateLimit-Limit")).toBe("60");
  expect(response.headers.get("X-RateLimit-Remaining")).toBe(expected.remaining);
  expect(response.headers.get("X-RateLimit-Reset")).toBe("1700000000");
  expect(response.headers.get("X-RateLimit-Policy")).toBe(expected.policy);
  expect(response.headers.get("X-RateLimit-Window")).toBe("1m");
}

function mockRouteDependencies() {
  jest.doMock("@/lib/request-ip", () => ({
    __esModule: true,
    getClientIdentifier: jest.fn(() => "test-client"),
  }));

  jest.doMock("@/lib/public-api-rate-limit", () => ({
    __esModule: true,
    createRateLimitHeaders: createMockRateLimitHeaders,
    getPublicApiRateLimit: jest.fn(() => ({
      limit: mockPublicApiLimit,
    })),
    getMarketDataRateLimit: jest.fn(() => ({
      limit: mockMarketDataLimit,
    })),
  }));

  jest.doMock("@/lib/data/crypto-global", () => ({
    __esModule: true,
    CRYPTO_GLOBAL_CACHE_TTL_SECONDS: 60,
    readCachedCryptoGlobalData: mockReadCachedCryptoGlobalData,
    fetchAndCacheCryptoGlobalData: mockFetchAndCacheCryptoGlobalData,
  }));

  jest.doMock("@/lib/data/weather-forecast", () => ({
    __esModule: true,
    WEATHER_FORECAST_CACHE_TTL_SECONDS: 1800,
    readCachedWeatherForecast: mockReadCachedWeatherForecast,
    fetchAndCacheWeatherForecast: mockFetchAndCacheWeatherForecast,
  }));

  jest.doMock("@/lib/data/coin-market-chart", () => ({
    __esModule: true,
    COIN_MARKET_CHART_CACHE_TTL_SECONDS: 300,
    readCachedCoinMarketChart: mockReadCachedCoinMarketChart,
    fetchAndCacheCoinMarketChart: mockFetchAndCacheCoinMarketChart,
  }));

  jest.doMock("@/lib/data/coin-ohlc-chart", () => ({
    __esModule: true,
    COIN_OHLC_CHART_CACHE_TTL_SECONDS: 300,
    readCachedCoinOhlcChart: mockReadCachedCoinOhlcChart,
    fetchAndCacheCoinOhlcChart: mockFetchAndCacheCoinOhlcChart,
  }));
}

describe("public API runtime behavior", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mockRouteDependencies();

    jest.spyOn(console, "error").mockImplementation(() => undefined);
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("crypto global returns cached data without rate limiting on cache hit", async () => {
    mockReadCachedCryptoGlobalData.mockResolvedValueOnce({
      data: cryptoGlobalData,
      status: "HIT",
    });

    const { GET } = await import("@/app/api/crypto/global/route");

    const response = await GET(createRequest("/api/crypto/global"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(cryptoGlobalData);
    expectCacheHeaders(response, {
      apiRoute: "crypto-global",
      dataSource: "coingecko",
      cacheStatus: "HIT",
      ttl: "60",
    });
    expect(mockMarketDataLimit).not.toHaveBeenCalled();
    expect(mockFetchAndCacheCryptoGlobalData).not.toHaveBeenCalled();
  });

  test("crypto global returns 429 when market data rate limit is exceeded", async () => {
    mockReadCachedCryptoGlobalData.mockResolvedValueOnce({
      data: null,
      status: "MISS",
    });
    mockMarketDataLimit.mockResolvedValueOnce(createRateLimitResult(false, 0));

    const { GET } = await import("@/app/api/crypto/global/route");

    const response = await GET(createRequest("/api/crypto/global"));

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({
      error: "Too many market data requests. Please try again later.",
    });
    expectCacheHeaders(response, {
      apiRoute: "crypto-global",
      dataSource: "coingecko",
      cacheStatus: "MISS",
      ttl: "60",
    });
    expectRateLimitHeaders(response, {
      policy: "market-data-api",
      remaining: "0",
    });
    expect(mockFetchAndCacheCryptoGlobalData).not.toHaveBeenCalled();
  });

  test("crypto global returns 502 when upstream market data fetch fails", async () => {
    mockReadCachedCryptoGlobalData.mockResolvedValueOnce({
      data: null,
      status: "MISS",
    });
    mockMarketDataLimit.mockResolvedValueOnce(createRateLimitResult(true, 59));
    mockFetchAndCacheCryptoGlobalData.mockRejectedValueOnce(
      new Error("CoinGecko unavailable"),
    );

    const { GET } = await import("@/app/api/crypto/global/route");

    const response = await GET(createRequest("/api/crypto/global"));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: "Failed to fetch crypto market data.",
    });
    expectCacheHeaders(response, {
      apiRoute: "crypto-global",
      dataSource: "coingecko",
      cacheStatus: "MISS",
      ttl: "60",
    });
    expectRateLimitHeaders(response, {
      policy: "market-data-api",
      remaining: "59",
    });
  });

  test("weather returns cached data without rate limiting on cache hit", async () => {
    mockReadCachedWeatherForecast.mockResolvedValueOnce({
      data: weatherData,
      status: "HIT",
    });

    const { GET } = await import("@/app/api/weather/route");

    const response = await GET(createRequest("/api/weather?key=zurich"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(weatherData);
    expect(mockReadCachedWeatherForecast).toHaveBeenCalledWith("zurich");
    expectCacheHeaders(response, {
      apiRoute: "weather-forecast",
      dataSource: "open-meteo",
      cacheStatus: "HIT",
      ttl: "1800",
    });
    expect(mockPublicApiLimit).not.toHaveBeenCalled();
    expect(mockFetchAndCacheWeatherForecast).not.toHaveBeenCalled();
  });

  test("weather returns 429 when public API rate limit is exceeded", async () => {
    mockReadCachedWeatherForecast.mockResolvedValueOnce({
      data: null,
      status: "MISS",
    });
    mockPublicApiLimit.mockResolvedValueOnce(createRateLimitResult(false, 0));

    const { GET } = await import("@/app/api/weather/route");

    const response = await GET(createRequest("/api/weather?key=zurich"));

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({
      error: "Too many public API requests. Please try again later.",
    });
    expectCacheHeaders(response, {
      apiRoute: "weather-forecast",
      dataSource: "open-meteo",
      cacheStatus: "MISS",
      ttl: "1800",
    });
    expectRateLimitHeaders(response, {
      policy: "public-api",
      remaining: "0",
    });
    expect(mockFetchAndCacheWeatherForecast).not.toHaveBeenCalled();
  });

  test("weather returns 502 when forecast provider fails", async () => {
    mockReadCachedWeatherForecast.mockResolvedValueOnce({
      data: null,
      status: "MISS",
    });
    mockPublicApiLimit.mockResolvedValueOnce(createRateLimitResult(true, 59));
    mockFetchAndCacheWeatherForecast.mockRejectedValueOnce(
      new Error("Open-Meteo unavailable"),
    );

    const { GET } = await import("@/app/api/weather/route");

    const response = await GET(createRequest("/api/weather?key=zurich"));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: "Failed to fetch weather forecast",
    });
    expectCacheHeaders(response, {
      apiRoute: "weather-forecast",
      dataSource: "open-meteo",
      cacheStatus: "MISS",
      ttl: "1800",
    });
    expectRateLimitHeaders(response, {
      policy: "public-api",
      remaining: "59",
    });
  });

  test("market chart returns cached data for normalized coin ids and requested days", async () => {
    mockReadCachedCoinMarketChart.mockResolvedValueOnce({
      data: marketChartData,
      status: "HIT",
    });

    const { GET } = await import("@/app/api/crypto/[id]/market-chart/route");

    const response = await GET(
      createRequest("/api/crypto/bitcoin/market-chart?days=30"),
      createRouteContext(" BitCoin "),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(marketChartData);
    expect(mockReadCachedCoinMarketChart).toHaveBeenCalledWith("bitcoin", 30);
    expectCacheHeaders(response, {
      apiRoute: "crypto-market-chart",
      dataSource: "coingecko",
      cacheStatus: "HIT",
      ttl: "300",
    });
    expect(mockMarketDataLimit).not.toHaveBeenCalled();
    expect(mockFetchAndCacheCoinMarketChart).not.toHaveBeenCalled();
  });

  test("market chart returns 429 when market data rate limit is exceeded", async () => {
    mockReadCachedCoinMarketChart.mockResolvedValueOnce({
      data: null,
      status: "MISS",
    });
    mockMarketDataLimit.mockResolvedValueOnce(createRateLimitResult(false, 0));

    const { GET } = await import("@/app/api/crypto/[id]/market-chart/route");

    const response = await GET(
      createRequest("/api/crypto/bitcoin/market-chart?days=90"),
      createRouteContext("bitcoin"),
    );

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({
      error: "Too many market data requests. Please try again later.",
    });
    expectCacheHeaders(response, {
      apiRoute: "crypto-market-chart",
      dataSource: "coingecko",
      cacheStatus: "MISS",
      ttl: "300",
    });
    expectRateLimitHeaders(response, {
      policy: "market-data-api",
      remaining: "0",
    });
    expect(mockFetchAndCacheCoinMarketChart).not.toHaveBeenCalled();
  });

  test("market chart defaults invalid day values to seven days before fetching", async () => {
    mockReadCachedCoinMarketChart.mockResolvedValueOnce({
      data: null,
      status: "SKIP",
    });
    mockMarketDataLimit.mockResolvedValueOnce(createRateLimitResult(true, 59));
    mockFetchAndCacheCoinMarketChart.mockResolvedValueOnce({
      data: marketChartData,
      cacheStatus: "SKIP",
      cacheTtlSeconds: 300,
    });

    const { GET } = await import("@/app/api/crypto/[id]/market-chart/route");

    const response = await GET(
      createRequest("/api/crypto/bitcoin/market-chart?days=999"),
      createRouteContext("bitcoin"),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(marketChartData);
    expect(mockReadCachedCoinMarketChart).toHaveBeenCalledWith("bitcoin", 7);
    expect(mockFetchAndCacheCoinMarketChart).toHaveBeenCalledWith(
      "bitcoin",
      7,
      "SKIP",
    );
    expectCacheHeaders(response, {
      apiRoute: "crypto-market-chart",
      dataSource: "coingecko",
      cacheStatus: "SKIP",
      ttl: "300",
    });
  });

  test("market chart returns 502 when chart provider fails", async () => {
    mockReadCachedCoinMarketChart.mockResolvedValueOnce({
      data: null,
      status: "MISS",
    });
    mockMarketDataLimit.mockResolvedValueOnce(createRateLimitResult(true, 59));
    mockFetchAndCacheCoinMarketChart.mockRejectedValueOnce(
      new Error("Chart provider unavailable"),
    );

    const { GET } = await import("@/app/api/crypto/[id]/market-chart/route");

    const response = await GET(
      createRequest("/api/crypto/bitcoin/market-chart?days=7"),
      createRouteContext("bitcoin"),
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: "Coin market chart could not be loaded.",
    });
    expectCacheHeaders(response, {
      apiRoute: "crypto-market-chart",
      dataSource: "coingecko",
      cacheStatus: "MISS",
      ttl: "300",
    });
    expectRateLimitHeaders(response, {
      policy: "market-data-api",
      remaining: "59",
    });
  });

  test("OHLC returns cached data for normalized coin ids and requested days", async () => {
    mockReadCachedCoinOhlcChart.mockResolvedValueOnce({
      data: ohlcData,
      status: "HIT",
    });

    const { GET } = await import("@/app/api/crypto/[id]/ohlc/route");

    const response = await GET(
      createRequest("/api/crypto/bitcoin/ohlc?days=30"),
      createRouteContext(" BitCoin "),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(ohlcData);
    expect(mockReadCachedCoinOhlcChart).toHaveBeenCalledWith("bitcoin", 30);
    expectCacheHeaders(response, {
      apiRoute: "crypto-ohlc-chart",
      dataSource: "coingecko",
      cacheStatus: "HIT",
      ttl: "300",
    });
    expect(mockMarketDataLimit).not.toHaveBeenCalled();
    expect(mockFetchAndCacheCoinOhlcChart).not.toHaveBeenCalled();
  });

  test("OHLC returns 429 when market data rate limit is exceeded", async () => {
    mockReadCachedCoinOhlcChart.mockResolvedValueOnce({
      data: null,
      status: "MISS",
    });
    mockMarketDataLimit.mockResolvedValueOnce(createRateLimitResult(false, 0));

    const { GET } = await import("@/app/api/crypto/[id]/ohlc/route");

    const response = await GET(
      createRequest("/api/crypto/bitcoin/ohlc?days=90"),
      createRouteContext("bitcoin"),
    );

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({
      error: "Too many market data requests. Please try again later.",
    });
    expectCacheHeaders(response, {
      apiRoute: "crypto-ohlc-chart",
      dataSource: "coingecko",
      cacheStatus: "MISS",
      ttl: "300",
    });
    expectRateLimitHeaders(response, {
      policy: "market-data-api",
      remaining: "0",
    });
    expect(mockFetchAndCacheCoinOhlcChart).not.toHaveBeenCalled();
  });

  test("OHLC defaults invalid day values to seven days before fetching", async () => {
    mockReadCachedCoinOhlcChart.mockResolvedValueOnce({
      data: null,
      status: "SKIP",
    });
    mockMarketDataLimit.mockResolvedValueOnce(createRateLimitResult(true, 59));
    mockFetchAndCacheCoinOhlcChart.mockResolvedValueOnce({
      data: ohlcData,
      cacheStatus: "SKIP",
      cacheTtlSeconds: 300,
    });

    const { GET } = await import("@/app/api/crypto/[id]/ohlc/route");

    const response = await GET(
      createRequest("/api/crypto/bitcoin/ohlc?days=999"),
      createRouteContext("bitcoin"),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(ohlcData);
    expect(mockReadCachedCoinOhlcChart).toHaveBeenCalledWith("bitcoin", 7);
    expect(mockFetchAndCacheCoinOhlcChart).toHaveBeenCalledWith(
      "bitcoin",
      7,
      "SKIP",
    );
    expectCacheHeaders(response, {
      apiRoute: "crypto-ohlc-chart",
      dataSource: "coingecko",
      cacheStatus: "SKIP",
      ttl: "300",
    });
  });

  test("OHLC returns 502 when OHLC provider fails", async () => {
    mockReadCachedCoinOhlcChart.mockResolvedValueOnce({
      data: null,
      status: "MISS",
    });
    mockMarketDataLimit.mockResolvedValueOnce(createRateLimitResult(true, 59));
    mockFetchAndCacheCoinOhlcChart.mockRejectedValueOnce(
      new Error("OHLC provider unavailable"),
    );

    const { GET } = await import("@/app/api/crypto/[id]/ohlc/route");

    const response = await GET(
      createRequest("/api/crypto/bitcoin/ohlc?days=7"),
      createRouteContext("bitcoin"),
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: "Coin OHLC chart could not be loaded.",
    });
    expectCacheHeaders(response, {
      apiRoute: "crypto-ohlc-chart",
      dataSource: "coingecko",
      cacheStatus: "MISS",
      ttl: "300",
    });
    expectRateLimitHeaders(response, {
      policy: "market-data-api",
      remaining: "59",
    });
  });
});