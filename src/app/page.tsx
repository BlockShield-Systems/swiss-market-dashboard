import {
  Building2,
  CloudSun,
  Globe,
  TrendingUp,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { MarketOverviewChart } from "@/components/crypto/market-overview-chart";
import { CurrentConditions } from "@/components/weather/current-conditions";
import { fetchCryptoGlobalData } from "@/lib/api/coingecko";
import { fetchWeatherForecast } from "@/lib/api/openmeteo";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { SWISS_CITIES } from "@/lib/types/weather";
import type { Metadata } from "next";

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

  return locale === "de"
    ? `${formatted} Bio. CHF`
    : `${formatted} T CHF`;
}

export default async function HomePage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  const [globalData, zurichWeather] = await Promise.all([
    fetchCryptoGlobalData(),
    fetchWeatherForecast(SWISS_CITIES[0]),
  ]);

  const maxTemp = zurichWeather.daily.temperature_2m_max[0];
  const minTemp = zurichWeather.daily.temperature_2m_min[0];

  const formattedMaxTemp = maxTemp.toLocaleString(
    locale === "de" ? "de-CH" : "en-CH",
    {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    },
  );

  const formattedMinTemp = minTemp.toLocaleString(
    locale === "de" ? "de-CH" : "en-CH",
    {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    },
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.home.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          {t.home.description}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t.home.stats.marketCap}
          value={formatMarketCapTrillionChf(
            globalData.data.total_market_cap.chf,
            locale,
          )}
          icon={<TrendingUp className="size-5" />}
          description={t.home.statDescriptions.totalMarket}
        />

        <StatsCard
          title={t.home.stats.activeCoins}
          value={formatNumberByLocale(
            globalData.data.active_cryptocurrencies,
            locale,
          )}
          icon={<Globe className="size-5" />}
          description={t.home.statDescriptions.listedOnCoinGecko}
        />

        <StatsCard
          title={t.home.stats.zurichToday}
          value={`${formattedMaxTemp}°C`}
          icon={<CloudSun className="size-5" />}
          description={`${t.home.statDescriptions.minPrefix} ${formattedMinTemp}°C`}
        />

        <StatsCard
          title={t.home.stats.swissCities}
          value={SWISS_CITIES.length.toString()}
          icon={<Building2 className="size-5" />}
          description={t.home.statDescriptions.monitoring}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MarketOverviewChart />
        <CurrentConditions city={SWISS_CITIES[0]} />
      </div>
    </div>
  );
}
