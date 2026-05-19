"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { usePreferences } from "@/components/preferences-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionary, type Locale } from "@/lib/i18n";
import type {
  CryptoChartDays,
  CryptoMarketChartPoint,
} from "@/lib/types/crypto";

interface CoinPriceChartProps {
  coinId: string;
  initialData: CryptoMarketChartPoint[];
  initialDays?: CryptoChartDays;
}

type ChartDataPoint = CryptoMarketChartPoint & {
  label: string;
};

const CHART_RANGES: CryptoChartDays[] = [7, 30, 90];

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

function getRangeLabel(days: CryptoChartDays, t: ReturnType<typeof getDictionary>) {
  if (days === 7) {
    return t.crypto.detail.chartRange7d;
  }

  if (days === 30) {
    return t.crypto.detail.chartRange30d;
  }

  return t.crypto.detail.chartRange90d;
}

export function CoinPriceChart({
  coinId,
  initialData,
  initialDays = 7,
}: CoinPriceChartProps) {
  const { locale } = usePreferences();
  const t = getDictionary(locale);

  const [selectedDays, setSelectedDays] =
    useState<CryptoChartDays>(initialDays);
  const [data, setData] = useState<CryptoMarketChartPoint[]>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const chartData = useMemo<ChartDataPoint[]>(
    () =>
      data.map((point) => ({
        ...point,
        label: formatDateLabel(point.timestamp, locale),
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

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>{t.crypto.detail.priceChartTitle}</CardTitle>

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
      </CardHeader>

      <CardContent className="space-y-3">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}

        {isPending ? (
          <p className="text-sm text-muted-foreground">
            {t.crypto.detail.chartLoading}
          </p>
        ) : null}

        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData}>
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

            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatAxisPrice(Number(value), locale)}
              width={70}
            />
            <Tooltip
              formatter={(value) => [
                formatPrice(Number(value), locale),
                t.crypto.detail.price,
              ]}
              labelFormatter={(label) => `${t.crypto.detail.date}: ${label}`}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#3b82f6"
              fill="url(#coinPriceGradient)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              name={t.crypto.detail.price}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
