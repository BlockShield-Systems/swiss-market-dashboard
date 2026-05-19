"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { usePreferences } from "@/components/preferences-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDictionary } from "@/lib/i18n";
import {
  DEFAULT_SWISS_CITY_KEY,
  SWISS_CITIES,
  type SwissCityKey,
  type WeatherData,
} from "@/lib/types/weather";

interface WeatherForecastChartProps {
  initialData: WeatherData;
}

function getWeatherLabel(
  code: number,
  weatherCodes: Record<number, string>,
): string {
  return weatherCodes[code] ?? `Code ${code}`;
}

export function WeatherForecastChart({
  initialData,
}: WeatherForecastChartProps) {
  const { locale } = usePreferences();
  const t = getDictionary(locale);

  const [selectedCityKey, setSelectedCityKey] =
    useState<SwissCityKey>(DEFAULT_SWISS_CITY_KEY);
  const [data, setData] = useState<WeatherData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const localeCode = locale === "de" ? "de-CH" : "en-CH";

  const chartData = useMemo(() => {
    const weatherCodes = t.weather.weatherCodes as Record<number, string>;

    return data.daily.time.map((time, index) => ({
      date: new Date(time).toLocaleDateString(localeCode, {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
      }),
      max: data.daily.temperature_2m_max[index],
      min: data.daily.temperature_2m_min[index],
      precipitation: data.daily.precipitation_sum[index],
      weather: getWeatherLabel(data.daily.weather_code[index], weatherCodes),
    }));
  }, [data, localeCode, t.weather.weatherCodes]);

  async function handleCityChange(cityKey: string) {
    const nextCity = SWISS_CITIES.find((city) => city.key === cityKey);

    if (!nextCity || nextCity.key === selectedCityKey) {
      return;
    }

    const previousCityKey = selectedCityKey;

    setSelectedCityKey(nextCity.key);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/weather?key=${nextCity.key}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Weather fetch failed with status ${response.status}`);
      }

      const newData = (await response.json()) as WeatherData;
      setData(newData);
    } catch (err) {
      console.error("Failed to load weather data:", err);
      setSelectedCityKey(previousCityKey);
      setError(t.weather.loadError);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle>{t.weather.forecastTitle}</CardTitle>

          {error ? (
            <p className="text-xs text-destructive">{error}</p>
          ) : isLoading ? (
            <p className="text-xs text-muted-foreground">{t.weather.loading}</p>
          ) : null}
        </div>

        <Select
          value={selectedCityKey}
          onValueChange={(value) => void handleCityChange(value)}
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder={t.weather.cityLabel} />
          </SelectTrigger>

          <SelectContent>
            {SWISS_CITIES.map((city) => (
              <SelectItem key={city.key} value={city.key}>
                {t.weather.cities[city.key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <h4 className="mb-2 text-sm font-medium text-muted-foreground">
            {t.weather.temperatureLabel}
          </h4>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis unit="°C" tick={{ fontSize: 12 }} width={40} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="max"
                stroke="#ef4444"
                name={t.weather.maxSeriesLabel}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="min"
                stroke="#3b82f6"
                name={t.weather.minSeriesLabel}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-medium text-muted-foreground">
            {t.weather.precipitationChartLabel}
          </h4>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis unit="mm" tick={{ fontSize: 12 }} width={40} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar
                dataKey="precipitation"
                fill="#60a5fa"
                name={t.weather.precipitationBarLabel}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
