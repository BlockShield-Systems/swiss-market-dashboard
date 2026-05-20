"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Area,
  AreaChart,
  Brush,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CoinCandlestickChart } from "@/components/crypto/coin-candlestick-chart";
import { usePreferences } from "@/components/preferences-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionary, type Locale } from "@/lib/i18n";
import type {
  CryptoChartDays,
  CryptoChartMode,
  CryptoMarketChartPoint,
} from "@/lib/types/crypto";

interface CoinPriceChartProps {
  coinId: string;
  initialData: CryptoMarketChartPoint[];
  initialDays?: CryptoChartDays;
  initialMode?: CryptoChartMode;
}

type ChartDataPoint = CryptoMarketChartPoint & {
  label: string;
  tooltipLabel: string;
};

const CHART_RANGES: CryptoChartDays[] = [7, 30, 90];
const CHART_MODES: CryptoChartMode[] = ["area", "line", "candlestick"];

function getLocaleCode(locale: Locale): "de-CH" | "en-CH" {
  return locale === "de" ? "de-CH" : "en-CH";
}

function formatPrice(value: number, locale: Locale): string {
  return new Intl.NumberFormat(getLocaleCode(locale), {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: 2,
    maximumFractionDigits: value < 1 ? 6 : 2,
  }).format(value);
}

function formatAxisPrice(value: number, locale: Locale): string {
  return new Intl.NumberFormat(getLocaleCode(locale), {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatDateLabel(timestamp: number, locale: Locale): string {
  return new Date(timestamp).toLocaleDateString(getLocaleCode(locale), {
    day: "2-digit",
    month: "2-digit",
  });
}

function formatTooltipDateLabel(timestamp: number, locale: Locale): string {
  return new Date(timestamp).toLocaleString(getLocaleCode(locale), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getRangeLabel(
  days: CryptoChartDays,
  t: ReturnType<typeof getDictionary>,
) {
  if (days === 7) {
    return t.crypto.detail.chartRange7d;
  }

  if (days === 30) {
    return t.crypto.detail.chartRange30d;
  }

  return t.crypto.detail.chartRange90d;
}

function getChartModeLabel(
  mode: CryptoChartMode,
  t: ReturnType<typeof getDictionary>,
): string {
  if (mode === "area") {
    return t.crypto.detail.chartModeArea;
  }

  if (mode === "line") {
    return t.crypto.detail.chartModeLine;
  }

  return t.crypto.detail.chartModeCandlestick;
}

export function CoinPriceChart({
  coinId,
  initialData,
  initialDays = 7,
  initialMode = "area",
}: CoinPriceChartProps) {
  const { locale } = usePreferences();
  const t = getDictionary(locale);

  const [selectedDays, setSelectedDays] =
    useState<CryptoChartDays>(initialDays);

  const [selectedChartMode, setSelectedChartMode] =
    useState<CryptoChartMode>(initialMode);

  const [data, setData] = useState<CryptoMarketChartPoint[]>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const chartData = useMemo<ChartDataPoint[]>(
    () =>
      data.map((point) => ({
        ...point,
        label: formatDateLabel(point.timestamp, locale),
        tooltipLabel: formatTooltipDateLabel(point.timestamp, locale),
      })),
    [data, locale],
  );

  function handleRangeChange(days: CryptoChartDays) {
    if (days === selectedDays || isPending) {
      return;
    }

    setError(null);
    setSelectedDays(days);

    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/crypto/${encodeURIComponent(coinId)}/market-chart?days=${days}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error(`Market chart request failed: ${response.status}`);
        }

        const nextData = (await response.json()) as CryptoMarketChartPoint[];

        setData(nextData);
      } catch (fetchError) {
        console.error("Failed to fetch market chart range:", fetchError);
        setError(t.crypto.detail.chartLoadError);
      }
    });
  }

  const commonAxis = (
    <>
      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />

      <XAxis dataKey="label" tick={{ fontSize: 12 }} minTickGap={24} />

      <YAxis
        tick={{ fontSize: 12 }}
        tickFormatter={(value) => formatAxisPrice(Number(value), locale)}
        width={72}
        domain={["dataMin", "dataMax"]}
      />

      <Tooltip
        formatter={(value) => [
          formatPrice(Number(value), locale),
          t.crypto.detail.price,
        ]}
        labelFormatter={(_, payload) => {
          const point = payload?.[0]?.payload as ChartDataPoint | undefined;

          return point ? `${t.crypto.detail.date}: ${point.tooltipLabel}` : "";
        }}
        contentStyle={{
          backgroundColor: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "8px",
          fontSize: "12px",
        }}
      />
    </>
  );

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle>{t.crypto.detail.priceChartTitle}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {selectedChartMode === "candlestick"
                ? t.crypto.detail.chartCandlestickDescription
                : t.crypto.detail.chartPriceInChf}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {CHART_RANGES.map((days) => (
              <Button
                key={days}
                type="button"
                size="sm"
                variant={selectedDays === days ? "default" : "outline"}
                disabled={isPending}
                onClick={() => handleRangeChange(days)}
              >
                {getRangeLabel(days, t)}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {CHART_MODES.map((mode) => (
            <Button
              key={mode}
              type="button"
              size="sm"
              variant={selectedChartMode === mode ? "default" : "outline"}
              onClick={() => setSelectedChartMode(mode)}
            >
              {getChartModeLabel(mode, t)}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && selectedChartMode !== "candlestick" ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}

        {isPending && selectedChartMode !== "candlestick" ? (
          <p className="text-sm text-muted-foreground">
            {t.crypto.detail.chartLoading}
          </p>
        ) : null}

        <div className="grid gap-3 rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground md:grid-cols-3">
          <div>
            <p className="font-medium text-foreground">
              {t.crypto.detail.chartTimeframe}
            </p>
            <p>{getRangeLabel(selectedDays, t)}</p>
          </div>

          <div>
            <p className="font-medium text-foreground">
              {t.crypto.detail.chartSource}
            </p>
            <p>CoinGecko</p>
          </div>

          <div>
            <p className="font-medium text-foreground">
              {t.crypto.detail.chartMode}
            </p>
            <p>{getChartModeLabel(selectedChartMode, t)}</p>
          </div>
        </div>

        {selectedChartMode === "candlestick" ? (
          <CoinCandlestickChart coinId={coinId} days={selectedDays} />
        ) : (
          <ResponsiveContainer width="100%" height={380}>
            {selectedChartMode === "area" ? (
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 12,
                  left: 0,
                  bottom: 8,
                }}
              >
                <defs>
                  <linearGradient
                    id="coinPriceGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>

                {commonAxis}

                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#3b82f6"
                  fill="url(#coinPriceGradient)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  name={t.crypto.detail.price}
                  isAnimationActive={false}
                />

                <Brush
                  dataKey="label"
                  height={28}
                  stroke="#3b82f6"
                  travellerWidth={8}
                  tickFormatter={(value) => String(value)}
                />
              </AreaChart>
            ) : (
              <LineChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 12,
                  left: 0,
                  bottom: 8,
                }}
              >
                {commonAxis}

                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  name={t.crypto.detail.price}
                  isAnimationActive={false}
                />

                <Brush
                  dataKey="label"
                  height={28}
                  stroke="#3b82f6"
                  travellerWidth={8}
                  tickFormatter={(value) => String(value)}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}

        {selectedChartMode !== "candlestick" ? (
          <p className="text-xs text-muted-foreground">
            {t.crypto.detail.chartBrushHint}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
