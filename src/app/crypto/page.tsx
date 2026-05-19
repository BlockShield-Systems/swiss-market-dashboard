import type { Metadata } from "next";
import { Info } from "lucide-react";
import { CryptoTable } from "@/components/crypto/crypto-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchCryptoMarket } from "@/lib/api/coingecko";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return {
    title: t.crypto.title,
    description: t.crypto.description,
  };
}

export default async function CryptoPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  let coins: Awaited<ReturnType<typeof fetchCryptoMarket>> | null = null;
  let error: string | null = null;

  try {
    coins = await fetchCryptoMarket();
  } catch (err) {
    console.error("Failed to load crypto market:", err);
    error = t.crypto.loadError;
  }

  const legendItems = [
    t.crypto.legend.rank,
    t.crypto.legend.marketCap,
    t.crypto.legend.volume,
    t.crypto.legend.change24h,
    t.crypto.legend.change7d,
    t.crypto.legend.colors,
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.crypto.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          {t.crypto.description}
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="size-4" />
            {t.crypto.legend.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
            {legendItems.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {error ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            {t.crypto.errorPrefix} {error}
          </p>
        </div>
      ) : (
        <CryptoTable data={coins ?? []} />
      )}
    </div>
  );
}
