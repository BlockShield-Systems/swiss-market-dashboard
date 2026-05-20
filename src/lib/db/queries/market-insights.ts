import { desc, eq, type InferInsertModel } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { marketInsights } from "@/lib/db/schema";

export type NewMarketInsight = InferInsertModel<typeof marketInsights>;

export async function getLatestMarketInsights(limit = 20) {
  return db
    .select()
    .from(marketInsights)
    .orderBy(desc(marketInsights.createdAt))
    .limit(limit);
}

export async function getMarketInsightsByCoin(coinId: string, limit = 10) {
  return db
    .select()
    .from(marketInsights)
    .where(eq(marketInsights.coinId, coinId))
    .orderBy(desc(marketInsights.createdAt))
    .limit(limit);
}

export async function createMarketInsight(values: NewMarketInsight) {
  const [created] = await db.insert(marketInsights).values(values).returning();

  return created;
}

