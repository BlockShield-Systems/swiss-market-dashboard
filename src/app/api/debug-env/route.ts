import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasCoinGeckoKey: !!process.env.COINGECKO_API_KEY,
    keyLength: (process.env.COINGECKO_API_KEY ?? "").length,
    keyPrefix: (process.env.COINGECKO_API_KEY ?? "").substring(0, 5),
    allEnvKeys: Object.keys(process.env).filter(k => k.includes("COIN")),
  });
}
