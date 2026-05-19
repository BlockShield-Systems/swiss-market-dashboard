import type {
  CryptoChartDays,
  CryptoCoin,
  CryptoCoinDetails,
  CryptoMarketChartPoint,
  CryptoMarketChartResponse,
  SortDirection,
  SortField,
} from "@/lib/types/crypto";

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

function normalizeChartData(
  data: CryptoMarketChartResponse,
): CryptoMarketChartPoint[] {
  return data.prices.map(([timestamp, price], index) => ({
    timestamp,
    date: new Date(timestamp).toISOString(),
    price,
    marketCap: data.market_caps[index]?.[1] ?? null,
    volume: data.total_volumes[index]?.[1] ?? null,
  }));
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

export async function fetchCoinDetails(
  id: string,
): Promise<CryptoCoinDetails> {
  const searchParams = new URLSearchParams({
    localization: "true",
    tickers: "false",
    market_data: "true",
    community_data: "false",
    developer_data: "false",
    sparkline: "false",
  });

  const res = await fetch(`${BASE_URL}/coins/${id}?${searchParams}`, {
    headers: getHeaders(),
    next: {
      revalidate: 120,
    },
  });

  if (!res.ok) {
    throw new Error(`CoinGecko /coins/${id} error: ${res.status}`);
  }

  return res.json();
}

export async function fetchCoinMarketChart(
  id: string,
  days: CryptoChartDays = 7,
): Promise<CryptoMarketChartPoint[]> {
  const searchParams = new URLSearchParams({
    vs_currency: "chf",
    days: String(days),
  });

  const res = await fetch(`${BASE_URL}/coins/${id}/market_chart?${searchParams}`, {
    headers: getHeaders(),
    next: {
      revalidate: 120,
    },
  });

  if (!res.ok) {
    throw new Error(`CoinGecko /coins/${id}/market_chart error: ${res.status}`);
  }

  const data = (await res.json()) as CryptoMarketChartResponse;

  return normalizeChartData(data);
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
