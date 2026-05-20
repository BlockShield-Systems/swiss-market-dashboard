import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLatestMarketInsights } from "@/lib/db/queries/market-insights";
import { getLocale } from "@/lib/i18n-server";
import { notFound } from "next/navigation";
import { marketInsightsEnabled } from "@/lib/flags";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Market Intelligence Archive",
  description: "Persisted market intelligence records powered by Postgres.",
};

function formatDate(value: Date, locale: string) {
  return new Intl.DateTimeFormat(locale === "de" ? "de-CH" : "en-CH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function InsightsPage() {
  const enabled = await marketInsightsEnabled();

  if (!enabled) {
    notFound();
  }

  const locale = await getLocale();
  const insights = await getLatestMarketInsights();

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">
          Market Intelligence
        </p>

        <h1 className="text-3xl font-bold tracking-tight">
          {locale === "de"
            ? "Market Intelligence Archiv"
            : "Market Intelligence Archive"}
        </h1>

        <p className="max-w-3xl text-muted-foreground">
          {locale === "de"
            ? "Persistente Marktanalysen aus der Postgres-Datenschicht. Dieses Modul dient als Grundlage für spätere AI-generierte Marktberichte."
            : "Persistent market intelligence records from the Postgres data layer. This module acts as the foundation for future AI-generated market reports."}
        </p>
      </div>

      {insights.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-sm text-muted-foreground">
            {locale === "de"
              ? "Noch keine Marktanalysen gespeichert."
              : "No market insights stored yet."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {insights.map((insight) => (
            <Card key={insight.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {insight.title}
                    </CardTitle>

                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {insight.coinId} · {insight.source}
                    </p>
                  </div>

                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    {insight.locale.toUpperCase()}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-muted-foreground">
                  {insight.summary}
                </p>

                <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                  <span>
                    {locale === "de" ? "Erstellt" : "Created"}:{" "}
                    {formatDate(insight.createdAt, locale)}
                  </span>

                  <span>Model: {insight.model ?? "n/a"}</span>

                  {insight.confidenceScore !== null ? (
                    <span>Confidence: {insight.confidenceScore}%</span>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
