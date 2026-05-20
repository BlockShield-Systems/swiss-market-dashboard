import { flag } from "flags/next";
import type { CryptoChartMode } from "@/lib/types/crypto";

function parseBoolean(value: string | undefined, fallback = false) {
  if (value === "true") return true;
  if (value === "false") return false;

  return fallback;
}

function parseChartMode(value: string | undefined): CryptoChartMode {
  if (value === "area" || value === "line" || value === "candlestick") {
    return value;
  }

  return "area";
}

export const marketInsightsEnabled = flag({
  key: "market-insights-enabled",
  decide() {
    return parseBoolean(process.env.FEATURE_MARKET_INSIGHTS_ENABLED, true);
  },
});

export const aiMarketSummaryEnabled = flag({
  key: "ai-market-summary-enabled",
  decide() {
    return parseBoolean(process.env.FEATURE_AI_MARKET_SUMMARY_ENABLED, false);
  },
});

export const defaultCryptoChartMode = flag<CryptoChartMode>({
  key: "default-crypto-chart-mode",
  decide() {
    return parseChartMode(process.env.FEATURE_DEFAULT_CRYPTO_CHART_MODE);
  },
});
