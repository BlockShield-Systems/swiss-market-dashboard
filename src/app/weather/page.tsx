import type { Metadata } from "next";
import { Info } from "lucide-react";
import { WeatherForecastChart } from "@/components/weather/weather-forecast-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const legendItems = [
    t.weather.legend.temperature,
    t.weather.legend.precipitation,
    t.weather.legend.wind,
    t.weather.legend.weatherCode,
    t.weather.legend.source,
  ];

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
          <ul className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
            {legendItems.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <WeatherForecastChart initialData={initialData} />
    </div>
  );
}
