import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Bot, CalendarClock, Database, Gauge, Info, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLatestMarketInsights } from "@/lib/db/queries/market-insights";
import { marketInsightsEnabled } from "@/lib/flags";
import { getLocale } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Market Intelligence Archive",
  description: "Persisted market intelligence records powered by Postgres.",
};

type InsightRecord = Awaited<ReturnType<typeof getLatestMarketInsights>>[number];

function formatDate(value: Date, locale: string) {
  return new Intl.DateTimeFormat(locale === "de" ? "de-CH" : "en-CH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function formatSource(source: string, locale: string) {
  if (source === "ai") {
    return locale === "de" ? "AI-generiert" : "AI-generated";
  }

  if (source === "manual") {
    return locale === "de" ? "Manuell" : "Manual";
  }

  return source;
}

function getSourceBadgeVariant(source: string) {
  return source === "ai" ? "secondary" : "outline";
}

function getDisplayConfidence(insight: InsightRecord) {
  if (typeof insight.confidenceScore === "number") {
    return insight.confidenceScore;
  }

  if (insight.source === "ai") {
    return 85;
  }

  return null;
}

function formatMetadataLabel(key: string) {
  const labels: Record<string, string> = {
    priceChf: "Price CHF",
    change24h: "24h",
    change7d: "7d",
    marketCapChf: "Market Cap CHF",
    volume24hChf: "Volume 24h CHF",
  };

  return labels[key] ?? key;
}

function formatMetadataValue(value: unknown, locale: string) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value.toLocaleString(locale === "de" ? "de-CH" : "en-CH", {
      maximumFractionDigits: 2,
    });
  }

  if (typeof value === "string") {
    return value;
  }

  return null;
}

function getMetadataEntries(insight: InsightRecord, locale: string) {
  if (!insight.metadata || typeof insight.metadata !== "object") {
    return [];
  }

  return Object.entries(insight.metadata)
    .map(([key, value]) => ({
      key,
      label: formatMetadataLabel(key),
      value: formatMetadataValue(value, locale),
    }))
    .filter((entry) => entry.value !== null);
}

export default async function InsightsPage() {
  const enabled = await marketInsightsEnabled();

  if (!enabled) {
    notFound();
  }

  const locale = await getLocale();
  const insights = await getLatestMarketInsights();

  const copy =
    locale === "de"
      ? {
        eyebrow: "Market Intelligence",
        title: "Market Intelligence Archiv",
        description:
          "Persistente Marktanalysen aus der Postgres-Datenschicht. Dieses Modul dient als Grundlage für AI-generierte Marktberichte, historische Insights und spätere Premium- oder Admin-Funktionen.",
        emptyTitle: "Noch keine Marktanalysen gespeichert",
        emptyDescription:
          "Sobald manuelle oder AI-generierte Insights erstellt werden, erscheinen sie hier mit Quelle, Modell, Confidence und technischen Metadaten.",
        source: "Quelle",
        model: "Modell",
        modelUnavailable: "Kein Modell hinterlegt",
        confidence: "Confidence",
        created: "Erstellt",
        locale: "Sprache",
        metadata: "Marktdaten-Kontext",
        noMetadata: "Keine zusätzlichen Marktdaten gespeichert.",
        record: "Insight Record",
      }
      : {
        eyebrow: "Market Intelligence",
        title: "Market Intelligence Archive",
        description:
          "Persistent market intelligence records from the Postgres data layer. This module is the foundation for AI-generated market reports, historical insights and future premium or admin workflows.",
        emptyTitle: "No market insights stored yet",
        emptyDescription:
          "Manual or AI-generated insights will appear here with source, model, confidence and technical metadata once available.",
        source: "Source",
        model: "Model",
        modelUnavailable: "No model stored",
        confidence: "Confidence",
        created: "Created",
        locale: "Locale",
        metadata: "Market data context",
        noMetadata: "No additional market data stored.",
        record: "Insight Record",
      };

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">{copy.eyebrow}</p>

        <h1 className="text-3xl font-bold tracking-tight">{copy.title}</h1>

        <p className="max-w-3xl text-muted-foreground">{copy.description}</p>
      </div>

      {insights.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-start gap-3 py-10">
            <div className="rounded-full bg-muted p-2">
              <Info className="size-5 text-muted-foreground" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-semibold text-foreground">
                {copy.emptyTitle}
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                {copy.emptyDescription}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {insights.map((insight) => {
            const confidence = getDisplayConfidence(insight);
            const metadataEntries = getMetadataEntries(insight, locale);

            return (
              <Card
                key={insight.id}
                className="border-primary/10 bg-linear-to-br from-background via-background to-muted/20"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={getSourceBadgeVariant(insight.source)}
                          className="gap-1"
                        >
                          {insight.source === "ai" ? (
                            <Bot className="size-3" />
                          ) : (
                            <Database className="size-3" />
                          )}
                          {formatSource(insight.source, locale)}
                        </Badge>

                        <Badge variant="outline" className="gap-1">
                          <Sparkles className="size-3" />
                          {copy.record}
                        </Badge>

                        <Badge variant="outline">
                          {insight.locale.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          {insight.title}
                        </CardTitle>

                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          {insight.coinId}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">
                  <p className="text-sm leading-6 text-muted-foreground">
                    {insight.summary}
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-lg border bg-background/70 p-3">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Database className="size-3.5" />
                        {copy.source}
                      </div>
                      <p className="mt-1 text-sm font-medium">
                        {formatSource(insight.source, locale)}
                      </p>
                    </div>

                    <div className="rounded-lg border bg-background/70 p-3">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Bot className="size-3.5" />
                        {copy.model}
                      </div>
                      <p className="mt-1 truncate text-sm font-medium">
                        {insight.model ?? copy.modelUnavailable}
                      </p>
                    </div>

                    <div className="rounded-lg border bg-background/70 p-3">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Gauge className="size-3.5" />
                        {copy.confidence}
                      </div>
                      <p className="mt-1 text-sm font-medium">
                        {confidence !== null ? `${confidence} %` : "n/a"}
                      </p>
                    </div>

                    <div className="rounded-lg border bg-background/70 p-3">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <CalendarClock className="size-3.5" />
                        {copy.created}
                      </div>
                      <p className="mt-1 text-sm font-medium">
                        {formatDate(insight.createdAt, locale)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border bg-muted/20 p-4">
                    <h2 className="text-sm font-semibold text-foreground">
                      {copy.metadata}
                    </h2>

                    {metadataEntries.length > 0 ? (
                      <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                        {metadataEntries.map((entry) => (
                          <div
                            key={entry.key}
                            className="flex items-center justify-between gap-3 rounded-lg bg-background/70 px-3 py-2 text-xs"
                          >
                            <dt className="text-muted-foreground">
                              {entry.label}
                            </dt>
                            <dd className="font-medium text-foreground">
                              {entry.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    ) : (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {copy.noMetadata}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
