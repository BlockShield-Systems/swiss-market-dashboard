import { NextResponse } from "next/server";
import { fetchWeatherForecast } from "@/lib/api/openmeteo";
import {
  createCacheHeaders,
  getCachedJson,
  mergeHeaders,
  setCachedJson,
} from "@/lib/cache";
import {
  createRateLimitHeaders,
  getPublicApiRateLimit,
} from "@/lib/public-api-rate-limit";
import { getClientIdentifier } from "@/lib/request-ip";
import {
  DEFAULT_SWISS_CITY_KEY,
  getSwissCityByKey,
} from "@/lib/types/weather";

const CACHE_TTL_SECONDS = 60 * 30;

type WeatherResponse = Awaited<ReturnType<typeof fetchWeatherForecast>>;

function buildCacheKey(cityKey: string) {
  return `public-api:weather:${cityKey.toLowerCase()}:v1`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityKey = searchParams.get("key") ?? DEFAULT_SWISS_CITY_KEY;

  const city = getSwissCityByKey(cityKey);

  if (!city) {
    return NextResponse.json(
      {
        error: "Invalid city key",
      },
      {
        status: 400,
      },
    );
  }

  const cacheKey = buildCacheKey(cityKey);
  const cached = await getCachedJson<WeatherResponse>(cacheKey);

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
    const rateLimit = getPublicApiRateLimit();
    const rateLimitResult = await rateLimit.limit(identifier);

    rateLimitHeaders = createRateLimitHeaders(rateLimitResult);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many public API requests. Please try again later.",
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
    console.warn("Weather rate limit skipped:", error);
  }

  try {
    const data = await fetchWeatherForecast(city);

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
    console.error("Failed to fetch weather forecast:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch weather forecast",
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
