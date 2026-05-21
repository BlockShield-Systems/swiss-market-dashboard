export {};

import type { SwissCity } from "@/lib/types/weather";

type CacheStatus = "HIT" | "MISS" | "SKIP";
type CryptoChartDays = 7 | 30 | 90;

type CacheResult<T> = {
  data: T | null;
  status: CacheStatus;
};

type CacheWriteInput<T> = {
  key: string;
  data: T;
  ttlSeconds: number;
};

type CryptoGlobalApiResponse = {
  data: {
    active_cryptocurrencies: number;
    market_cap_percentage: Record<string, number>;
    total_market_cap: Record<string, number>;
    total_volume: Record<string, number>;
  };
};

type CryptoGlobalData = {
  active_cryptocurrencies: number;
  market_cap_percentage: Record<string, number>;
  total_market_cap_chf: number;
  total_volume_chf: number;
};

type CryptoMarketChartPoint = {
  timestamp: number;
  date: string;
  price: number;
  marketCap: number | null;
  volume: number | null;
};

type CryptoOhlcPoint = {
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

const mockGetCachedJson = jest.fn() as jest.MockedFunction<
  <T>(key: string) => Promise<CacheResult<T>>
>;

const mockSetCachedJson = jest.fn() as jest.MockedFunction<
  <T>(input: CacheWriteInput<T>) => Promise<void>
>;

const mockFetchCryptoGlobalData = jest.fn() as jest.MockedFunction<
  () => Promise<CryptoGlobalApiResponse>
>;

const mockFetchCoinMarketChart = jest.fn() as jest.MockedFunction<
  (coinId: string, days: CryptoChartDays) => Promise<CryptoMarketChartPoint[]>
>;

const mockFetchCoinOhlcChart = jest.fn() as jest.MockedFunction<
  (coinId: string, days: CryptoChartDays) => Promise<CryptoOhlcPoint[]>
>;

const mockFetchWeatherForecast = jest.fn() as jest.MockedFunction<
  (city: SwissCity) => Promise<WeatherData>
>;

const marketChartPoints: CryptoMarketChartPoint[] = [
  {
    timestamp: 1700000000000,
    date: new Date(1700000000000).toISOString(),
    price: 42000,
    marketCap: 800000000,
    volume: 50000000,
  },
];

const ohlcPoints: CryptoOhlcPoint[] = [
  {
    timestamp: 1700000000000,
    date: new Date(1700000000000).toISOString(),
    open: 41000,
    high: 43000,
    low: 40000,
    close: 42000,
  },
];

const zurich: SwissCity = {
  key: "zurich",
  latitude: 47.3769,
  longitude: 8.5417,
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

const cryptoGlobalApiResponse: CryptoGlobalApiResponse = {
  data: {
    active_cryptocurrencies: 12000,
    market_cap_percentage: {
      btc: 54.3,
      eth: 17.2,
    },
    total_market_cap: {
      chf: 2_500_000_000_000,
      usd: 2_800_000_000_000,
    },
    total_volume: {
      chf: 90_000_000_000,
      usd: 100_000_000_000,
    },
  },
};

const cryptoGlobalPublicData: CryptoGlobalData = {
  active_cryptocurrencies: 12000,
  market_cap_percentage: {
    btc: 54.3,
    eth: 17.2,
  },
  total_market_cap_chf: 2_500_000_000_000,
  total_volume_chf: 90_000_000_000,
};

function mockDataLayerDependencies() {
  jest.doMock("@/lib/cache", () => ({
    __esModule: true,
    getCachedJson: mockGetCachedJson,
    setCachedJson: mockSetCachedJson,
  }));

  jest.doMock("@/lib/api/coingecko", () => ({
    __esModule: true,
    fetchCryptoGlobalData: mockFetchCryptoGlobalData,
    fetchCoinMarketChart: mockFetchCoinMarketChart,
    fetchCoinOhlcChart: mockFetchCoinOhlcChart,
  }));

  jest.doMock("@/lib/api/openmeteo", () => ({
    __esModule: true,
    fetchWeatherForecast: mockFetchWeatherForecast,
  }));
}

describe("crypto global cached data provider", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mockDataLayerDependencies();
  });

  test("readCachedCryptoGlobalData reads the stable public API cache key", async () => {
    mockGetCachedJson.mockResolvedValueOnce({
      data: cryptoGlobalPublicData,
      status: "HIT",
    });

    const { readCachedCryptoGlobalData } = await import("@/lib/data/crypto-global");

    await expect(readCachedCryptoGlobalData()).resolves.toEqual({
      data: cryptoGlobalPublicData,
      status: "HIT",
    });

    expect(mockGetCachedJson).toHaveBeenCalledWith("public-api:crypto:global:v1");
  });

  test("fetchAndCacheCryptoGlobalData transforms CoinGecko data and writes Redis cache", async () => {
    mockFetchCryptoGlobalData.mockResolvedValueOnce(cryptoGlobalApiResponse);
    mockSetCachedJson.mockResolvedValueOnce();

    const { fetchAndCacheCryptoGlobalData } = await import("@/lib/data/crypto-global");

    await expect(fetchAndCacheCryptoGlobalData("SKIP")).resolves.toEqual({
      data: cryptoGlobalPublicData,
      cacheStatus: "SKIP",
      cacheTtlSeconds: 60,
    });

    expect(mockFetchCryptoGlobalData).toHaveBeenCalledTimes(1);
    expect(mockSetCachedJson).toHaveBeenCalledWith({
      key: "public-api:crypto:global:v1",
      data: cryptoGlobalPublicData,
      ttlSeconds: 60,
    });
  });

  test("getCachedCryptoGlobalData returns cached data without refetching on cache hit", async () => {
    mockGetCachedJson.mockResolvedValueOnce({
      data: cryptoGlobalPublicData,
      status: "HIT",
    });

    const { getCachedCryptoGlobalData } = await import("@/lib/data/crypto-global");

    await expect(getCachedCryptoGlobalData()).resolves.toEqual({
      data: cryptoGlobalPublicData,
      cacheStatus: "HIT",
      cacheTtlSeconds: 60,
    });

    expect(mockFetchCryptoGlobalData).not.toHaveBeenCalled();
    expect(mockSetCachedJson).not.toHaveBeenCalled();
  });

  test("getCachedCryptoGlobalData fetches and caches on cache miss", async () => {
    mockGetCachedJson.mockResolvedValueOnce({
      data: null,
      status: "MISS",
    });
    mockFetchCryptoGlobalData.mockResolvedValueOnce(cryptoGlobalApiResponse);
    mockSetCachedJson.mockResolvedValueOnce();

    const { getCachedCryptoGlobalData } = await import("@/lib/data/crypto-global");

    await expect(getCachedCryptoGlobalData()).resolves.toEqual({
      data: cryptoGlobalPublicData,
      cacheStatus: "MISS",
      cacheTtlSeconds: 60,
    });

    expect(mockFetchCryptoGlobalData).toHaveBeenCalledTimes(1);
    expect(mockSetCachedJson).toHaveBeenCalledTimes(1);
  });
});

describe("coin market chart cached data provider", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mockDataLayerDependencies();
  });

  test("buildCoinMarketChartCacheKey lowercases coin ids", async () => {
    const { buildCoinMarketChartCacheKey } = await import(
      "@/lib/data/coin-market-chart"
    );

    expect(buildCoinMarketChartCacheKey("BitCoin", 7)).toBe(
      "public-api:crypto:market-chart:bitcoin:7:v1",
    );
  });

  test("readCachedCoinMarketChart reads the generated cache key", async () => {
    mockGetCachedJson.mockResolvedValueOnce({
      data: marketChartPoints,
      status: "HIT",
    });

    const { readCachedCoinMarketChart } = await import(
      "@/lib/data/coin-market-chart"
    );

    await expect(readCachedCoinMarketChart("Bitcoin", 7)).resolves.toEqual({
      data: marketChartPoints,
      status: "HIT",
    });

    expect(mockGetCachedJson).toHaveBeenCalledWith(
      "public-api:crypto:market-chart:bitcoin:7:v1",
    );
  });

  test("fetchAndCacheCoinMarketChart writes chart data with five-minute TTL", async () => {
    mockFetchCoinMarketChart.mockResolvedValueOnce(marketChartPoints);
    mockSetCachedJson.mockResolvedValueOnce();

    const { fetchAndCacheCoinMarketChart } = await import(
      "@/lib/data/coin-market-chart"
    );

    await expect(fetchAndCacheCoinMarketChart("Bitcoin", 30, "SKIP")).resolves.toEqual({
      data: marketChartPoints,
      cacheStatus: "SKIP",
      cacheTtlSeconds: 300,
    });

    expect(mockFetchCoinMarketChart).toHaveBeenCalledWith("Bitcoin", 30);
    expect(mockSetCachedJson).toHaveBeenCalledWith({
      key: "public-api:crypto:market-chart:bitcoin:30:v1",
      data: marketChartPoints,
      ttlSeconds: 300,
    });
  });

  test("getCachedCoinMarketChart returns cached data on hit", async () => {
    mockGetCachedJson.mockResolvedValueOnce({
      data: marketChartPoints,
      status: "HIT",
    });

    const { getCachedCoinMarketChart } = await import(
      "@/lib/data/coin-market-chart"
    );

    await expect(getCachedCoinMarketChart("bitcoin", 7)).resolves.toEqual({
      data: marketChartPoints,
      cacheStatus: "HIT",
      cacheTtlSeconds: 300,
    });

    expect(mockFetchCoinMarketChart).not.toHaveBeenCalled();
  });

  test("getCachedCoinMarketChart fetches and caches on miss", async () => {
    mockGetCachedJson.mockResolvedValueOnce({
      data: null,
      status: "MISS",
    });
    mockFetchCoinMarketChart.mockResolvedValueOnce(marketChartPoints);
    mockSetCachedJson.mockResolvedValueOnce();

    const { getCachedCoinMarketChart } = await import(
      "@/lib/data/coin-market-chart"
    );

    await expect(getCachedCoinMarketChart("bitcoin", 90)).resolves.toEqual({
      data: marketChartPoints,
      cacheStatus: "MISS",
      cacheTtlSeconds: 300,
    });

    expect(mockFetchCoinMarketChart).toHaveBeenCalledWith("bitcoin", 90);
    expect(mockSetCachedJson).toHaveBeenCalledTimes(1);
  });
});

describe("coin OHLC cached data provider", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mockDataLayerDependencies();
  });

  test("buildCoinOhlcChartCacheKey lowercases coin ids", async () => {
    const { buildCoinOhlcChartCacheKey } = await import(
      "@/lib/data/coin-ohlc-chart"
    );

    expect(buildCoinOhlcChartCacheKey("BitCoin", 7)).toBe(
      "public-api:crypto:ohlc:bitcoin:7:v1",
    );
  });

  test("readCachedCoinOhlcChart reads the generated cache key", async () => {
    mockGetCachedJson.mockResolvedValueOnce({
      data: ohlcPoints,
      status: "HIT",
    });

    const { readCachedCoinOhlcChart } = await import(
      "@/lib/data/coin-ohlc-chart"
    );

    await expect(readCachedCoinOhlcChart("Bitcoin", 7)).resolves.toEqual({
      data: ohlcPoints,
      status: "HIT",
    });

    expect(mockGetCachedJson).toHaveBeenCalledWith(
      "public-api:crypto:ohlc:bitcoin:7:v1",
    );
  });

  test("fetchAndCacheCoinOhlcChart writes OHLC data with five-minute TTL", async () => {
    mockFetchCoinOhlcChart.mockResolvedValueOnce(ohlcPoints);
    mockSetCachedJson.mockResolvedValueOnce();

    const { fetchAndCacheCoinOhlcChart } = await import(
      "@/lib/data/coin-ohlc-chart"
    );

    await expect(fetchAndCacheCoinOhlcChart("Bitcoin", 30, "SKIP")).resolves.toEqual({
      data: ohlcPoints,
      cacheStatus: "SKIP",
      cacheTtlSeconds: 300,
    });

    expect(mockFetchCoinOhlcChart).toHaveBeenCalledWith("Bitcoin", 30);
    expect(mockSetCachedJson).toHaveBeenCalledWith({
      key: "public-api:crypto:ohlc:bitcoin:30:v1",
      data: ohlcPoints,
      ttlSeconds: 300,
    });
  });

  test("getCachedCoinOhlcChart returns cached data on hit", async () => {
    mockGetCachedJson.mockResolvedValueOnce({
      data: ohlcPoints,
      status: "HIT",
    });

    const { getCachedCoinOhlcChart } = await import(
      "@/lib/data/coin-ohlc-chart"
    );

    await expect(getCachedCoinOhlcChart("bitcoin", 7)).resolves.toEqual({
      data: ohlcPoints,
      cacheStatus: "HIT",
      cacheTtlSeconds: 300,
    });

    expect(mockFetchCoinOhlcChart).not.toHaveBeenCalled();
  });

  test("getCachedCoinOhlcChart fetches and caches on cache skip", async () => {
    mockGetCachedJson.mockResolvedValueOnce({
      data: null,
      status: "SKIP",
    });
    mockFetchCoinOhlcChart.mockResolvedValueOnce(ohlcPoints);
    mockSetCachedJson.mockResolvedValueOnce();

    const { getCachedCoinOhlcChart } = await import(
      "@/lib/data/coin-ohlc-chart"
    );

    await expect(getCachedCoinOhlcChart("bitcoin", 90)).resolves.toEqual({
      data: ohlcPoints,
      cacheStatus: "SKIP",
      cacheTtlSeconds: 300,
    });

    expect(mockFetchCoinOhlcChart).toHaveBeenCalledWith("bitcoin", 90);
    expect(mockSetCachedJson).toHaveBeenCalledTimes(1);
  });
});

describe("weather forecast cached data provider", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mockDataLayerDependencies();
  });

  test("buildWeatherForecastCacheKey lowercases city keys", async () => {
    const { buildWeatherForecastCacheKey } = await import(
      "@/lib/data/weather-forecast"
    );

    expect(buildWeatherForecastCacheKey("Zurich")).toBe(
      "public-api:weather:zurich:v1",
    );
  });

  test("readCachedWeatherForecast reads the generated cache key", async () => {
    mockGetCachedJson.mockResolvedValueOnce({
      data: weatherData,
      status: "HIT",
    });

    const { readCachedWeatherForecast } = await import(
      "@/lib/data/weather-forecast"
    );

    await expect(readCachedWeatherForecast("Zurich")).resolves.toEqual({
      data: weatherData,
      status: "HIT",
    });

    expect(mockGetCachedJson).toHaveBeenCalledWith(
      "public-api:weather:zurich:v1",
    );
  });

  test("fetchAndCacheWeatherForecast writes weather data with thirty-minute TTL", async () => {
    mockFetchWeatherForecast.mockResolvedValueOnce(weatherData);
    mockSetCachedJson.mockResolvedValueOnce();

    const { fetchAndCacheWeatherForecast } = await import(
      "@/lib/data/weather-forecast"
    );

    await expect(fetchAndCacheWeatherForecast(zurich, "SKIP")).resolves.toEqual({
      data: weatherData,
      cacheStatus: "SKIP",
      cacheTtlSeconds: 1800,
    });

    expect(mockFetchWeatherForecast).toHaveBeenCalledWith(zurich);
    expect(mockSetCachedJson).toHaveBeenCalledWith({
      key: "public-api:weather:zurich:v1",
      data: weatherData,
      ttlSeconds: 1800,
    });
  });

  test("getCachedWeatherForecast returns cached data on hit", async () => {
    mockGetCachedJson.mockResolvedValueOnce({
      data: weatherData,
      status: "HIT",
    });

    const { getCachedWeatherForecast } = await import(
      "@/lib/data/weather-forecast"
    );

    await expect(getCachedWeatherForecast(zurich)).resolves.toEqual({
      data: weatherData,
      cacheStatus: "HIT",
      cacheTtlSeconds: 1800,
    });

    expect(mockFetchWeatherForecast).not.toHaveBeenCalled();
  });

  test("getCachedWeatherForecast fetches and caches on miss", async () => {
    mockGetCachedJson.mockResolvedValueOnce({
      data: null,
      status: "MISS",
    });
    mockFetchWeatherForecast.mockResolvedValueOnce(weatherData);
    mockSetCachedJson.mockResolvedValueOnce();

    const { getCachedWeatherForecast } = await import(
      "@/lib/data/weather-forecast"
    );

    await expect(getCachedWeatherForecast(zurich)).resolves.toEqual({
      data: weatherData,
      cacheStatus: "MISS",
      cacheTtlSeconds: 1800,
    });

    expect(mockFetchWeatherForecast).toHaveBeenCalledWith(zurich);
    expect(mockSetCachedJson).toHaveBeenCalledTimes(1);
  });
});