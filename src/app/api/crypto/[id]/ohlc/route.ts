import { NextResponse } from "next/server";
import { fetchCoinOhlcChart } from "@/lib/api/coingecko";
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
import type { CryptoChartDays } from "@/lib/types/crypto";

interface OhlcRouteContext {
  params: Promise<{
    id: string;
  }>;
}

const ALLOWED_DAYS: CryptoChartDays[] = [7, 30, 90];
const CACHE_TTL_SECONDS = 60 * 5;

type OhlcResponse = Awaited<ReturnType<typeof fetchCoinOhlcChart>>;

function parseChartDays(value: string | null): CryptoChartDays {
  const parsed = Number(value ?? 7);

  if (ALLOWED_DAYS.includes(parsed as CryptoChartDays)) {
    return parsed as CryptoChartDays;
  }

  return 7;
}

function buildCacheKey(id: string, days: CryptoChartDays) {
  return `public-api:crypto:ohlc:${id.toLowerCase()}:${days}:v1`;
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

  const cacheKey = buildCacheKey(normalizedId, days);
  const cached = await getCachedJson<OhlcResponse>(cacheKey);

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
    console.warn("OHLC rate limit skipped:", error);
  }

  try {
    const data = await fetchCoinOhlcChart(normalizedId, days);

    await setCachedJson({
      key: cacheKey,
      data,
      ttlSeconds: CACHE_TTL_SECONDS,
    });

    return NextResponse.json(data, {
      headers: mergeHeaders(
        createCacheHeaders({
          cacheStatus: cached.status,
          ttlSeconds: CACHE_TTL_SECONDS,
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
            ttlSeconds: CACHE_TTL_SECONDS,
          }),
          rateLimitHeaders,
        ),
      },
    );
  }
}
