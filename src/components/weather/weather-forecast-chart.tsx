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
import { CloudRain, Droplets, Thermometer, Wind } from "lucide-react";
import { usePreferences } from "@/components/preferences-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDictionary, type Locale } from "@/lib/i18n";
import {
  DEFAULT_SWISS_CITY_KEY,
  SWISS_CITIES,
  type SwissCityKey,
  type WeatherData,
} from "@/lib/types/weather";

interface WeatherForecastChartProps {
  initialData: WeatherData;
}

type ChartDataPoint = {
  date: string;
  fullDate: string;
  max: number;
  min: number;
  precipitation: number;
  wind: number;
  weatherCode: number;
  weather: string;
  icon: string;
};

const WMO_ICONS: Record<number, string> = {
  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  45: "🌫️",
  48: "🌫️",
  51: "🌦️",
  53: "🌧️",
  55: "🌧️",
  56: "🌧️",
  57: "🌧️",
  61: "🌧️",
  63: "🌧️",
  65: "🌧️",
  66: "🌧️",
  67: "🌧️",
  71: "🌨️",
  73: "🌨️",
  75: "🌨️",
  77: "🌨️",
  80: "🌦️",
  81: "🌦️",
  82: "🌦️",
  85: "🌨️",
  86: "🌨️",
  95: "⛈️",
  96: "⛈️",
  99: "⛈️",
};

function getLocaleCode(locale: Locale): "de-CH" | "en-CH" {
  return locale === "de" ? "de-CH" : "en-CH";
}

function getWeatherLabel(
  code: number,
  weatherCodes: Record<number, string>,
): string {
  return weatherCodes[code] ?? `Code ${code}`;
}

function getWeatherIcon(code: number): string {
  return WMO_ICONS[code] ?? "❓";
}

function formatDecimal(value: number, locale: Locale): string {
  return new Intl.NumberFormat(getLocaleCode(locale), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

function getAverage(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getTooltipStyle() {
  return {
    backgroundColor: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    color: "var(--foreground)",
    fontSize: "12px",
  };
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold tabular-nums">{value}</p>
      </div>
    </div>
  );
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

  const localeCode = getLocaleCode(locale);

  const chartData = useMemo<ChartDataPoint[]>(() => {
    const weatherCodes = t.weather.weatherCodes as Record<number, string>;

    return data.daily.time.map((time, index) => {
      const weatherCode = data.daily.weather_code[index];

      return {
        date: new Date(time).toLocaleDateString(localeCode, {
          weekday: "short",
          day: "2-digit",
        }),
        fullDate: new Date(time).toLocaleDateString(localeCode, {
          weekday: "long",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        max: data.daily.temperature_2m_max[index],
        min: data.daily.temperature_2m_min[index],
        precipitation: data.daily.precipitation_sum[index],
        wind: data.daily.wind_speed_10m_max[index],
        weatherCode,
        weather: getWeatherLabel(weatherCode, weatherCodes),
        icon: getWeatherIcon(weatherCode),
      };
    });
  }, [data, localeCode, t.weather.weatherCodes]);

  const today = chartData[0];
  const selectedCityLabel = t.weather.cities[selectedCityKey];
  const averageRain = getAverage(data.daily.precipitation_sum);
  const maxWind = Math.max(...data.daily.wind_speed_10m_max);
  const totalRain = data.daily.precipitation_sum.reduce(
    (sum, value) => sum + value,
    0,
  );

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
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle>{t.weather.dailyOverviewTitle}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {selectedCityLabel}
              {today ? ` · ${today.fullDate}` : null}
            </p>

            {error ? (
              <p className="text-xs text-destructive">{error}</p>
            ) : isLoading ? (
              <p className="text-xs text-muted-foreground">
                {t.weather.loading}
              </p>
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

        <CardContent className="space-y-5">
          {today ? (
            <div className="rounded-xl border bg-muted/30 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{today.icon}</span>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t.weather.weatherStateLabel}
                    </p>
                    <p className="text-2xl font-bold">{today.weather}</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <MetricCard
                    icon={<Thermometer className="size-5 text-red-500" />}
                    label={t.weather.maxMinLabel}
                    value={`${formatDecimal(today.max, locale)}° / ${formatDecimal(
                      today.min,
                      locale,
                    )}°`}
                  />

                  <MetricCard
                    icon={<Droplets className="size-5 text-blue-500" />}
                    label={t.weather.precipitationLabel}
                    value={`${formatDecimal(today.precipitation, locale)} mm`}
                  />

                  <MetricCard
                    icon={<Wind className="size-5 text-cyan-500" />}
                    label={t.weather.windMaxLabel}
                    value={`${formatDecimal(today.wind, locale)} km/h`}
                  />

                  <MetricCard
                    icon={<CloudRain className="size-5 text-slate-500" />}
                    label={t.weather.averageRain7dLabel}
                    value={`${formatDecimal(averageRain, locale)} mm`}
                  />
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
            <div className="rounded-lg border bg-card p-3">
              <p className="font-medium text-foreground">
                {t.weather.forecastCardsTitle}
              </p>
              <p>7 Tage · {selectedCityLabel}</p>
            </div>

            <div className="rounded-lg border bg-card p-3">
              <p className="font-medium text-foreground">
                {t.weather.precipitationLabel}
              </p>
              <p>{formatDecimal(totalRain, locale)} mm</p>
            </div>

            <div className="rounded-lg border bg-card p-3">
              <p className="font-medium text-foreground">
                {t.weather.windMaxLabel}
              </p>
              <p>{formatDecimal(maxWind, locale)} km/h</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.weather.forecastCardsTitle}</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {chartData.map((day, index) => (
              <div
                key={day.fullDate}
                className="rounded-xl border bg-card p-4 text-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {index === 0 ? t.weather.todayLabel : day.date}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {day.weather}
                    </p>
                  </div>

                  <span className="text-2xl">{day.icon}</span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">
                      {formatDecimal(day.max, locale)}°
                    </span>{" "}
                    / {formatDecimal(day.min, locale)}°
                  </p>
                  <p>{formatDecimal(day.precipitation, locale)} mm</p>
                  <p>{formatDecimal(day.wind, locale)} km/h</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.weather.temperatureLabel}</CardTitle>
        </CardHeader>

        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={chartData}
              margin={{
                top: 10,
                right: 16,
                left: 0,
                bottom: 8,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis
                unit="°C"
                tick={{ fontSize: 12 }}
                width={48}
                domain={[
                  (dataMin: number) => Math.floor(dataMin - 2),
                  (dataMax: number) => Math.ceil(dataMax + 2),
                ]}
              />
              <Tooltip contentStyle={getTooltipStyle()} />
              <Legend />
              <Line
                type="monotone"
                dataKey="max"
                stroke="#ef4444"
                name={t.weather.maxSeriesLabel}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="min"
                stroke="#3b82f6"
                name={t.weather.minSeriesLabel}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.weather.precipitationChartLabel}</CardTitle>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 16,
                  left: 0,
                  bottom: 8,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis unit="mm" tick={{ fontSize: 12 }} width={48} />
                <Tooltip contentStyle={getTooltipStyle()} />
                <Bar
                  dataKey="precipitation"
                  fill="#60a5fa"
                  name={t.weather.precipitationBarLabel}
                  radius={[6, 6, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.weather.windChartLabel}</CardTitle>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 16,
                  left: 0,
                  bottom: 8,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis unit="km/h" tick={{ fontSize: 12 }} width={56} />
                <Tooltip contentStyle={getTooltipStyle()} />
                <Line
                  type="monotone"
                  dataKey="wind"
                  stroke="#06b6d4"
                  name={t.weather.windMaxLabel}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
