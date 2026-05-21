import { Ratelimit } from "@upstash/ratelimit";
import { getRedis } from "@/lib/redis";

let publicApiRateLimit: Ratelimit | null = null;
let marketDataRateLimit: Ratelimit | null = null;

export function getPublicApiRateLimit() {
  if (publicApiRateLimit) {
    return publicApiRateLimit;
  }

  publicApiRateLimit = new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(120, "1 m"),
    analytics: true,
    prefix: "ratelimit:public-api",
  });

  return publicApiRateLimit;
}

export function getMarketDataRateLimit() {
  if (marketDataRateLimit) {
    return marketDataRateLimit;
  }

  marketDataRateLimit = new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(60, "1 m"),
    analytics: true,
    prefix: "ratelimit:market-data-api",
  });

  return marketDataRateLimit;
}

export function createRateLimitHeaders(result: {
  limit: number;
  remaining: number;
  reset: number;
}) {
  const headers = new Headers();

  headers.set("X-RateLimit-Limit", result.limit.toString());
  headers.set("X-RateLimit-Remaining", result.remaining.toString());
  headers.set("X-RateLimit-Reset", result.reset.toString());

  return headers;
}
