import { fetchWeatherForecast } from "@/lib/api/openmeteo";
import {
  type CacheStatus,
  getCachedJson,
  setCachedJson,
} from "@/lib/cache";
import type { SwissCity, WeatherData } from "@/lib/types/weather";

export const WEATHER_FORECAST_CACHE_TTL_SECONDS = 60 * 30;

export type CachedDataResult<T> = {
  data: T;
  cacheStatus: CacheStatus;
  cacheTtlSeconds: number;
};

export function buildWeatherForecastCacheKey(cityKey: string) {
  return `public-api:weather:${cityKey.toLowerCase()}:v1`;
}

export async function readCachedWeatherForecast(cityKey: string) {
  return getCachedJson<WeatherData>(buildWeatherForecastCacheKey(cityKey));
}

export async function fetchAndCacheWeatherForecast(
  city: SwissCity,
  cacheStatus: CacheStatus = "MISS",
): Promise<CachedDataResult<WeatherData>> {
  const data = await fetchWeatherForecast(city);

  await setCachedJson({
    key: buildWeatherForecastCacheKey(city.key),
    data,
    ttlSeconds: WEATHER_FORECAST_CACHE_TTL_SECONDS,
  });

  return {
    data,
    cacheStatus,
    cacheTtlSeconds: WEATHER_FORECAST_CACHE_TTL_SECONDS,
  };
}

export async function getCachedWeatherForecast(
  city: SwissCity,
): Promise<CachedDataResult<WeatherData>> {
  const cached = await readCachedWeatherForecast(city.key);

  if (cached.data) {
    return {
      data: cached.data,
      cacheStatus: cached.status,
      cacheTtlSeconds: WEATHER_FORECAST_CACHE_TTL_SECONDS,
    };
  }

  return fetchAndCacheWeatherForecast(city, cached.status);
}
