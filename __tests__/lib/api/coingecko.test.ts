export {};

type FetchInitWithNext = RequestInit & {
  next?: {
    revalidate?: number;
  };
};

const COINGECKO_TEST_ENV_SNAPSHOT = { ...process.env };

const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;

function createJsonResponse<T>(data: T, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(data),
  } as unknown as Response;
}

async function importCoinGeckoApi() {
  return import("@/lib/api/coingecko");
}

function getLatestFetchCall() {
  const call = mockFetch.mock.calls.at(-1);

  if (!call) {
    throw new Error("Expected fetch to have been called");
  }

  const [url, init] = call;

  return {
    url: new URL(String(url)),
    init: init as FetchInitWithNext,
  };
}

describe("CoinGecko API client", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    process.env = { ...COINGECKO_TEST_ENV_SNAPSHOT };
    delete process.env.COINGECKO_API_KEY;

    global.fetch = mockFetch;
  });

  afterEach(() => {
    process.env = { ...COINGECKO_TEST_ENV_SNAPSHOT };
  });

  test("fetchCryptoMarket requests CHF market data and normalizes nullable fields", async () => {
    mockFetch.mockResolvedValueOnce(
      createJsonResponse([
        {
          id: "bitcoin",
          symbol: "btc",
          name: "Bitcoin",
          image: "https://example.test/btc.png",
          current_price: undefined,
          market_cap: undefined,
          market_cap_rank: undefined,
          total_volume: undefined,
          price_change_percentage_24h: undefined,
          price_change_percentage_7d_in_currency: undefined,
          price_change_percentage_7d: 4.2,
          sparkline_in_7d: undefined,
        },
      ]),
    );

    const { fetchCryptoMarket } = await importCoinGeckoApi();

    const coins = await fetchCryptoMarket(2, 25, "market_cap_rank", "asc");
    const { url, init } = getLatestFetchCall();

    expect(url.origin).toBe("https://api.coingecko.com");
    expect(url.pathname).toBe("/api/v3/coins/markets");
    expect(url.searchParams.get("vs_currency")).toBe("chf");
    expect(url.searchParams.get("order")).toBe("market_cap_desc");
    expect(url.searchParams.get("per_page")).toBe("25");
    expect(url.searchParams.get("page")).toBe("2");
    expect(url.searchParams.get("sparkline")).toBe("true");
    expect(url.searchParams.get("price_change_percentage")).toBe("24h,7d");
    expect(url.searchParams.get("locale")).toBe("en");

    expect(init.headers).toEqual({
      Accept: "application/json",
    });
    expect(init.next?.revalidate).toBe(120);

    expect(coins).toEqual([
      {
        id: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        image: "https://example.test/btc.png",
        current_price: null,
        market_cap: null,
        market_cap_rank: null,
        total_volume: null,
        price_change_percentage_24h: null,
        price_change_percentage_7d_in_currency: 4.2,
        price_change_percentage_7d: 4.2,
        sparkline_in_7d: {
          price: [],
        },
      },
    ]);
  });

  test("fetchCryptoMarket maps descending market-cap rank to CoinGecko ascending market-cap order", async () => {
    mockFetch.mockResolvedValueOnce(createJsonResponse([]));

    const { fetchCryptoMarket } = await importCoinGeckoApi();

    await fetchCryptoMarket(1, 50, "market_cap_rank", "desc");

    const { url } = getLatestFetchCall();

    expect(url.searchParams.get("order")).toBe("market_cap_asc");
  });

  test("fetchCryptoMarket keeps unsupported server-side table sorting stable", async () => {
    mockFetch.mockResolvedValueOnce(createJsonResponse([]));

    const { fetchCryptoMarket } = await importCoinGeckoApi();

    await fetchCryptoMarket(1, 50, "current_price", "desc");

    const { url } = getLatestFetchCall();

    expect(url.searchParams.get("order")).toBe("market_cap_desc");
  });

  test("adds CoinGecko demo API key header when COINGECKO_API_KEY is configured", async () => {
    process.env.COINGECKO_API_KEY = "test-coingecko-key";

    mockFetch.mockResolvedValueOnce(
      createJsonResponse({
        data: {
          active_cryptocurrencies: 12000,
          market_cap_percentage: {
            btc: 50,
          },
          total_market_cap: {
            chf: 1000,
          },
          total_volume: {
            chf: 100,
          },
        },
      }),
    );

    const { fetchCryptoGlobalData } = await importCoinGeckoApi();

    await fetchCryptoGlobalData();

    const { init } = getLatestFetchCall();

    expect(init.headers).toEqual({
      Accept: "application/json",
      "x-cg-demo-api-key": "test-coingecko-key",
    });
    expect(init.next?.revalidate).toBe(300);
  });

  test("fetchCoinDetails encodes coin ids and throws on failed responses", async () => {
    mockFetch.mockResolvedValueOnce(createJsonResponse({ error: "not found" }, 404));

    const { fetchCoinDetails } = await importCoinGeckoApi();

    await expect(fetchCoinDetails("bitcoin/test")).rejects.toThrow(
      "CoinGecko /coins/bitcoin/test error: 404",
    );

    const { url } = getLatestFetchCall();

    expect(url.pathname).toBe("/api/v3/coins/bitcoin%2Ftest");
    expect(url.searchParams.get("localization")).toBe("true");
    expect(url.searchParams.get("tickers")).toBe("false");
    expect(url.searchParams.get("market_data")).toBe("true");
    expect(url.searchParams.get("community_data")).toBe("false");
    expect(url.searchParams.get("developer_data")).toBe("false");
    expect(url.searchParams.get("sparkline")).toBe("false");
  });

  test("fetchCoinMarketChart normalizes prices, market caps and volumes", async () => {
    mockFetch.mockResolvedValueOnce(
      createJsonResponse({
        prices: [
          [1700000000000, 42000],
          [1700003600000, 43000],
        ],
        market_caps: [[1700000000000, 800000000]],
        total_volumes: [[1700000000000, 50000000]],
      }),
    );

    const { fetchCoinMarketChart } = await importCoinGeckoApi();

    const points = await fetchCoinMarketChart("bitcoin", 7);
    const { url, init } = getLatestFetchCall();

    expect(url.pathname).toBe("/api/v3/coins/bitcoin/market_chart");
    expect(url.searchParams.get("vs_currency")).toBe("chf");
    expect(url.searchParams.get("days")).toBe("7");
    expect(init.next?.revalidate).toBe(120);

    expect(points).toEqual([
      {
        timestamp: 1700000000000,
        date: new Date(1700000000000).toISOString(),
        price: 42000,
        marketCap: 800000000,
        volume: 50000000,
      },
      {
        timestamp: 1700003600000,
        date: new Date(1700003600000).toISOString(),
        price: 43000,
        marketCap: null,
        volume: null,
      },
    ]);
  });

  test("fetchCoinOhlcChart normalizes OHLC arrays", async () => {
    mockFetch.mockResolvedValueOnce(
      createJsonResponse([[1700000000000, 41000, 43000, 40000, 42000]]),
    );

    const { fetchCoinOhlcChart } = await importCoinGeckoApi();

    const points = await fetchCoinOhlcChart("bitcoin", 30);
    const { url, init } = getLatestFetchCall();

    expect(url.pathname).toBe("/api/v3/coins/bitcoin/ohlc");
    expect(url.searchParams.get("vs_currency")).toBe("chf");
    expect(url.searchParams.get("days")).toBe("30");
    expect(init.next?.revalidate).toBe(120);

    expect(points).toEqual([
      {
        timestamp: 1700000000000,
        date: new Date(1700000000000).toISOString(),
        open: 41000,
        high: 43000,
        low: 40000,
        close: 42000,
      },
    ]);
  });

  test("fetchCryptoGlobalData throws on failed responses", async () => {
    mockFetch.mockResolvedValueOnce(createJsonResponse({ error: "rate limited" }, 429));

    const { fetchCryptoGlobalData } = await importCoinGeckoApi();

    await expect(fetchCryptoGlobalData()).rejects.toThrow(
      "CoinGecko Global API error: 429",
    );
  });

  test("fetchCoinMarketChart throws on failed responses", async () => {
    mockFetch.mockResolvedValueOnce(createJsonResponse({ error: "server error" }, 502));

    const { fetchCoinMarketChart } = await importCoinGeckoApi();

    await expect(fetchCoinMarketChart("bitcoin", 7)).rejects.toThrow(
      "CoinGecko /coins/bitcoin/market_chart error: 502",
    );
  });

  test("fetchCoinOhlcChart throws on failed responses", async () => {
    mockFetch.mockResolvedValueOnce(createJsonResponse({ error: "server error" }, 502));

    const { fetchCoinOhlcChart } = await importCoinGeckoApi();

    await expect(fetchCoinOhlcChart("bitcoin", 7)).rejects.toThrow(
      "CoinGecko /coins/bitcoin/ohlc error: 502",
    );
  });
});