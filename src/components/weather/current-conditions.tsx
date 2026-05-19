import { CloudRain, Droplets, Thermometer, Wind } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchWeatherForecast } from "@/lib/api/openmeteo";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import type { SwissCity } from "@/lib/types/weather";

interface CurrentConditionsProps {
  city: SwissCity;
}

const WMO_ICONS: Record<number, string> = {
  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  45: "🌫️",
  48: "🌫️",
  51: "🌧️",
  53: "🌧️",
  55: "🌧️",
  61: "🌧️",
  63: "🌧️",
  65: "🌧️",
  71: "🌨️",
  73: "🌨️",
  75: "🌨️",
  80: "🌦️",
  81: "🌦️",
  82: "🌦️",
  95: "⛈️",
  96: "⛈️",
  99: "⛈️",
};

export async function CurrentConditions({ city }: CurrentConditionsProps) {
  const locale = await getLocale();
  const t = getDictionary(locale);

  const cityName = t.weather.cities[city.key];

  const numberFormat = new Intl.NumberFormat(
    locale === "de" ? "de-CH" : "en-CH",
    {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    },
  );

  let data;

  try {
    data = await fetchWeatherForecast(city);
  } catch {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {t.weather.currentConditionsTitle} – {cityName}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-destructive">{t.weather.loadError}</p>
        </CardContent>
      </Card>
    );
  }

  const todayMax = data.daily.temperature_2m_max[0];
  const todayMin = data.daily.temperature_2m_min[0];
  const todayPrecip = data.daily.precipitation_sum[0];
  const todayWind = data.daily.wind_speed_10m_max[0];
  const weatherCode = data.daily.weather_code[0];
  const weatherEmoji = WMO_ICONS[weatherCode] ?? "❓";

  const precipitationAverage =
    data.daily.precipitation_sum.reduce((sum, value) => sum + value, 0) /
    data.daily.precipitation_sum.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-3xl">{weatherEmoji}</span>
          <span>
            {t.weather.currentConditionsTitle} – {cityName}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <Thermometer className="size-5 text-red-500" />
            <div>
              <p className="text-xs text-muted-foreground">
                {t.weather.maxMinLabel}
              </p>
              <p className="text-lg font-bold tabular-nums">
                {numberFormat.format(todayMax)}° /{" "}
                {numberFormat.format(todayMin)}°
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border p-4">
            <Droplets className="size-5 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">
                {t.weather.precipitationLabel}
              </p>
              <p className="text-lg font-bold tabular-nums">
                {numberFormat.format(todayPrecip)} mm
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border p-4">
            <Wind className="size-5 text-cyan-500" />
            <div>
              <p className="text-xs text-muted-foreground">
                {t.weather.windMaxLabel}
              </p>
              <p className="text-lg font-bold tabular-nums">
                {numberFormat.format(todayWind)} km/h
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border p-4">
            <CloudRain className="size-5 text-gray-500" />
            <div>
              <p className="text-xs text-muted-foreground">
                {t.weather.averageRain7dLabel}
              </p>
              <p className="text-lg font-bold tabular-nums">
                {numberFormat.format(precipitationAverage)} mm
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
