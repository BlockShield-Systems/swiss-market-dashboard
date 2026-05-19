import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { CoinPriceChart } from "@/components/crypto/coin-price-chart";
import { ExpandableDescription } from "@/components/crypto/expandable-description";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchCoinDetails, fetchCoinMarketChart } from "@/lib/api/coingecko";
import { getDictionary, type Locale } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import type { CryptoCoinDetails } from "@/lib/types/crypto";

interface CoinDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

function getLocaleCode(locale: Locale): "de-CH" | "en-CH" {
  return locale === "de" ? "de-CH" : "en-CH";
}

function formatPrice(value: number | null | undefined, locale: Locale): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "–";
  }

  return new Intl.NumberFormat(getLocaleCode(locale), {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: 2,
    maximumFractionDigits: value < 1 ? 6 : 2,
  }).format(value);
}

function formatNumber(value: number | null | undefined, locale: Locale): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "–";
  }

  return new Intl.NumberFormat(getLocaleCode(locale), {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompactCurrency(
  value: number | null | undefined,
  locale: Locale,
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "–";
  }

  return new Intl.NumberFormat(getLocaleCode(locale), {
    style: "currency",
    currency: "CHF",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(
  value: number | null | undefined,
  locale: Locale,
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
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

function stripHtml(value: string | undefined): string {
  if (!value) {
    return "";
  }

  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getDescription(coin: CryptoCoinDetails, locale: Locale): string {
  const preferredDescription =
    locale === "de" ? coin.description?.de : coin.description?.en;

  const fallbackDescription =
    locale === "de" ? coin.description?.en : coin.description?.de;

  return stripHtml(preferredDescription || fallbackDescription || "");
}

function getPrimaryHomepage(coin: CryptoCoinDetails): string | null {
  const homepage = coin.links.homepage?.find((url) => url.trim().length > 0);

  return homepage ?? null;
}

function getPrimaryExplorer(coin: CryptoCoinDetails): string | null {
  const explorer = coin.links.blockchain_site?.find(
    (url) => url.trim().length > 0,
  );

  return explorer ?? null;
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xl font-bold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

function ChangeBadge({
  value,
  locale,
}: {
  value: number | null;
  locale: Locale;
}) {
  if (value === null || !Number.isFinite(value)) {
    return <Badge variant="secondary">–</Badge>;
  }

  return (
    <Badge
      variant={value >= 0 ? "default" : "destructive"}
      className="tabular-nums"
    >
      {formatPercent(value, locale)}
    </Badge>
  );
}

export async function generateMetadata({
  params,
}: CoinDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const locale = await getLocale();
  const t = getDictionary(locale);

  try {
    const coin = await fetchCoinDetails(id);

    return {
      title: `${coin.name} | ${t.crypto.title}`,
      description: getDescription(coin, locale) || t.crypto.description,
    };
  } catch {
    return {
      title: t.crypto.detail.notFoundTitle,
      description: t.crypto.detail.loadError,
    };
  }
}

export default async function CoinDetailPage({ params }: CoinDetailPageProps) {
  const { id } = await params;
  const locale = await getLocale();
  const t = getDictionary(locale);

  let coin: CryptoCoinDetails;
  let chartData;

  try {
    [coin, chartData] = await Promise.all([
      fetchCoinDetails(id),
      fetchCoinMarketChart(id, 7),
    ]);
  } catch (err) {
    console.error("Failed to load coin detail page:", err);

    return (
      <div className="space-y-6">
        <Button asChild variant="ghost">
          <Link href="/crypto">
            <ArrowLeft className="mr-2 size-4" />
            {t.crypto.detail.backToMarket}
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{t.crypto.detail.notFoundTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">
              {t.crypto.detail.loadError}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const description = getDescription(coin, locale);
  const homepage = getPrimaryHomepage(coin);
  const explorer = getPrimaryExplorer(coin);

  const imageUrl = coin.image.large ?? coin.image.small ?? coin.image.thumb;
  const currentPrice = coin.market_data.current_price.chf;
  const marketCap = coin.market_data.market_cap.chf;
  const totalVolume = coin.market_data.total_volume.chf;
  const ath = coin.market_data.ath.chf;
  const atl = coin.market_data.atl.chf;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost">
        <Link href="/crypto">
          <ArrowLeft className="mr-2 size-4" />
          {t.crypto.detail.backToMarket}
        </Link>
      </Button>

      <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={coin.name}
              width={64}
              height={64}
              className="rounded-full"
              priority
            />
          ) : null}

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {coin.name}
              </h1>
              <Badge variant="secondary">
                {coin.symbol.toUpperCase()}
              </Badge>
              {coin.market_cap_rank ? (
                <Badge variant="outline">
                  {t.crypto.detail.rank} #{coin.market_cap_rank}
                </Badge>
              ) : null}
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {t.crypto.detail.detailDescription}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 md:items-end">
          <p className="text-3xl font-bold tabular-nums">
            {formatPrice(currentPrice, locale)}
          </p>

          <div className="flex gap-2">
            <ChangeBadge
              value={coin.market_data.price_change_percentage_24h}
              locale={locale}
            />
            <ChangeBadge
              value={coin.market_data.price_change_percentage_7d}
              locale={locale}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t.crypto.detail.marketCap}
          value={formatCompactCurrency(marketCap, locale)}
        />
        <StatCard
          label={t.crypto.detail.volume}
          value={formatCompactCurrency(totalVolume, locale)}
        />
        <StatCard
          label={t.crypto.detail.ath}
          value={formatPrice(ath, locale)}
        />
        <StatCard
          label={t.crypto.detail.atl}
          value={formatPrice(atl, locale)}
        />
      </div>

      <CoinPriceChart coinId={coin.id} initialData={chartData} initialDays={7} />

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t.crypto.detail.aboutCoin}</CardTitle>
          </CardHeader>
          <CardContent>
            {description ? (
              <ExpandableDescription
                text={description}
                showMoreLabel={t.crypto.detail.showMore}
                showLessLabel={t.crypto.detail.showLess}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {t.crypto.detail.noDescription}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t.crypto.detail.marketData}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                {t.crypto.detail.circulatingSupply}
              </p>
              <p className="font-medium tabular-nums">
                {formatNumber(coin.market_data.circulating_supply, locale)}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                {t.crypto.detail.totalSupply}
              </p>
              <p className="font-medium tabular-nums">
                {formatNumber(coin.market_data.total_supply, locale)}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                {t.crypto.detail.maxSupply}
              </p>
              <p className="font-medium tabular-nums">
                {formatNumber(coin.market_data.max_supply, locale)}
              </p>
            </div>

            {coin.categories && coin.categories.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {t.crypto.detail.categories}
                </p>
                <div className="flex flex-wrap gap-2">
                  {coin.categories.slice(0, 6).map((category) => (
                    <Badge key={category} variant="outline">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex flex-col gap-2 pt-2">
              {homepage ? (
                <Button asChild variant="outline">
                  <a href={homepage} target="_blank" rel="noreferrer">
                    {t.crypto.detail.website}
                    <ExternalLink className="ml-2 size-4" />
                  </a>
                </Button>
              ) : null}

              {explorer ? (
                <Button asChild variant="outline">
                  <a href={explorer} target="_blank" rel="noreferrer">
                    {t.crypto.detail.explorer}
                    <ExternalLink className="ml-2 size-4" />
                  </a>
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
