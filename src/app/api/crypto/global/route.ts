import { NextResponse } from "next/server";
import { createCacheHeaders, mergeHeaders } from "@/lib/cache";
import {
  createRateLimitHeaders,
  getMarketDataRateLimit,
} from "@/lib/public-api-rate-limit";
import { getClientIdentifier } from "@/lib/request-ip";
import {
  CRYPTO_GLOBAL_CACHE_TTL_SECONDS,
  fetchAndCacheCryptoGlobalData,
  readCachedCryptoGlobalData,
} from "@/lib/data/crypto-global";
import type { CacheStatus } from "@/lib/cache";

const API_ROUTE = "crypto-global";
const DATA_SOURCE = "coingecko";
const CACHE_SCOPE = "shared-data-service";
const RATE_LIMIT_POLICY = "market-data-api";
const RATE_LIMIT_WINDOW = "1m";

function createRouteCacheHeaders(cacheStatus: CacheStatus, ttlSeconds: number) {
  return createCacheHeaders({
    cacheStatus,
    ttlSeconds,
    dataSource: DATA_SOURCE,
    cacheScope: CACHE_SCOPE,
    apiRoute: API_ROUTE,
  });
}

export async function GET(request: Request) {
  const cached = await readCachedCryptoGlobalData();

  if (cached.data) {
    return NextResponse.json(cached.data, {
      headers: createRouteCacheHeaders(
        cached.status,
        CRYPTO_GLOBAL_CACHE_TTL_SECONDS,
      ),
    });
  }

  let rateLimitHeaders: Headers | undefined;

  try {
    const identifier = getClientIdentifier(request);
    const rateLimit = getMarketDataRateLimit();
    const rateLimitResult = await rateLimit.limit(identifier);

    rateLimitHeaders = createRateLimitHeaders(rateLimitResult, {
      policy: RATE_LIMIT_POLICY,
      window: RATE_LIMIT_WINDOW,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many market data requests. Please try again later.",
        },
        {
          status: 429,
          headers: mergeHeaders(
            createRouteCacheHeaders(
              cached.status,
              CRYPTO_GLOBAL_CACHE_TTL_SECONDS,
            ),
            rateLimitHeaders,
          ),
        },
      );
    }
  } catch (error) {
    console.warn("Market data rate limit skipped:", error);
  }

  try {
    const result = await fetchAndCacheCryptoGlobalData(cached.status);

    return NextResponse.json(result.data, {
      headers: mergeHeaders(
        createRouteCacheHeaders(result.cacheStatus, result.cacheTtlSeconds),
        rateLimitHeaders,
      ),
    });
  } catch (error) {
    console.error("Failed to fetch crypto market data:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch crypto market data.",
      },
      {
        status: 502,
        headers: mergeHeaders(
          createRouteCacheHeaders(
            cached.status,
            CRYPTO_GLOBAL_CACHE_TTL_SECONDS,
          ),
          rateLimitHeaders,
        ),
      },
    );
  }
}
