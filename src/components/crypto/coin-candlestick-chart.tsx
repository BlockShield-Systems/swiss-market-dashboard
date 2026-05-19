"use client";

import { useEffect, useRef, useState } from "react";
import type {
  CandlestickData,
  IChartApi,
  UTCTimestamp,
} from "lightweight-charts";
import { usePreferences } from "@/components/preferences-provider";
import { getDictionary, type Locale } from "@/lib/i18n";
import type {
  CryptoChartDays,
  CryptoOhlcPoint,
} from "@/lib/types/crypto";

interface CoinCandlestickChartProps {
  coinId: string;
  days: CryptoChartDays;
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

function getCssColorVariable(name: string, fallback: string): string {
  if (typeof window === "undefined") {
    return fallback;
  }

  const value = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();

  if (!value) {
    return fallback;
  }

  const normalized = value.toLowerCase();

  if (
    normalized.startsWith("#") ||
    normalized.startsWith("rgb(") ||
    normalized.startsWith("rgba(") ||
    normalized.startsWith("hsl(") ||
    normalized.startsWith("hsla(") ||
    normalized.startsWith("oklch(") ||
    normalized.startsWith("oklab(") ||
    normalized.startsWith("color(")
  ) {
    return value;
  }

  return `hsl(${value})`;
}

function toCandlestickData(
  data: CryptoOhlcPoint[],
): CandlestickData<UTCTimestamp>[] {
  return data.map((point) => ({
    time: Math.floor(point.timestamp / 1000) as UTCTimestamp,
    open: point.open,
    high: point.high,
    low: point.low,
    close: point.close,
  }));
}

export function CoinCandlestickChart({
  coinId,
  days,
}: CoinCandlestickChartProps) {
  const { locale } = usePreferences();
  const t = getDictionary(locale);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [data, setData] = useState<CryptoOhlcPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadOhlcData() {
      setIsLoading(true);
      setError(null);
      setData([]);

      try {
        const response = await fetch(
          `/api/crypto/${encodeURIComponent(coinId)}/ohlc?days=${days}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error(`OHLC request failed: ${response.status}`);
        }

        const nextData = (await response.json()) as CryptoOhlcPoint[];

        if (!ignore) {
          setData(nextData);
        }
      } catch (fetchError) {
        console.error("Failed to fetch OHLC data:", fetchError);

        if (!ignore) {
          setError(t.crypto.detail.chartOhlcLoadError);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadOhlcData();

    return () => {
      ignore = true;
    };
  }, [coinId, days, t.crypto.detail.chartOhlcLoadError]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || data.length === 0) {
      return;
    }

    let chart: IChartApi | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let cancelled = false;

    async function renderChart() {
      const {
        CandlestickSeries,
        ColorType,
        CrosshairMode,
        createChart,
      } = await import("lightweight-charts");

      if (cancelled || !containerRef.current) {
        return;
      }

      const containerElement = containerRef.current;

      const backgroundColor = getCssColorVariable("--card", "#ffffff");
      const textColor = getCssColorVariable("--foreground", "#111827");
      const gridColor = getCssColorVariable("--border", "#e5e7eb");

      chart = createChart(containerElement, {
        width: Math.max(containerElement.clientWidth, 320),
        height: 380,
        layout: {
          background: {
            type: ColorType.Solid,
            color: backgroundColor,
          },
          textColor,
        },
        grid: {
          vertLines: {
            color: gridColor,
          },
          horzLines: {
            color: gridColor,
          },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
        },
        localization: {
          priceFormatter: (price: number) => formatPrice(price, locale),
        },
        rightPriceScale: {
          borderColor: gridColor,
          visible: true,
        },
        timeScale: {
          borderColor: gridColor,
          timeVisible: true,
          secondsVisible: false,
          rightOffset: 4,
          barSpacing: 10,
        },
        handleScroll: {
          mouseWheel: true,
          pressedMouseMove: true,
          horzTouchDrag: true,
          vertTouchDrag: false,
        },
        handleScale: {
          axisPressedMouseMove: true,
          mouseWheel: true,
          pinch: true,
        },
      });

      const candlestickSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#16a34a",
        downColor: "#dc2626",
        borderUpColor: "#16a34a",
        borderDownColor: "#dc2626",
        wickUpColor: "#16a34a",
        wickDownColor: "#dc2626",
      });

      candlestickSeries.setData(toCandlestickData(data));
      chart.timeScale().fitContent();

      resizeObserver = new ResizeObserver(([entry]) => {
        if (!entry || !chart) {
          return;
        }

        chart.applyOptions({
          width: Math.max(Math.floor(entry.contentRect.width), 320),
          height: 380,
        });
      });

      resizeObserver.observe(containerElement);
    }

    void renderChart();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      chart?.remove();
    };
  }, [data, locale]);

  return (
    <div className="space-y-3">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">
          {t.crypto.detail.chartOhlcLoading}
        </p>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}

      {!isLoading && !error && data.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t.crypto.detail.chartOhlcNoData}
        </p>
      ) : null}

      <div
        ref={containerRef}
        className="h-95 w-full overflow-hidden rounded-lg border bg-card"
      />

      <p className="text-xs text-muted-foreground">
        {t.crypto.detail.chartCandlestickHint}{" "}
        <a
          href="https://www.tradingview.com/"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4"
        >
          TradingView
        </a>
        {" · CoinGecko"}
      </p>
    </div>
  );
}
