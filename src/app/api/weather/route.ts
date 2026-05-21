import { NextResponse } from "next/server";
import { createCacheHeaders, mergeHeaders } from "@/lib/cache";
import {
  createRateLimitHeaders,
  getPublicApiRateLimit,
} from "@/lib/public-api-rate-limit";
import { getClientIdentifier } from "@/lib/request-ip";
import {
  fetchAndCacheWeatherForecast,
  readCachedWeatherForecast,
  WEATHER_FORECAST_CACHE_TTL_SECONDS,
} from "@/lib/data/weather-forecast";
import {
  DEFAULT_SWISS_CITY_KEY,
  getSwissCityByKey,
} from "@/lib/types/weather";

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
        headers: createCacheHeaders({
          cacheStatus: "MISS",
          ttlSeconds: WEATHER_FORECAST_CACHE_TTL_SECONDS,
        }),
      },
    );
  }

  const cached = await readCachedWeatherForecast(city.key);

  if (cached.data) {
    return NextResponse.json(cached.data, {
      headers: createCacheHeaders({
        cacheStatus: cached.status,
        ttlSeconds: WEATHER_FORECAST_CACHE_TTL_SECONDS,
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
              ttlSeconds: WEATHER_FORECAST_CACHE_TTL_SECONDS,
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
    const result = await fetchAndCacheWeatherForecast(city, cached.status);

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
            ttlSeconds: WEATHER_FORECAST_CACHE_TTL_SECONDS,
          }),
          rateLimitHeaders,
        ),
      },
    );
  }
}
