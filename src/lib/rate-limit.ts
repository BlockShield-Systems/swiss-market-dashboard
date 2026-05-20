import { Ratelimit } from "@upstash/ratelimit";
import { getRedis } from "@/lib/redis";

let aiMarketSummaryRateLimit: Ratelimit | null = null;

export function getAiMarketSummaryRateLimit() {
  if (aiMarketSummaryRateLimit) {
    return aiMarketSummaryRateLimit;
  }

  aiMarketSummaryRateLimit = new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(5, "10 m"),
    analytics: true,
    prefix: "ratelimit:ai-market-summary",
  });

  return aiMarketSummaryRateLimit;
}
