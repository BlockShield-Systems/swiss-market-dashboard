import { NextResponse } from "next/server";
import { createCacheHeaders, mergeHeaders } from "@/lib/cache";
import {
  createRateLimitHeaders,
  getMarketDataRateLimit,
} from "@/lib/public-api-rate-limit";
import { getClientIdentifier } from "@/lib/request-ip";
import {
  COIN_OHLC_CHART_CACHE_TTL_SECONDS,
  fetchAndCacheCoinOhlcChart,
  readCachedCoinOhlcChart,
} from "@/lib/data/coin-ohlc-chart";
import type { CryptoChartDays } from "@/lib/types/crypto";

interface OhlcRouteContext {
  params: Promise<{
    id: string;
  }>;
}

const ALLOWED_DAYS: CryptoChartDays[] = [7, 30, 90];

function parseChartDays(value: string | null): CryptoChartDays {
  const parsed = Number(value ?? 7);

  if (ALLOWED_DAYS.includes(parsed as CryptoChartDays)) {
    return parsed as CryptoChartDays;
  }

  return 7;
}

export async function GET(request: Request, { params }: OhlcRouteContext) {
  const { id } = await params;
  const normalizedId = id.trim().toLowerCase();

  const { searchParams } = new URL(request.url);
  const days = parseChartDays(searchParams.get("days"));

  if (!normalizedId) {
    return NextResponse.json(
      { error: "Missing coin id." },
      { status: 400 },
    );
  }

  const cached = await readCachedCoinOhlcChart(normalizedId, days);

  if (cached.data) {
    return NextResponse.json(cached.data, {
      headers: createCacheHeaders({
        cacheStatus: cached.status,
        ttlSeconds: COIN_OHLC_CHART_CACHE_TTL_SECONDS,
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
              ttlSeconds: COIN_OHLC_CHART_CACHE_TTL_SECONDS,
            }),
            rateLimitHeaders,
          ),
        },
      );
    }
  } catch (error) {
    console.warn("OHLC rate limit skipped:", error);
  }

  try {
    const result = await fetchAndCacheCoinOhlcChart(
      normalizedId,
      days,
      cached.status,
    );

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
    console.error("Failed to load coin OHLC chart:", error);

    return NextResponse.json(
      { error: "Coin OHLC chart could not be loaded." },
      {
        status: 502,
        headers: mergeHeaders(
          createCacheHeaders({
            cacheStatus: cached.status,
            ttlSeconds: COIN_OHLC_CHART_CACHE_TTL_SECONDS,
          }),
          rateLimitHeaders,
        ),
      },
    );
  }
}
