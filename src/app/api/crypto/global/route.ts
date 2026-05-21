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

export async function GET(request: Request) {
  const cached = await readCachedCryptoGlobalData();

  if (cached.data) {
    return NextResponse.json(cached.data, {
      headers: createCacheHeaders({
        cacheStatus: cached.status,
        ttlSeconds: CRYPTO_GLOBAL_CACHE_TTL_SECONDS,
      }),
    });
  }

  let rateLimitHeaders: Headers | undefined;

  try {
    const identifier = getClientIdentifier(request);
    const rateLimit = getMarketDataRateLimit();
    const rateLimitResult = await rateLimit.limit(identifier);

    rateLimitHeaders = createRateLimitHeaders(rateLimitResult);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many market data requests. Please try again later.",
        },
        {
          status: 429,
          headers: mergeHeaders(
            createCacheHeaders({
              cacheStatus: cached.status,
              ttlSeconds: CRYPTO_GLOBAL_CACHE_TTL_SECONDS,
            }),
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
        createCacheHeaders({
          cacheStatus: result.cacheStatus,
          ttlSeconds: result.cacheTtlSeconds,
        }),
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
          createCacheHeaders({
            cacheStatus: cached.status,
            ttlSeconds: CRYPTO_GLOBAL_CACHE_TTL_SECONDS,
          }),
          rateLimitHeaders,
        ),
      },
    );
  }
}
