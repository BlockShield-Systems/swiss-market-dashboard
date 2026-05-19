"use client";

import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { usePreferences } from "@/components/preferences-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getDictionary } from "@/lib/i18n";

const COLORS = [
  "#3b82f6",
  "#f59e0b",
  "#10b981",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
  "#f97316",
  "#84cc16",
];

interface MarketShare {
  name: string;
  value: number;
}

interface CryptoGlobalApiResponse {
  active_cryptocurrencies: number;
  market_cap_percentage: Record<string, number>;
  total_market_cap_chf: number;
  total_volume_chf: number;
}

export function MarketOverviewChart() {
  const { locale } = usePreferences();
  const t = getDictionary(locale);

  const [data, setData] = useState<MarketShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setHasError(false);

        const res = await fetch("/api/crypto/global", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Crypto global request failed with status ${res.status}`);
        }

        const json = (await res.json()) as CryptoGlobalApiResponse;

        const shares: MarketShare[] = Object.entries(
          json.market_cap_percentage,
        )
          .slice(0, 8)
          .map(([name, value]) => ({
            name: name.toUpperCase(),
            value,
          }));

        setData(shares);
      } catch (error) {
        console.error("Failed to load crypto market overview:", error);
        setHasError(true);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.crypto.marketShareTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (hasError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.crypto.marketShareTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            {t.crypto.marketShareError}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.crypto.marketShareTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={({ name, value }) => `${name} ${value.toFixed(1)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `${(value as number).toFixed(1)}%`}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
