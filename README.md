# Swiss Market Dashboard

Production-oriented fullstack dashboard for Swiss market intelligence, crypto analytics, weather data, persistent insights, feature flags, and AI-ready market summaries.

Live production URL:

https://dashboard.ai-techart.com

---

## Overview

Swiss Market Dashboard is a modern fullstack intelligence dashboard for crypto market data, Swiss weather information, persistent market insights, feature-controlled modules, Redis-backed caching, rate limiting, and AI-ready market analysis infrastructure.

The project is intentionally built as a production-oriented platform rather than a minimal demo. It focuses on reliable data integration, clear user interfaces, secure server-side architecture, controlled rollout of cost-sensitive features, and maintainable fullstack engineering.

Core platform capabilities include:

- live market data integration
- server-side API routes
- persistent SQL storage
- feature flag driven rollout control
- AI Gateway integration prepared behind a kill switch
- Redis-backed rate limiting and cache infrastructure
- dependency security hygiene
- Vercel production deployment

---

## Core Features

### Dashboard

- Aggregated dashboard overview
- Crypto market overview
- Swiss weather overview
- Modular navigation
- Responsive UI

### Crypto Market Data

- Crypto listing
- Coin detail pages
- CoinGecko-powered market data
- Price, market cap, volume, supply and ATH/ATL metrics
- Chart modes:
  - Area
  - Line
  - Candlestick
- Server-side API routes for crypto data

### Weather Data

- Weather dashboard
- Open-Meteo integration
- Server-side weather API route

### Market Intelligence Archive

- Persistent insights stored in Neon Postgres
- Drizzle ORM schema and migrations
- `/insights` route
- Seeded example records
- Prepared for future AI-generated summaries

### Feature Flags

Feature flags are used to control experimental and cost-sensitive modules.

Current flags:

```env
FEATURE_MARKET_INSIGHTS_ENABLED=true
FEATURE_AI_MARKET_SUMMARY_ENABLED=false
FEATURE_DEFAULT_CRYPTO_CHART_MODE=area
```

Implemented flags:

- `market-insights-enabled`
- `ai-market-summary-enabled`
- `default-crypto-chart-mode`

### AI Market Summary Infrastructure

The project includes a server-side AI market summary API route:

```txt
POST /api/ai/market-summary
```

Current production state:

```env
FEATURE_AI_MARKET_SUMMARY_ENABLED=false
```

Reason:

The route is implemented but intentionally disabled in production to avoid uncontrolled AI credit usage. Vercel AI Gateway currently requires account billing verification before model requests can be processed.

Implemented AI infrastructure:

- Vercel AI Gateway integration
- Request validation with Zod
- CoinGecko context fetching
- Prompt generation for German and English summaries
- Postgres persistence for generated summaries
- Redis-backed rate limiting
- Redis-backed response caching
- Feature flag kill switch

### Redis Rate Limiting and Cache

Upstash Redis is integrated for:

- AI route rate limiting
- AI response cache
- future public API request counters
- future API abuse prevention

Current AI limit:

```txt
5 requests / 10 minutes / client identifier
```

AI response cache TTL:

```txt
30 minutes
```

---

## Tech Stack

### Frontend

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui-style components
- Recharts
- lightweight-charts
- lucide-react

### Backend / API

- Next.js Route Handlers
- Server-side TypeScript
- Zod validation
- CoinGecko API
- Open-Meteo API
- Vercel AI Gateway

### Database

- Neon Postgres
- Drizzle ORM
- Drizzle Kit migrations
- Drizzle Studio

### Cache / Rate Limiting

- Upstash Redis
- `@upstash/redis`
- `@upstash/ratelimit`

### Deployment / Platform

- Vercel
- Vercel Environment Variables
- Vercel Analytics
- Vercel Speed Insights
- Vercel Production Deployments

### Quality / Security

- TypeScript type checking
- ESLint
- Jest test suite
- Production build validation
- pnpm lockfile
- pnpm supply-chain settings
- Dependabot advisory resolution

---

## Architecture Summary

```txt
Browser
  |
  v
Next.js App Router
  |
  +--> Server Components / Client Components
  |
  +--> API Routes
        |
        +--> CoinGecko API
        +--> Open-Meteo API
        +--> Neon Postgres via Drizzle ORM
        +--> Upstash Redis
        +--> Vercel AI Gateway
```

Detailed architecture documentation:

```txt
docs/architecture.md
```

Security posture:

```txt
docs/security.md
```

---

## Environment Variables

Required locally in `.env.local`.

Never commit `.env.local`.

### Public API / Market Data

```env
COINGECKO_API_KEY=...
```

### Postgres / Neon

```env
DATABASE_URL=...
DATABASE_URL_UNPOOLED=...
```

Runtime uses:

```env
DATABASE_URL
```

Migrations use:

```env
DATABASE_URL_UNPOOLED
```

### Feature Flags

```env
FEATURE_MARKET_INSIGHTS_ENABLED=true
FEATURE_AI_MARKET_SUMMARY_ENABLED=false
FEATURE_DEFAULT_CRYPTO_CHART_MODE=area
```

### AI Gateway

```env
AI_GATEWAY_API_KEY=...
AI_MARKET_SUMMARY_MODEL=alibaba/qwen-3-14b
```

AI is currently disabled by default through:

```env
FEATURE_AI_MARKET_SUMMARY_ENABLED=false
```

### Upstash Redis

```env
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

---

## Local Development

Install dependencies:

```bash
pnpm install
```

Start development server:

```bash
pnpm dev
```

Open:

```txt
http://localhost:3000
```

---

## Database Workflow

Generate migrations:

```bash
pnpm db:generate
```

Apply migrations:

```bash
pnpm db:migrate
```

Seed example market insights:

```bash
pnpm db:seed
```

Open Drizzle Studio:

```bash
pnpm db:studio
```

---

## Quality Checks

Run before every production commit:

```bash
pnpm type-check
pnpm lint
pnpm test:ci
pnpm build
```

Security audit:

```bash
pnpm audit
pnpm audit --prod
```

---

## Current Production Status

Implemented and deployed:

- Next.js dashboard
- Crypto overview
- Crypto detail pages
- Weather module
- Neon Postgres integration
- Drizzle schema and migrations
- Market Intelligence Archive
- Feature flags
- AI market summary API route
- Redis rate limiting and cache infrastructure
- Dependency security advisory fixes

Disabled intentionally:

- Public AI market summary execution

Reason:

- AI Gateway model execution is cost-sensitive.
- The feature is protected by a feature flag.
- Redis protection is implemented.
- Production AI activation requires deliberate billing and cost-control approval.

---

## Roadmap

Potential next modules:

- AI summary UI action on coin detail pages
- Admin-only AI generation controls
- Saved watchlist
- User feedback on insights
- Scheduled market reports
- Premium access flows
- Forum/community module
- Workflow-based scheduled intelligence reports
- Deeper observability and runtime dashboards

---

## Project Focus

This project demonstrates practical fullstack engineering through a real, data-driven dashboard architecture.

The focus is on:

- reliable API integration
- database modeling
- migrations
- persistent data
- server-side feature flags
- AI-ready infrastructure
- cost control
- rate limiting
- caching
- production deployment
- dependency security hygiene

The dashboard is designed as a technical reference platform for users, developers, companies, technical decision-makers, and the wider Swiss/DACH technology ecosystem.

