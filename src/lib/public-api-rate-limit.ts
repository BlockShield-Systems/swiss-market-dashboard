import { Ratelimit } from "@upstash/ratelimit";
import { getRedis } from "@/lib/redis";

let publicApiRateLimit: Ratelimit | null = null;
let marketDataRateLimit: Ratelimit | null = null;

export type PublicRateLimitPolicy = "public-api" | "market-data-api";

export type RateLimitHeaderOptions = {
  policy?: PublicRateLimitPolicy;
  window?: string;
};

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

export function createRateLimitHeaders(
  result: {
    limit: number;
    remaining: number;
    reset: number;
  },
  options: RateLimitHeaderOptions = {},
) {
  const headers = new Headers();

  headers.set("X-RateLimit-Limit", result.limit.toString());
  headers.set("X-RateLimit-Remaining", result.remaining.toString());
  headers.set("X-RateLimit-Reset", result.reset.toString());

  if (options.policy) {
    headers.set("X-RateLimit-Policy", options.policy);
  }

  if (options.window) {
    headers.set("X-RateLimit-Window", options.window);
  }

  return headers;
}
