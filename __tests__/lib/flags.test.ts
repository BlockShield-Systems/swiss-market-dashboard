const ORIGINAL_ENV = process.env;

async function importFlagsWithEnvironment(
  values: Partial<{
    FEATURE_MARKET_INSIGHTS_ENABLED: string;
    FEATURE_AI_MARKET_SUMMARY_ENABLED: string;
    FEATURE_DEFAULT_CRYPTO_CHART_MODE: string;
  }>,
) {
  jest.resetModules();

  process.env = {
    ...ORIGINAL_ENV,
  };

  for (const key of [
    "FEATURE_MARKET_INSIGHTS_ENABLED",
    "FEATURE_AI_MARKET_SUMMARY_ENABLED",
    "FEATURE_DEFAULT_CRYPTO_CHART_MODE",
  ] as const) {
    if (values[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = values[key];
    }
  }

  jest.doMock("flags/next", () => ({
    flag: jest.fn((config: { decide: () => unknown }) => async () => config.decide()),
  }));

  return import("@/lib/flags");
}

afterAll(() => {
  process.env = ORIGINAL_ENV;
});

describe("feature flags", () => {
  it("enables market insights by default", async () => {
    const { marketInsightsEnabled } = await importFlagsWithEnvironment({});

    await expect(marketInsightsEnabled()).resolves.toBe(true);
  });

  it("allows disabling market insights through env", async () => {
    const { marketInsightsEnabled } = await importFlagsWithEnvironment({
      FEATURE_MARKET_INSIGHTS_ENABLED: "false",
    });

    await expect(marketInsightsEnabled()).resolves.toBe(false);
  });

  it("keeps AI market summaries disabled by default", async () => {
    const { aiMarketSummaryEnabled } = await importFlagsWithEnvironment({});

    await expect(aiMarketSummaryEnabled()).resolves.toBe(false);
  });

  it("allows enabling AI market summaries through env", async () => {
    const { aiMarketSummaryEnabled } = await importFlagsWithEnvironment({
      FEATURE_AI_MARKET_SUMMARY_ENABLED: "true",
    });

    await expect(aiMarketSummaryEnabled()).resolves.toBe(true);
  });

  it("uses area as default crypto chart mode", async () => {
    const { defaultCryptoChartMode } = await importFlagsWithEnvironment({});

    await expect(defaultCryptoChartMode()).resolves.toBe("area");
  });

  it("accepts supported crypto chart modes", async () => {
    const { defaultCryptoChartMode } = await importFlagsWithEnvironment({
      FEATURE_DEFAULT_CRYPTO_CHART_MODE: "candlestick",
    });

    await expect(defaultCryptoChartMode()).resolves.toBe("candlestick");
  });

  it("falls back to area for unsupported crypto chart modes", async () => {
    const { defaultCryptoChartMode } = await importFlagsWithEnvironment({
      FEATURE_DEFAULT_CRYPTO_CHART_MODE: "broken-mode",
    });

    await expect(defaultCryptoChartMode()).resolves.toBe("area");
  });
});
