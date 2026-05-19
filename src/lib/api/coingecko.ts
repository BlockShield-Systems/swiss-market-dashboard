import type { CryptoCoin, SortDirection, SortField } from "@/lib/types/crypto";

const BASE_URL = "https://api.coingecko.com/api/v3";
const API_KEY = process.env.COINGECKO_API_KEY ?? "";

type CoinGeckoMarketCoin = CryptoCoin;

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/json",
  };

  if (API_KEY) {
    headers["x-cg-demo-api-key"] = API_KEY;
  }

  return headers;
}

function toCoinGeckoOrder(
  sortField: SortField,
  sortDirection: SortDirection,
): string {
  if (sortField === "market_cap_rank" || sortField === "market_cap") {
    return sortDirection === "asc" ? "market_cap_asc" : "market_cap_desc";
  }

  if (sortField === "total_volume") {
    return sortDirection === "asc" ? "volume_asc" : "volume_desc";
  }

  return "market_cap_desc";
}

function normalizeMarketCoin(coin: CoinGeckoMarketCoin): CryptoCoin {
  const change7d =
    coin.price_change_percentage_7d_in_currency ??
    coin.price_change_percentage_7d ??
    null;

  return {
    ...coin,
    current_price: coin.current_price ?? null,
    market_cap: coin.market_cap ?? null,
    market_cap_rank: coin.market_cap_rank ?? null,
    total_volume: coin.total_volume ?? null,
    price_change_percentage_24h: coin.price_change_percentage_24h ?? null,
    price_change_percentage_7d_in_currency: change7d,
    price_change_percentage_7d: change7d,
    sparkline_in_7d: coin.sparkline_in_7d ?? { price: [] },
  };
}

export async function fetchCryptoMarket(
  page: number = 1,
  perPage: number = 50,
  sortField: SortField = "market_cap_rank",
  sortDirection: SortDirection = "asc",
): Promise<CryptoCoin[]> {
  const searchParams = new URLSearchParams({
    vs_currency: "chf",
    order: toCoinGeckoOrder(sortField, sortDirection),
    per_page: String(perPage),
    page: String(page),
    sparkline: "true",
    price_change_percentage: "24h,7d",
    locale: "en",
  });

  const res = await fetch(`${BASE_URL}/coins/markets?${searchParams}`, {
    headers: getHeaders(),
    next: {
      revalidate: 120,
    },
  });

  if (!res.ok) {
    throw new Error(`CoinGecko /coins/markets error: ${res.status}`);
  }

  const coins = (await res.json()) as CoinGeckoMarketCoin[];

  return coins.map(normalizeMarketCoin);
}

export async function fetchCryptoGlobalData(): Promise<{
  data: {
    active_cryptocurrencies: number;
    market_cap_percentage: Record<string, number>;
    total_market_cap: Record<string, number>;
    total_volume: Record<string, number>;
  };
}> {
  const res = await fetch(`${BASE_URL}/global`, {
    headers: getHeaders(),
    next: {
      revalidate: 300,
    },
  });

  if (!res.ok) {
    throw new Error(`CoinGecko Global API error: ${res.status}`);
  }

  return res.json();
}
