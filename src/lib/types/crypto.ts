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

export type SortField =
  | "market_cap_rank"
  | "current_price"
  | "price_change_percentage_24h"
  | "price_change_percentage_7d_in_currency"
  | "market_cap"
  | "total_volume";

export type SortDirection = "asc" | "desc";
