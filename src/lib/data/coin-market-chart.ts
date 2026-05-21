import { fetchCoinMarketChart } from "@/lib/api/coingecko";
import {
  type CacheStatus,
  getCachedJson,
  setCachedJson,
} from "@/lib/cache";
import type {
  CryptoChartDays,
  CryptoMarketChartPoint,
} from "@/lib/types/crypto";

export const COIN_MARKET_CHART_CACHE_TTL_SECONDS = 60 * 5;

export type CachedDataResult<T> = {
  data: T;
  cacheStatus: CacheStatus;
  cacheTtlSeconds: number;
};

export function buildCoinMarketChartCacheKey(
  coinId: string,
  days: CryptoChartDays,
) {
  return `public-api:crypto:market-chart:${coinId.toLowerCase()}:${days}:v1`;
}

export async function readCachedCoinMarketChart(
  coinId: string,
  days: CryptoChartDays,
) {
  return getCachedJson<CryptoMarketChartPoint[]>(
    buildCoinMarketChartCacheKey(coinId, days),
  );
}

export async function fetchAndCacheCoinMarketChart(
  coinId: string,
  days: CryptoChartDays,
  cacheStatus: CacheStatus = "MISS",
): Promise<CachedDataResult<CryptoMarketChartPoint[]>> {
  const data = await fetchCoinMarketChart(coinId, days);

  await setCachedJson({
    key: buildCoinMarketChartCacheKey(coinId, days),
    data,
    ttlSeconds: COIN_MARKET_CHART_CACHE_TTL_SECONDS,
  });

  return {
    data,
    cacheStatus,
    cacheTtlSeconds: COIN_MARKET_CHART_CACHE_TTL_SECONDS,
  };
}

export async function getCachedCoinMarketChart(
  coinId: string,
  days: CryptoChartDays,
): Promise<CachedDataResult<CryptoMarketChartPoint[]>> {
  const cached = await readCachedCoinMarketChart(coinId, days);

  if (cached.data) {
    return {
      data: cached.data,
      cacheStatus: cached.status,
      cacheTtlSeconds: COIN_MARKET_CHART_CACHE_TTL_SECONDS,
    };
  }

  return fetchAndCacheCoinMarketChart(coinId, days, cached.status);
}
