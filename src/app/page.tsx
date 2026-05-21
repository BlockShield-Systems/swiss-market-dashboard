import Link from "next/link";
import type { Metadata } from "next";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Building2,
  CloudSun,
  Database,
  Flag,
  Globe,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { MarketOverviewChart } from "@/components/crypto/market-overview-chart";
import { ArchitectureBadges } from "@/components/dashboard/architecture-badges";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrentConditions } from "@/components/weather/current-conditions";
import { getCachedCryptoGlobalData } from "@/lib/data/crypto-global";
import { getCachedWeatherForecast } from "@/lib/data/weather-forecast";
import { marketInsightsEnabled } from "@/lib/flags";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { SWISS_CITIES } from "@/lib/types/weather";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return {
    title: t.home.title,
    description: t.home.description,
  };
}

function formatNumberByLocale(value: number, locale: "de" | "en") {
  return value.toLocaleString(locale === "de" ? "de-CH" : "en-CH");
}

function formatMarketCapTrillionChf(value: number, locale: "de" | "en") {
  const trillions = value / 1e12;
  const formatted = trillions.toLocaleString(
    locale === "de" ? "de-CH" : "en-CH",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  );

  return locale === "de" ? `${formatted} Bio. CHF` : `${formatted} T CHF`;
}

function formatTemperature(value: number, locale: "de" | "en") {
  return value.toLocaleString(locale === "de" ? "de-CH" : "en-CH", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export default async function HomePage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  const [cryptoGlobalResult, zurichWeatherResult, marketInsightsResult] =
    await Promise.allSettled([
      getCachedCryptoGlobalData(),
      getCachedWeatherForecast(SWISS_CITIES[0]),
      marketInsightsEnabled(),
    ]);

  if (cryptoGlobalResult.status === "rejected") {
    console.error(
      "Failed to load crypto global data for dashboard:",
      cryptoGlobalResult.reason,
    );
  }

  if (zurichWeatherResult.status === "rejected") {
    console.error(
      "Failed to load Zurich weather data for dashboard:",
      zurichWeatherResult.reason,
    );
  }

  if (marketInsightsResult.status === "rejected") {
    console.error(
      "Failed to resolve market insights feature flag:",
      marketInsightsResult.reason,
    );
  }

  const globalData =
    cryptoGlobalResult.status === "fulfilled"
      ? cryptoGlobalResult.value.data
      : null;

  const zurichWeather =
    zurichWeatherResult.status === "fulfilled"
      ? zurichWeatherResult.value.data
      : null;

  const showMarketInsights =
    marketInsightsResult.status === "fulfilled"
      ? marketInsightsResult.value
      : false;

  const hasDataWarning = !globalData || !zurichWeather;

  const maxTemp = zurichWeather?.daily.temperature_2m_max[0] ?? null;
  const minTemp = zurichWeather?.daily.temperature_2m_min[0] ?? null;

  const formattedMaxTemp =
    typeof maxTemp === "number" ? formatTemperature(maxTemp, locale) : "–";

  const formattedMinTemp =
    typeof minTemp === "number" ? formatTemperature(minTemp, locale) : "–";

  const resilienceCopy =
    locale === "de"
      ? {
        title: "Daten temporär eingeschränkt",
        description:
          "Ein Teil der externen Markt- oder Wetterdaten konnte nicht geladen werden. Bereits zwischengespeicherte Daten werden weiterhin genutzt, sofern verfügbar.",
      }
      : {
        title: "Data temporarily limited",
        description:
          "Some external market or weather data could not be loaded. Cached data continues to be used where available.",
      };

  const insightsCopy =
    locale === "de"
      ? {
        eyebrow: "Market Intelligence",
        title: "Postgres-basiertes Market Intelligence Archiv",
        description:
          "Persistente Marktanalysen aus Neon Postgres, modelliert mit Drizzle ORM. Das Modul bildet die Grundlage für AI-generierte Marktberichte, historische Insights und spätere Premium- oder Admin-Funktionen.",
        primaryAction: "Insights ansehen",
        postgres: "Neon Postgres",
        postgresDescription: "Persistente SQL-Datenschicht",
        flags: "Feature Flags",
        flagsDescription: "Kontrollierter Modul-Rollout",
        aiReady: "AI-ready",
        aiReadyDescription: "Gateway, Rate Limit und Cache vorbereitet",
        productionLayer: "Produktionsnaher Layer",
      }
      : {
        eyebrow: "Market Intelligence",
        title: "Postgres-backed market intelligence archive",
        description:
          "Persistent market insights stored in Neon Postgres and modeled with Drizzle ORM. This module prepares the platform for AI-generated summaries, historical intelligence records, and future premium or admin workflows.",
        primaryAction: "View insights",
        postgres: "Neon Postgres",
        postgresDescription: "Persistent SQL data layer",
        flags: "Feature Flags",
        flagsDescription: "Controlled module rollout",
        aiReady: "AI-ready",
        aiReadyDescription: "Gateway, rate limit and cache prepared",
        productionLayer: "Production-oriented layer",
      };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.home.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          {t.home.description}
        </p>
      </div>

      <ArchitectureBadges locale={locale} />

      {hasDataWarning ? (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-amber-600" />
              {resilienceCopy.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {resilienceCopy.description}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t.home.stats.marketCap}
          value={
            globalData
              ? formatMarketCapTrillionChf(
                globalData.total_market_cap_chf,
                locale,
              )
              : "–"
          }
          icon={<TrendingUp className="size-5" />}
          description={
            globalData ? t.home.statDescriptions.totalMarket : t.crypto.loadError
          }
        />

        <StatsCard
          title={t.home.stats.activeCoins}
          value={
            globalData
              ? formatNumberByLocale(
                globalData.active_cryptocurrencies,
                locale,
              )
              : "–"
          }
          icon={<Globe className="size-5" />}
          description={
            globalData
              ? t.home.statDescriptions.listedOnCoinGecko
              : t.crypto.loadError
          }
        />

        <StatsCard
          title={t.home.stats.zurichToday}
          value={typeof maxTemp === "number" ? `${formattedMaxTemp}°C` : "–"}
          icon={<CloudSun className="size-5" />}
          description={
            typeof minTemp === "number"
              ? `${t.home.statDescriptions.minPrefix} ${formattedMinTemp}°C`
              : t.weather.loadError
          }
        />

        <StatsCard
          title={t.home.stats.swissCities}
          value={SWISS_CITIES.length.toString()}
          icon={<Building2 className="size-5" />}
          description={t.home.statDescriptions.monitoring}
        />
      </div>

      {showMarketInsights && (
        <Card className="overflow-hidden border-primary/20 bg-linear-to-br from-primary/5 via-background to-background transition-shadow hover:shadow-md">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Database className="size-3" />
                {insightsCopy.eyebrow}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <ShieldCheck className="size-3" />
                {insightsCopy.productionLayer}
              </Badge>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
              <div className="space-y-2">
                <CardTitle className="text-xl md:text-2xl">
                  {insightsCopy.title}
                </CardTitle>
                <p className="max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
                  {insightsCopy.description}
                </p>
              </div>

              <Button asChild>
                <Link href="/insights">
                  {insightsCopy.primaryAction}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border bg-background/70 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Database className="size-4 text-primary" />
                  {insightsCopy.postgres}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {insightsCopy.postgresDescription}
                </p>
              </div>

              <div className="rounded-lg border bg-background/70 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Flag className="size-4 text-primary" />
                  {insightsCopy.flags}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {insightsCopy.flagsDescription}
                </p>
              </div>

              <div className="rounded-lg border bg-background/70 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Bot className="size-4 text-primary" />
                  {insightsCopy.aiReady}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {insightsCopy.aiReadyDescription}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <MarketOverviewChart />
        <CurrentConditions city={SWISS_CITIES[0]} />
      </div>
    </div>
  );
}
