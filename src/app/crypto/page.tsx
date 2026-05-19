import type { Metadata } from "next";
import { CryptoTable } from "@/components/crypto/crypto-table";
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.crypto.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          {t.crypto.description}
        </p>
      </div>

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
