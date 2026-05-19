import { NextResponse } from "next/server";
import { fetchCoinMarketChart } from "@/lib/api/coingecko";
import type { CryptoChartDays } from "@/lib/types/crypto";

interface MarketChartRouteContext {
  params: Promise<{
    id: string;
  }>;
}

const ALLOWED_DAYS: CryptoChartDays[] = [7, 30, 90];

function parseChartDays(value: string | null): CryptoChartDays {
  const parsed = Number(value ?? 7);

  if (ALLOWED_DAYS.includes(parsed as CryptoChartDays)) {
    return parsed as CryptoChartDays;
  }

  return 7;
}

export async function GET(
  request: Request,
  { params }: MarketChartRouteContext,
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const days = parseChartDays(searchParams.get("days"));

  if (!id || id.trim().length === 0) {
    return NextResponse.json(
      { error: "Missing coin id." },
      { status: 400 },
    );
  }

  try {
    const data = await fetchCoinMarketChart(id, days);

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Failed to load coin market chart:", error);

    return NextResponse.json(
      { error: "Coin market chart could not be loaded." },
      { status: 502 },
    );
  }
}
