import type { Metadata } from "next";
import { WeatherForecastChart } from "@/components/weather/weather-forecast-chart";
import { fetchWeatherForecast } from "@/lib/api/openmeteo";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { DEFAULT_SWISS_CITY } from "@/lib/types/weather";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return {
    title: t.weather.title,
    description: t.weather.description,
  };
}

export default async function WeatherPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  const initialData = await fetchWeatherForecast(DEFAULT_SWISS_CITY);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.weather.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          {t.weather.description}
        </p>
      </div>

      <WeatherForecastChart initialData={initialData} />
    </div>
  );
}
