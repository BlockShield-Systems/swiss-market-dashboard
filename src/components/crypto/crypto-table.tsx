"use no memo";
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import { usePreferences } from "@/components/preferences-provider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { CryptoCoin } from "@/lib/types/crypto";
import { cn } from "@/lib/utils";

interface CryptoTableProps {
  data: CryptoCoin[];
}

type MarketFilter =
  | "all"
  | "gainers24h"
  | "losers24h"
  | "gainers7d"
  | "losers7d";

function getLocaleCode(locale: Locale): "de-CH" | "en-CH" {
  return locale === "de" ? "de-CH" : "en-CH";
}

function formatPrice(value: number | null, locale: Locale): string {
  if (value === null || !Number.isFinite(value)) {
    return "–";
  }

  return new Intl.NumberFormat(getLocaleCode(locale), {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: 2,
    maximumFractionDigits: value < 1 ? 6 : 2,
  }).format(value);
}

function formatCompactCurrency(value: number | null, locale: Locale): string {
  if (value === null || !Number.isFinite(value)) {
    return "–";
  }

  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  const formatShort = (num: number): string => {
    return new Intl.NumberFormat(getLocaleCode(locale), {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(num);
  };

  const units =
    locale === "de"
      ? {
        trillion: "Bio. CHF",
        billion: "Mrd. CHF",
        million: "Mio. CHF",
        thousand: "Tsd. CHF",
      }
      : {
        trillion: "T CHF",
        billion: "B CHF",
        million: "M CHF",
        thousand: "K CHF",
      };

  if (abs >= 1_000_000_000_000) {
    return `${sign}${formatShort(abs / 1_000_000_000_000)} ${units.trillion}`;
  }

  if (abs >= 1_000_000_000) {
    return `${sign}${formatShort(abs / 1_000_000_000)} ${units.billion}`;
  }

  if (abs >= 1_000_000) {
    return `${sign}${formatShort(abs / 1_000_000)} ${units.million}`;
  }

  if (abs >= 1_000) {
    return `${sign}${formatShort(abs / 1_000)} ${units.thousand}`;
  }

  return formatPrice(value, locale);
}

function formatPercent(value: number | null, locale: Locale): string {
  if (value === null || !Number.isFinite(value)) {
    return "–";
  }

  return `${value >= 0 ? "+" : ""}${new Intl.NumberFormat(
    getLocaleCode(locale),
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(value)}%`;
}

function getChange7d(coin: CryptoCoin): number | null {
  return (
    coin.price_change_percentage_7d_in_currency ??
    coin.price_change_percentage_7d ??
    null
  );
}

function matchesMarketFilter(coin: CryptoCoin, filter: MarketFilter): boolean {
  const change24h = coin.price_change_percentage_24h;
  const change7d = getChange7d(coin);

  switch (filter) {
    case "gainers24h":
      return change24h !== null && change24h > 0;
    case "losers24h":
      return change24h !== null && change24h < 0;
    case "gainers7d":
      return change7d !== null && change7d > 0;
    case "losers7d":
      return change7d !== null && change7d < 0;
    case "all":
    default:
      return true;
  }
}

function ChangeBadge({
  value,
  locale,
}: {
  value: number | null;
  locale: Locale;
}) {
  if (value === null || !Number.isFinite(value)) {
    return <span className="text-sm text-muted-foreground">–</span>;
  }

  const isPositive = value >= 0;

  return (
    <Badge
      variant={isPositive ? "default" : "destructive"}
      className="tabular-nums"
    >
      {isPositive ? (
        <ArrowUp className="mr-1 inline size-3" />
      ) : (
        <ArrowDown className="mr-1 inline size-3" />
      )}
      {formatPercent(value, locale).replace("+", "")}
    </Badge>
  );
}

function ChangeText({
  value,
  locale,
}: {
  value: number | null;
  locale: Locale;
}) {
  if (value === null || !Number.isFinite(value)) {
    return <span className="text-sm text-muted-foreground">–</span>;
  }

  return (
    <span
      className={cn(
        "tabular-nums text-sm",
        value >= 0 ? "text-green-500" : "text-red-500",
      )}
    >
      {formatPercent(value, locale)}
    </span>
  );
}

export function CryptoTable({ data }: CryptoTableProps) {
  const { locale } = usePreferences();
  const t = getDictionary(locale);

  const cryptoTable = t.crypto.table;
  const cryptoFilters = t.crypto.filters;
  const searchPlaceholder = t.crypto.searchPlaceholder;
  const noResults = t.crypto.noResults;
  const openDetailsLabel = t.crypto.detail.openDetails;

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "market_cap_rank",
      desc: false,
    },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [marketFilter, setMarketFilter] = useState<MarketFilter>("all");

  const filteredData = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return data.filter((coin) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        coin.name.toLowerCase().includes(normalizedSearch) ||
        coin.symbol.toLowerCase().includes(normalizedSearch);

      return matchesSearch && matchesMarketFilter(coin, marketFilter);
    });
  }, [data, marketFilter, searchQuery]);

  const columns = useMemo<ColumnDef<CryptoCoin>[]>(
    () => [
      {
        accessorKey: "market_cap_rank",
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {cryptoTable.rank}
            <ArrowUpDown className="size-3" />
          </button>
        ),
        cell: ({ getValue }) => {
          const value = getValue<number | null>();

          return (
            <span className="text-sm tabular-nums text-muted-foreground">
              {value ?? "–"}
            </span>
          );
        },
        size: 60,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {cryptoTable.coin}
            <ArrowUpDown className="size-3" />
          </button>
        ),
        cell: ({ row }) => (
          <Link
            href={`/crypto/${row.original.id}`}
            className="flex w-fit items-center gap-3 rounded-md outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={openDetailsLabel.replace("{coin}", row.original.name)}
          >
            <Image
              src={row.original.image}
              alt={row.original.name}
              width={28}
              height={28}
              className="rounded-full"
            />
            <div className="flex flex-col">
              <span className="font-medium">{row.original.name}</span>
              <span className="text-xs uppercase text-muted-foreground">
                {row.original.symbol.toUpperCase()}
              </span>
            </div>
          </Link>
        ),
        size: 220,
      },
      {
        accessorKey: "current_price",
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {cryptoTable.price}
            <ArrowUpDown className="size-3" />
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="tabular-nums">
            {formatPrice(getValue<number | null>(), locale)}
          </span>
        ),
        size: 150,
      },
      {
        accessorKey: "price_change_percentage_24h",
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {cryptoTable.change24h}
            <ArrowUpDown className="size-3" />
          </button>
        ),
        cell: ({ getValue }) => (
          <ChangeBadge value={getValue<number | null>()} locale={locale} />
        ),
        size: 120,
      },
      {
        id: "price_change_percentage_7d",
        accessorFn: (row) => getChange7d(row),
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {cryptoTable.change7d}
            <ArrowUpDown className="size-3" />
          </button>
        ),
        cell: ({ getValue }) => (
          <ChangeText value={getValue<number | null>()} locale={locale} />
        ),
        size: 110,
      },
      {
        accessorKey: "market_cap",
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {cryptoTable.marketCap}
            <ArrowUpDown className="size-3" />
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="tabular-nums text-sm">
            {formatCompactCurrency(getValue<number | null>(), locale)}
          </span>
        ),
        size: 150,
      },
      {
        accessorKey: "total_volume",
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {cryptoTable.volume}
            <ArrowUpDown className="size-3" />
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="tabular-nums text-sm">
            {formatCompactCurrency(getValue<number | null>(), locale)}
          </span>
        ),
        size: 150,
      },
    ],
    [cryptoTable, locale, openDetailsLabel],
  );

  // TanStack Table v8 ist aktuell als React-Compiler-inkompatibel markiert.
  // "use no memo" oben ist beabsichtigt; diese Suppression hält nur den Editor ruhig.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={marketFilter}
          onValueChange={(value) => setMarketFilter(value as MarketFilter)}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder={cryptoFilters.all} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{cryptoFilters.all}</SelectItem>
            <SelectItem value="gainers24h">
              {cryptoFilters.gainers24h}
            </SelectItem>
            <SelectItem value="losers24h">
              {cryptoFilters.losers24h}
            </SelectItem>
            <SelectItem value="gainers7d">
              {cryptoFilters.gainers7d}
            </SelectItem>
            <SelectItem value="losers7d">
              {cryptoFilters.losers7d}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{
                      width:
                        header.getSize() !== 99999
                          ? header.getSize()
                          : undefined,
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  {noResults}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
