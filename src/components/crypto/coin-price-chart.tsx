"use client";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { CryptoMarketChartPoint } from "@/lib/types/crypto";

interface CoinPriceChartProps {
  data: CryptoMarketChartPoint[];
}

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

export function CoinPriceChart({ data }: CoinPriceChartProps) {
  const { locale } = usePreferences();
  const t = getDictionary(locale);

  const chartData = data.map((point) => ({
    ...point,
    label: new Date(point.timestamp).toLocaleDateString(getLocaleCode(locale), {
      day: "2-digit",
      month: "2-digit",
    }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.crypto.detail.priceChartTitle}</CardTitle>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="coinPriceGradient" x1="0" y1="0" x2="0" y2="1">
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
