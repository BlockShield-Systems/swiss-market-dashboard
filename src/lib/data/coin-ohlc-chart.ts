import { fetchCoinOhlcChart } from "@/lib/api/coingecko";
import {
  type CacheStatus,
  getCachedJson,
  setCachedJson,
} from "@/lib/cache";
import type { CryptoChartDays, CryptoOhlcPoint } from "@/lib/types/crypto";

export const COIN_OHLC_CHART_CACHE_TTL_SECONDS = 60 * 5;

export type CachedDataResult<T> = {
  data: T;
  cacheStatus: CacheStatus;
  cacheTtlSeconds: number;
};

export function buildCoinOhlcChartCacheKey(
  coinId: string,
  days: CryptoChartDays,
) {
  return `public-api:crypto:ohlc:${coinId.toLowerCase()}:${days}:v1`;
}

export async function readCachedCoinOhlcChart(
  coinId: string,
  days: CryptoChartDays,
) {
  return getCachedJson<CryptoOhlcPoint[]>(
    buildCoinOhlcChartCacheKey(coinId, days),
  );
}

export async function fetchAndCacheCoinOhlcChart(
  coinId: string,
  days: CryptoChartDays,
  cacheStatus: CacheStatus = "MISS",
): Promise<CachedDataResult<CryptoOhlcPoint[]>> {
  const data = await fetchCoinOhlcChart(coinId, days);

  await setCachedJson({
    key: buildCoinOhlcChartCacheKey(coinId, days),
    data,
    ttlSeconds: COIN_OHLC_CHART_CACHE_TTL_SECONDS,
  });

  return {
    data,
    cacheStatus,
    cacheTtlSeconds: COIN_OHLC_CHART_CACHE_TTL_SECONDS,
  };
}

export async function getCachedCoinOhlcChart(
  coinId: string,
  days: CryptoChartDays,
): Promise<CachedDataResult<CryptoOhlcPoint[]>> {
  const cached = await readCachedCoinOhlcChart(coinId, days);

  if (cached.data) {
    return {
      data: cached.data,
      cacheStatus: cached.status,
      cacheTtlSeconds: COIN_OHLC_CHART_CACHE_TTL_SECONDS,
    };
  }

  return fetchAndCacheCoinOhlcChart(coinId, days, cached.status);
}
