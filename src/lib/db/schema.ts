import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const marketInsights = pgTable("market_insights", {
  id: uuid("id").defaultRandom().primaryKey(),

  coinId: varchar("coin_id", { length: 80 }).notNull(),
  locale: varchar("locale", { length: 8 }).notNull().default("de"),

  title: varchar("title", { length: 180 }).notNull(),
  summary: text("summary").notNull(),

  source: varchar("source", { length: 80 }).notNull().default("manual"),
  model: varchar("model", { length: 120 }),

  confidenceScore: integer("confidence_score"),

  metadata: jsonb("metadata")
    .$type<{
      priceChf?: number;
      change24h?: number;
      change7d?: number;
      marketCapChf?: number;
      volume24hChf?: number;
    }>()
    .default({}),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
