import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  const [{ db }, { marketInsights }, { eq }] = await Promise.all([
    import("./client"),
    import("./schema"),
    import("drizzle-orm"),
  ]);

  await db
    .delete(marketInsights)
    .where(eq(marketInsights.model, "manual-seed"));

  await db.insert(marketInsights).values([
    {
      coinId: "bitcoin",
      locale: "de",
      title: "Bitcoin Marktüberblick",
      summary:
        "Bitcoin bleibt der zentrale Referenzwert im Kryptomarkt. Diese gespeicherte Analyse demonstriert die persistente Postgres-Datenschicht des Dashboards und bildet die Grundlage für spätere AI-generierte Marktberichte.",
      source: "manual",
      model: "manual-seed",
      confidenceScore: 85,
      metadata: {
        priceChf: 60627,
        change24h: -0.19,
      },
    },
    {
      coinId: "ethereum",
      locale: "de",
      title: "Ethereum Marktüberblick",
      summary:
        "Ethereum bleibt relevant für Smart-Contract-Infrastruktur, DeFi, Layer-2-Ökosysteme und tokenisierte Anwendungen. Diese Beispielanalyse zeigt, wie Market Intelligence Records dauerhaft gespeichert werden.",
      source: "manual",
      model: "manual-seed",
      confidenceScore: 82,
      metadata: {},
    },
    {
      coinId: "bitcoin",
      locale: "en",
      title: "Bitcoin Market Overview",
      summary:
        "Bitcoin remains the leading reference asset in the crypto market. This persisted record demonstrates the dashboard's Postgres-backed intelligence layer and prepares the system for future AI-generated market summaries.",
      source: "manual",
      model: "manual-seed",
      confidenceScore: 85,
      metadata: {
        priceChf: 60627,
        change24h: -0.19,
      },
    },
  ]);

  console.log("Seed completed");
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  });
