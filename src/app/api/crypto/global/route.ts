import { NextResponse } from "next/server";
import { fetchCryptoGlobalData } from "@/lib/api/coingecko";

export async function GET() {
  try {
    const data = await fetchCryptoGlobalData();

    return NextResponse.json(
      {
        active_cryptocurrencies: data.data.active_cryptocurrencies,
        market_cap_percentage: data.data.market_cap_percentage,
        total_market_cap_chf: data.data.total_market_cap.chf,
        total_volume_chf: data.data.total_volume.chf,
      },
      {
        headers: {
          "Cache-Control": "s-maxage=300, stale-while-revalidate=900",
        },
      },
    );
  } catch {
    return NextResponse.json(
      {
        error: "Failed to fetch crypto market data.",
      },
      {
        status: 502,
      },
    );
  }
}
