import { NextResponse } from "next/server";
import { fetchCryptoGlobalData } from "@/lib/api/coingecko";
import {
  createCacheHeaders,
  getCachedJson,
  mergeHeaders,
  setCachedJson,
} from "@/lib/cache";
import {
  createRateLimitHeaders,
  getMarketDataRateLimit,
} from "@/lib/public-api-rate-limit";
import { getClientIdentifier } from "@/lib/request-ip";

const CACHE_KEY = "public-api:crypto:global:v1";
const CACHE_TTL_SECONDS = 60;

type CryptoGlobalApiResponse = {
  active_cryptocurrencies: number;
  market_cap_percentage: Record<string, number>;
  total_market_cap_chf: number;
  total_volume_chf: number;
};

export async function GET(request: Request) {
  const cached = await getCachedJson<CryptoGlobalApiResponse>(CACHE_KEY);

  if (cached.data) {
    return NextResponse.json(cached.data, {
      headers: createCacheHeaders({
        cacheStatus: cached.status,
        ttlSeconds: CACHE_TTL_SECONDS,
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
              ttlSeconds: CACHE_TTL_SECONDS,
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
    const data = await fetchCryptoGlobalData();

    const responseBody: CryptoGlobalApiResponse = {
      active_cryptocurrencies: data.data.active_cryptocurrencies,
      market_cap_percentage: data.data.market_cap_percentage,
      total_market_cap_chf: data.data.total_market_cap.chf,
      total_volume_chf: data.data.total_volume.chf,
    };

    await setCachedJson({
      key: CACHE_KEY,
      data: responseBody,
      ttlSeconds: CACHE_TTL_SECONDS,
    });

    return NextResponse.json(responseBody, {
      headers: mergeHeaders(
        createCacheHeaders({
          cacheStatus: cached.status,
          ttlSeconds: CACHE_TTL_SECONDS,
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
            ttlSeconds: CACHE_TTL_SECONDS,
          }),
          rateLimitHeaders,
        ),
      },
    );
  }
}
