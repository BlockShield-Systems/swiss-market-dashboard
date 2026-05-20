CREATE TABLE "market_insights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coin_id" varchar(80) NOT NULL,
	"locale" varchar(8) DEFAULT 'de' NOT NULL,
	"title" varchar(180) NOT NULL,
	"summary" text NOT NULL,
	"source" varchar(80) DEFAULT 'manual' NOT NULL,
	"model" varchar(120),
	"confidence_score" integer,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
