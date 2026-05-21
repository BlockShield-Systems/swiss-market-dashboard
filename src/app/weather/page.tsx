import type { Metadata } from "next";
import { AlertTriangle, Info } from "lucide-react";
import { WeatherForecastChart } from "@/components/weather/weather-forecast-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCachedWeatherForecast } from "@/lib/data/weather-forecast";
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

  let initialWeatherResult:
    | Awaited<ReturnType<typeof getCachedWeatherForecast>>
    | null = null;

  try {
    initialWeatherResult = await getCachedWeatherForecast(DEFAULT_SWISS_CITY);
  } catch (error) {
    console.error("Failed to load initial weather forecast page data:", error);
  }

  const legendItems = [
    t.weather.legend.temperature,
    t.weather.legend.precipitation,
    t.weather.legend.wind,
    t.weather.legend.weatherCode,
    t.weather.legend.source,
  ];

  const resilienceCopy =
    locale === "de"
      ? {
        title: "Wetterdaten temporär nicht verfügbar",
        description:
          "Die Open-Meteo-Daten konnten aktuell nicht geladen werden. Bitte versuche es später erneut. Bereits zwischengespeicherte Daten werden weiterhin genutzt, sofern verfügbar.",
      }
      : {
        title: "Weather data temporarily unavailable",
        description:
          "Open-Meteo data could not be loaded right now. Please try again later. Cached data continues to be used where available.",
      };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.weather.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          {t.weather.description}
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="size-4" />
            {t.weather.legend.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2 md:gap-x-8">
            <ul className="space-y-3">
              {legendItems.slice(0, 3).map((item) => (
                <li
                  key={item}
                  className="grid grid-cols-[0.375rem_1fr] items-start gap-3 leading-6"
                >
                  <span className="mt-2 size-1.5 rounded-full bg-primary" />
                  <span className="min-w-0">{item}</span>
                </li>
              ))}
            </ul>
            <ul className="space-y-3">
              {legendItems.slice(3).map((item) => (
                <li
                  key={item}
                  className="grid grid-cols-[0.375rem_1fr] items-start gap-3 leading-6"
                >
                  <span className="mt-2 size-1.5 rounded-full bg-primary" />
                  <span className="min-w-0">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {initialWeatherResult ? (
        <WeatherForecastChart initialData={initialWeatherResult.data} />
      ) : (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-destructive" />
              {resilienceCopy.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {resilienceCopy.description}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
