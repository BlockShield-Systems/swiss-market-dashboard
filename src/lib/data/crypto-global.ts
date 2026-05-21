import { fetchCryptoGlobalData } from "@/lib/api/coingecko";
import {
  type CacheStatus,
  getCachedJson,
  setCachedJson,
} from "@/lib/cache";

export const CRYPTO_GLOBAL_CACHE_KEY = "public-api:crypto:global:v1";
export const CRYPTO_GLOBAL_CACHE_TTL_SECONDS = 60;

export type CryptoGlobalData = {
  active_cryptocurrencies: number;
  market_cap_percentage: Record<string, number>;
  total_market_cap_chf: number;
  total_volume_chf: number;
};

export type CachedDataResult<T> = {
  data: T;
  cacheStatus: CacheStatus;
  cacheTtlSeconds: number;
};

export async function readCachedCryptoGlobalData() {
  return getCachedJson<CryptoGlobalData>(CRYPTO_GLOBAL_CACHE_KEY);
}

export async function fetchAndCacheCryptoGlobalData(
  cacheStatus: CacheStatus = "MISS",
): Promise<CachedDataResult<CryptoGlobalData>> {
  const data = await fetchCryptoGlobalData();

  const responseBody: CryptoGlobalData = {
    active_cryptocurrencies: data.data.active_cryptocurrencies,
    market_cap_percentage: data.data.market_cap_percentage,
    total_market_cap_chf: data.data.total_market_cap.chf,
    total_volume_chf: data.data.total_volume.chf,
  };

  await setCachedJson({
    key: CRYPTO_GLOBAL_CACHE_KEY,
    data: responseBody,
    ttlSeconds: CRYPTO_GLOBAL_CACHE_TTL_SECONDS,
  });

  return {
    data: responseBody,
    cacheStatus,
    cacheTtlSeconds: CRYPTO_GLOBAL_CACHE_TTL_SECONDS,
  };
}

export async function getCachedCryptoGlobalData(): Promise<
  CachedDataResult<CryptoGlobalData>
> {
  const cached = await readCachedCryptoGlobalData();

  if (cached.data) {
    return {
      data: cached.data,
      cacheStatus: cached.status,
      cacheTtlSeconds: CRYPTO_GLOBAL_CACHE_TTL_SECONDS,
    };
  }

  return fetchAndCacheCryptoGlobalData(cached.status);
}
