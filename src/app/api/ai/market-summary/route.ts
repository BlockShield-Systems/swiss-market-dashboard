import { generateText } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchCoinDetails } from "@/lib/api/coingecko";
import { createMarketInsight } from "@/lib/db/queries/market-insights";
import { aiMarketSummaryEnabled } from "@/lib/flags";
import type { Locale } from "@/lib/i18n";
import { getAiMarketSummaryRateLimit } from "@/lib/rate-limit";
import { getClientIdentifier } from "@/lib/request-ip";
import { getRedis } from "@/lib/redis";

export const dynamic = "force-dynamic";

const AI_SUMMARY_CACHE_TTL_SECONDS = 60 * 30;

const requestSchema = z.object({
  coinId: z.string().trim().min(1).max(80),
  locale: z.enum(["de", "en"]).default("de"),
});

type AiSummaryCacheBody = {
  insight: Awaited<ReturnType<typeof createMarketInsight>>;
  usage: unknown;
  cached: false;
};

function getModel() {
  return process.env.AI_MARKET_SUMMARY_MODEL ?? "alibaba/qwen-3-14b";
}

function hasGatewayAuthentication() {
  return Boolean(
    process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN,
  );
}

function formatNullableNumber(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "n/a";
  }

  return value.toString();
}

function toOptionalNumber(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return undefined;
  }

  return value;
}

function buildAiSummaryCacheKey(coinId: string, locale: "de" | "en") {
  return `ai-summary:${locale}:${coinId.toLowerCase()}`;
}

function buildPrompt({
  locale,
  coinName,
  coinSymbol,
  priceChf,
  change24h,
  change7d,
  marketCapChf,
  volume24hChf,
}: {
  locale: Locale;
  coinName: string;
  coinSymbol: string;
  priceChf: number | null | undefined;
  change24h: number | null | undefined;
  change7d: number | null | undefined;
  marketCapChf: number | null | undefined;
  volume24hChf: number | null | undefined;
}) {
  if (locale === "de") {
    return `
Du bist ein sachlicher Market-Intelligence-Analyst für ein Schweizer Tech-Dashboard.

Erstelle eine kompakte Marktanalyse auf Deutsch.

Asset:
- Name: ${coinName}
- Symbol: ${coinSymbol.toUpperCase()}
- Preis in CHF: ${formatNullableNumber(priceChf)}
- 24h Veränderung in Prozent: ${formatNullableNumber(change24h)}
- 7d Veränderung in Prozent: ${formatNullableNumber(change7d)}
- Marktkapitalisierung in CHF: ${formatNullableNumber(marketCapChf)}
- 24h Handelsvolumen in CHF: ${formatNullableNumber(volume24hChf)}

Regeln:
- Maximal 120 Wörter.
- Keine Finanzberatung.
- Kein Hype, keine Kauf- oder Verkaufsempfehlung.
- Sachlich, analytisch, professionell.
- Erwähne kurz Datenunsicherheit und Marktrisiko.
- Keine Markdown-Tabelle.
- Keine Überschrift.
`.trim();
  }

  return `
You are a factual market intelligence analyst for a Swiss tech dashboard.

Create a concise market analysis in English.

Asset:
- Name: ${coinName}
- Symbol: ${coinSymbol.toUpperCase()}
- Price in CHF: ${formatNullableNumber(priceChf)}
- 24h change in percent: ${formatNullableNumber(change24h)}
- 7d change in percent: ${formatNullableNumber(change7d)}
- Market capitalization in CHF: ${formatNullableNumber(marketCapChf)}
- 24h trading volume in CHF: ${formatNullableNumber(volume24hChf)}

Rules:
- Maximum 120 words.
- No financial advice.
- No hype, no buy or sell recommendation.
- Factual, analytical, professional.
- Briefly mention data uncertainty and market risk.
- No Markdown table.
- No heading.
`.trim();
}

export async function POST(request: Request) {
  const enabled = await aiMarketSummaryEnabled();

  if (!enabled) {
    return NextResponse.json(
      {
        error: "AI market summaries are disabled.",
      },
      {
        status: 403,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  if (!hasGatewayAuthentication()) {
    return NextResponse.json(
      {
        error: "AI Gateway authentication is not configured.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  try {
    const json = await request.json();
    const parsed = requestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request body.",
          issues: parsed.error.flatten(),
        },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    const { coinId, locale } = parsed.data;

    const identifier = getClientIdentifier(request);
    const rateLimit = getAiMarketSummaryRateLimit();
    const rateLimitResult = await rateLimit.limit(identifier);

    const rateLimitHeaders = {
      "X-RateLimit-Limit": rateLimitResult.limit.toString(),
      "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
      "X-RateLimit-Reset": rateLimitResult.reset.toString(),
    };

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many AI summary requests. Please try again later.",
        },
        {
          status: 429,
          headers: {
            ...rateLimitHeaders,
            "Cache-Control": "no-store",
          },
        },
      );
    }

    const redis = getRedis();
    const cacheKey = buildAiSummaryCacheKey(coinId, locale);
    const cachedResponse = await redis.get<AiSummaryCacheBody>(cacheKey);

    if (cachedResponse) {
      return NextResponse.json(
        {
          ...cachedResponse,
          cached: true,
        },
        {
          status: 200,
          headers: {
            ...rateLimitHeaders,
            "Cache-Control": "no-store",
            "X-AI-Cache": "HIT",
          },
        },
      );
    }

    const coin = await fetchCoinDetails(coinId);

    const priceChf = coin.market_data.current_price.chf;
    const change24h = coin.market_data.price_change_percentage_24h;
    const change7d = coin.market_data.price_change_percentage_7d;
    const marketCapChf = coin.market_data.market_cap.chf;
    const volume24hChf = coin.market_data.total_volume.chf;

    const model = getModel();

    const { text, usage } = await generateText({
      model,
      prompt: buildPrompt({
        locale,
        coinName: coin.name,
        coinSymbol: coin.symbol,
        priceChf,
        change24h,
        change7d,
        marketCapChf,
        volume24hChf,
      }),
      maxOutputTokens: 220,
      temperature: 0.25,
    });

    const summary = text.trim();

    if (!summary) {
      return NextResponse.json(
        {
          error: "AI Gateway returned an empty summary.",
        },
        {
          status: 502,
          headers: {
            ...rateLimitHeaders,
            "Cache-Control": "no-store",
            "X-AI-Cache": "MISS",
          },
        },
      );
    }

    const created = await createMarketInsight({
      coinId: coin.id,
      locale,
      title:
        locale === "de"
          ? `${coin.name} AI-Marktüberblick`
          : `${coin.name} AI Market Summary`,
      summary,
      source: "ai",
      model,
      confidenceScore: null,
      metadata: {
        priceChf: toOptionalNumber(priceChf),
        change24h: toOptionalNumber(change24h),
        change7d: toOptionalNumber(change7d),
        marketCapChf: toOptionalNumber(marketCapChf),
        volume24hChf: toOptionalNumber(volume24hChf),
      },
    });

    const responseBody: AiSummaryCacheBody = {
      insight: created,
      usage: usage ?? null,
      cached: false,
    };

    await redis.set(cacheKey, responseBody, {
      ex: AI_SUMMARY_CACHE_TTL_SECONDS,
    });

    return NextResponse.json(responseBody, {
      status: 201,
      headers: {
        ...rateLimitHeaders,
        "Cache-Control": "no-store",
        "X-AI-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("AI market summary failed:", error);

    return NextResponse.json(
      {
        error: "Failed to generate market summary.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
