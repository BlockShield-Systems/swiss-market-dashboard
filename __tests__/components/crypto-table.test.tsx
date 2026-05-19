import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { CryptoTable } from "@/components/crypto/crypto-table";
import type { CryptoCoin } from "@/lib/types/crypto";

jest.mock("@/components/preferences-provider", () => ({
  usePreferences: () => ({
    locale: "de",
  }),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    width,
    height,
    className,
  }: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  ),
}));

const mockCoins: CryptoCoin[] = [
  {
    id: "bitcoin",
    symbol: "btc",
    name: "Bitcoin",
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    current_price: 95000,
    market_cap: 1_800_000_000_000,
    market_cap_rank: 1,
    total_volume: 45_000_000_000,
    price_change_percentage_24h: 5.23,
    price_change_percentage_7d_in_currency: 12.45,
    price_change_percentage_7d: 12.45,
    sparkline_in_7d: {
      price: [90000, 92000, 95000],
    },
  },
  {
    id: "ethereum",
    symbol: "eth",
    name: "Ethereum",
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    current_price: 3200,
    market_cap: 390_000_000_000,
    market_cap_rank: 2,
    total_volume: 18_000_000_000,
    price_change_percentage_24h: -2.14,
    price_change_percentage_7d_in_currency: -4.56,
    price_change_percentage_7d: -4.56,
    sparkline_in_7d: {
      price: [3300, 3250, 3200],
    },
  },
];

describe("CryptoTable", () => {
  it("renders coin name and symbol", () => {
    render(<CryptoTable data={mockCoins} />);

    expect(screen.getByText("Bitcoin")).toBeInTheDocument();
    expect(screen.getByText("BTC")).toBeInTheDocument();

    expect(screen.getByText("Ethereum")).toBeInTheDocument();
    expect(screen.getByText("ETH")).toBeInTheDocument();
  });

  it("shows positive 24h change", () => {
    render(<CryptoTable data={mockCoins} />);

    expect(screen.getByText(/5[.,]23%/)).toBeInTheDocument();
  });

  it("shows negative 24h change", () => {
    render(<CryptoTable data={mockCoins} />);

    expect(screen.getByText(/-2[.,]14%/)).toBeInTheDocument();
  });

  it("renders 7d change values", () => {
    render(<CryptoTable data={mockCoins} />);

    expect(screen.getByText(/\+12[.,]45%/)).toBeInTheDocument();
    expect(screen.getByText(/-4[.,]56%/)).toBeInTheDocument();
  });

  it("renders table column labels from i18n", () => {
    render(<CryptoTable data={mockCoins} />);

    expect(screen.getByText("#")).toBeInTheDocument();
    expect(screen.getByText("Coin")).toBeInTheDocument();
    expect(screen.getByText("Preis")).toBeInTheDocument();
    expect(screen.getByText("24h")).toBeInTheDocument();
    expect(screen.getByText("7d")).toBeInTheDocument();
    expect(screen.getByText("Market Cap")).toBeInTheDocument();
    expect(screen.getByText("Volumen")).toBeInTheDocument();
  });
});
