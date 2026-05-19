export interface CryptoCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number | null;
  market_cap: number | null;
  market_cap_rank: number | null;
  total_volume: number | null;
  price_change_percentage_24h: number | null;

  /**
   * CoinGecko /coins/markets returns this field when
   * price_change_percentage includes "7d".
   */
  price_change_percentage_7d_in_currency?: number | null;

  /**
   * Backward-compatible local/legacy field.
   */
  price_change_percentage_7d?: number | null;

  sparkline_in_7d?: {
    price: number[];
  };
}

export interface CryptoCoinDetails {
  id: string;
  symbol: string;
  name: string;
  description?: {
    en?: string;
    de?: string;
    [locale: string]: string | undefined;
  };
  image: {
    thumb?: string;
    small?: string;
    large?: string;
  };
  links: {
    homepage?: string[];
    blockchain_site?: string[];
  };
  categories?: string[];
  market_cap_rank: number | null;
  market_data: {
    current_price: Record<string, number | undefined>;
    market_cap: Record<string, number | undefined>;
    total_volume: Record<string, number | undefined>;
    price_change_percentage_24h: number | null;
    price_change_percentage_7d: number | null;
    circulating_supply: number | null;
    total_supply: number | null;
    max_supply: number | null;
    ath: Record<string, number | undefined>;
    atl: Record<string, number | undefined>;
  };
}

export interface CryptoMarketChartResponse {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface CryptoMarketChartPoint {
  timestamp: number;
  date: string;
  price: number;
  marketCap: number | null;
  volume: number | null;
}

export type CryptoChartDays = 7 | 30 | 90;

export type SortField =
  | "market_cap_rank"
  | "current_price"
  | "price_change_percentage_24h"
  | "price_change_percentage_7d_in_currency"
  | "market_cap"
  | "total_volume";

export type SortDirection = "asc" | "desc";
