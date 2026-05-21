import { getRedis } from "@/lib/redis";

export type CacheStatus = "HIT" | "MISS" | "SKIP";

export type CacheResult<T> = {
  data: T | null;
  status: CacheStatus;
};

export type CacheHeaderOptions = {
  cacheStatus: CacheStatus;
  ttlSeconds?: number;
  dataSource?: string;
  cacheScope?: string;
  apiRoute?: string;
};

export async function getCachedJson<T>(key: string): Promise<CacheResult<T>> {
  try {
    const redis = getRedis();
    const data = await redis.get<T>(key);

    if (data === null || data === undefined) {
      return {
        data: null,
        status: "MISS",
      };
    }

    return {
      data,
      status: "HIT",
    };
  } catch (error) {
    console.warn("Redis cache read failed:", error);

    return {
      data: null,
      status: "SKIP",
    };
  }
}

export async function setCachedJson<T>({
  key,
  data,
  ttlSeconds,
}: {
  key: string;
  data: T;
  ttlSeconds: number;
}) {
  try {
    const redis = getRedis();

    await redis.set(key, data, {
      ex: ttlSeconds,
    });
  } catch (error) {
    console.warn("Redis cache write failed:", error);
  }
}

export function createCacheHeaders({
  cacheStatus,
  ttlSeconds,
  dataSource,
  cacheScope,
  apiRoute,
}: CacheHeaderOptions) {
  const headers = new Headers();

  headers.set("X-Cache", cacheStatus);
  headers.set("Cache-Control", "no-store");

  if (ttlSeconds !== undefined) {
    headers.set("X-Cache-TTL", ttlSeconds.toString());
  }

  if (dataSource) {
    headers.set("X-Data-Source", dataSource);
  }

  if (cacheScope) {
    headers.set("X-Cache-Scope", cacheScope);
  }

  if (apiRoute) {
    headers.set("X-API-Route", apiRoute);
  }

  return headers;
}

export function mergeHeaders(...headerSources: Array<Headers | undefined>) {
  const headers = new Headers();

  for (const source of headerSources) {
    if (!source) {
      continue;
    }

    source.forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return headers;
}
