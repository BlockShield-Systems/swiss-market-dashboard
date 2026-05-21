# Architecture

Swiss Market Dashboard is structured as a production-oriented fullstack intelligence platform built on Next.js, Vercel, Neon Postgres, Upstash Redis, and Vercel AI Gateway.

The platform combines crypto market data, Swiss weather information, persistent market insights, Redis-backed caching, rate limiting, feature flags, and AI-ready market analysis infrastructure.

The architecture is designed around clear separation of responsibilities:

- UI rendering
- API aggregation
- persistent storage
- feature control
- AI execution
- caching and rate limiting
- deployment and observability

---

## High-Level System Overview

```txt
User Browser
  |
  v
Vercel Edge / CDN
  |
  v
Next.js Application
  |
  +-- App Router Pages
  |     |
  |     +-- Shared Cached Data Services
  |
  +-- Server Components
  |
  +-- Client Components
  |
  +-- Route Handlers
        |
        +-- Shared Cached Data Services
        +-- Neon Postgres
        +-- Upstash Redis
        +-- Vercel AI Gateway

Shared Cached Data Services
  |
  +-- Upstash Redis cache
  +-- CoinGecko API
  +-- Open-Meteo API
```

The architecture avoids duplicated external API access for shared market and weather data.
Server-rendered pages and public API routes now use the same cached data service modules.

---

## Frontend Layer

The frontend is built with:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- reusable UI components
- Recharts
- lightweight-charts

Main routes:

```txt
/
 /about
 /crypto
 /crypto/[id]
 /weather
 /settings
 /insights
```

The frontend combines server-rendered pages with interactive client components.

Examples:

- crypto tables
- chart mode switching
- locale/preferences provider
- dynamic chart rendering
- insights archive cards

---

## API Layer

API routes are implemented using Next.js Route Handlers.

Current API routes:

```txt
/api/crypto/global
/api/crypto/[id]/market-chart
/api/crypto/[id]/ohlc
/api/weather
/api/ai/market-summary
```

Responsibilities:

- normalize third-party API responses
- isolate API keys from the browser
- apply validation
- support feature flags
- apply Redis-backed caching and rate limiting where appropriate
- return stable JSON contracts to the frontend
- expose standardized response headers for cache, rate-limit, data-source and route observability

Public API response headers are standardized for the shared market and weather APIs.

Current public API observability headers:

```txt
X-API-Route
X-Data-Source
X-Cache
X-Cache-TTL
X-Cache-Scope
X-RateLimit-Limit
X-RateLimit-Remaining
X-RateLimit-Reset
X-RateLimit-Policy
X-RateLimit-Window
Cache-Control
```

Header meaning:

```txt
X-API-Route              Logical route identifier
X-Data-Source            External upstream data source
X-Cache                  Redis cache status: HIT, MISS or SKIP
X-Cache-TTL              Cache TTL in seconds
X-Cache-Scope            Cache implementation scope
X-RateLimit-Limit        Maximum requests allowed in the active window
X-RateLimit-Remaining    Remaining requests in the active window
X-RateLimit-Reset        Reset timestamp for the active rate-limit window
X-RateLimit-Policy       Applied rate-limit policy
X-RateLimit-Window       Human-readable rate-limit window
Cache-Control            Browser/CDN caching policy
```

Current public API route identifiers:

```txt
/api/crypto/global              X-API-Route: crypto-global
/api/crypto/[id]/market-chart   X-API-Route: crypto-market-chart
/api/crypto/[id]/ohlc           X-API-Route: crypto-ohlc-chart
/api/weather                    X-API-Route: weather-forecast
```

Current public API data-source identifiers:

```txt
CoinGecko APIs     X-Data-Source: coingecko
Open-Meteo API     X-Data-Source: open-meteo
```

Current cache scope:

```txt
X-Cache-Scope: shared-data-service
```

Public API responses currently use:

```txt
Cache-Control: no-store
```

This is intentional because Redis is the controlled cache layer. Browser/CDN caching is not relied on for these JSON endpoints.

---

## Shared Cached Data Services

Shared cached data services centralize Redis-backed data access for frequently requested market and weather data.

The goal is to avoid duplicated fetch logic between server-rendered pages and public API routes.

Current shared cached data service files:

```txt
src/lib/data/crypto-global.ts
src/lib/data/weather-forecast.ts
src/lib/data/coin-market-chart.ts
src/lib/data/coin-ohlc-chart.ts
```

Current usage:

```txt
Server-rendered pages
  |
  v
Shared cached data services
  |
  v
Redis cache
  |
  v
External API helper

Public API routes
  |
  v
Shared cached data services
  |
  v
Redis cache
  |
  v
External API helper
```

Current cache TTLs:

```txt
Crypto global data        60 seconds
Coin market chart data    300 seconds
Coin OHLC chart data      300 seconds
Weather forecast data     1800 seconds
```

The public API routes still apply request-based rate limiting before returning uncached or freshly generated responses where appropriate.
Server-rendered pages benefit from the same Redis-backed cache layer without going through internal HTTP calls.

The public API routes also expose standardized observability headers for cache state, upstream source, route identity and rate-limit state.

Example successful cached response headers:

```txt
X-API-Route: crypto-global
X-Data-Source: coingecko
X-Cache: HIT
X-Cache-TTL: 60
X-Cache-Scope: shared-data-service
Cache-Control: no-store
```

Example uncached response with rate-limit headers:

```txt
X-API-Route: crypto-market-chart
X-Data-Source: coingecko
X-Cache: MISS
X-Cache-TTL: 300
X-Cache-Scope: shared-data-service
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1779360000000
X-RateLimit-Policy: market-data-api
X-RateLimit-Window: 1m
Cache-Control: no-store
```

This keeps runtime behavior transparent without exposing secrets or internal credentials.

---

## External API Integrations

### CoinGecko

Used for crypto market data:

- global market stats
- coin details
- price charts
- OHLC/candlestick data
- market cap
- volume
- supply data

CoinGecko access is server-side only.

### Open-Meteo

Used for weather data.

Open-Meteo access is handled through a server-side API route.

---

## Data Layer

Persistent storage is provided by Neon Postgres.

ORM:

```txt
Drizzle ORM
```

Migration tool:

```txt
Drizzle Kit
```

Primary table:

```txt
market_insights
```

Purpose:

- store manually seeded market insights
- store future AI-generated crypto summaries
- support historical intelligence records
- provide a persistent intelligence archive backed by SQL storage

---

## Market Insights Flow

```txt
/insights page
  |
  v
getLatestMarketInsights()
  |
  v
Drizzle ORM
  |
  v
Neon Postgres
  |
  v
market_insights table
```

The `/insights` route is protected by the `market-insights-enabled` feature flag.

If disabled, the route returns a 404 using Next.js `notFound()`.

---

## Feature Flag Layer

Feature flags are implemented server-side.

Current flags:

```txt
market-insights-enabled
ai-market-summary-enabled
default-crypto-chart-mode
```

Environment-backed values:

```env
FEATURE_MARKET_INSIGHTS_ENABLED=true
FEATURE_AI_MARKET_SUMMARY_ENABLED=false
FEATURE_DEFAULT_CRYPTO_CHART_MODE=area
```

Purpose:

- control experimental rollout
- disable cost-sensitive features instantly
- configure default UI behavior
- avoid redeploying for simple rollout changes

---

## Crypto Chart Mode Flow

```txt
/crypto/[id]
  |
  v
defaultCryptoChartMode()
  |
  v
CoinPriceChart initialMode
  |
  v
area / line / candlestick
```

The default chart mode is controlled by:

```env
FEATURE_DEFAULT_CRYPTO_CHART_MODE=area
```

Valid values:

```txt
area
line
candlestick
```

---

## AI Layer

The AI route is implemented at:

```txt
POST /api/ai/market-summary
```

Current production state:

```env
FEATURE_AI_MARKET_SUMMARY_ENABLED=false
```

The route is implemented but disabled by default.

When enabled, the intended flow is:

```txt
Client / future UI action
  |
  v
POST /api/ai/market-summary
  |
  v
Feature flag check
  |
  v
Request validation with Zod
  |
  v
Redis rate limit
  |
  v
Redis cache lookup
  |
  v
CoinGecko coin context fetch
  |
  v
Prompt construction
  |
  v
Vercel AI Gateway
  |
  v
Persist generated summary in Neon Postgres
  |
  v
Cache response in Redis
  |
  v
Return JSON response
```

The AI prompt enforces:

- concise output
- no financial advice
- no hype
- no buy/sell recommendation
- professional market intelligence tone
- data uncertainty and market risk notice

Supported locales:

```txt
de
en
```

---

## Redis Layer

Upstash Redis is used for:

- shared cached data services
- public API response caching
- public API rate limiting
- AI route rate limiting
- AI response caching
- short-lived operational counters
- abuse-prevention infrastructure

Core Redis utility files:

```txt
src/lib/redis.ts
src/lib/rate-limit.ts
src/lib/public-api-rate-limit.ts
src/lib/request-ip.ts
src/lib/cache.ts
```

Shared cached data service files:

```txt
src/lib/data/crypto-global.ts
src/lib/data/weather-forecast.ts
src/lib/data/coin-market-chart.ts
src/lib/data/coin-ohlc-chart.ts
```

Current AI rate limit:

```txt
5 AI summary requests / 10 minutes / client identifier
```

AI cache TTL:

```txt
30 minutes
```

AI cache key format:

```txt
ai-summary:{locale}:{coinId}
```

Public API cache TTLs:

```txt
/api/crypto/global              60 seconds
/api/crypto/[id]/market-chart   300 seconds
/api/crypto/[id]/ohlc           300 seconds
/api/weather                    1800 seconds
```

Shared cached data service TTLs:

```txt
Crypto global data        60 seconds
Coin market chart data    300 seconds
Coin OHLC chart data      300 seconds
Weather forecast data     1800 seconds
```

Public API rate limits:

```txt
Crypto market data APIs   60 requests / minute / client identifier
General public APIs       120 requests / minute / client identifier
```

Current public API rate-limit policies:

```txt
market-data-api   CoinGecko-backed market data endpoints
public-api        General public API endpoints
```

Current public API rate-limit window header:

```txt
X-RateLimit-Window: 1m
```

Client identifiers are derived from forwarded IP headers and hashed before use.

Public API cache and rate-limit observability is exposed through standardized response headers:

```txt
X-API-Route
X-Data-Source
X-Cache
X-Cache-TTL
X-Cache-Scope
X-RateLimit-Limit
X-RateLimit-Remaining
X-RateLimit-Reset
X-RateLimit-Policy
X-RateLimit-Window
Cache-Control
```

These headers are designed for debugging, operational visibility and integration clarity. They do not expose secrets or raw client identifiers.

---

## AI Route Protection Order

The AI route is intentionally protected in this order:

```txt
1. Feature flag check
2. Gateway authentication check
3. Body validation
4. Rate limit
5. Cache lookup
6. CoinGecko fetch
7. AI Gateway call
8. Postgres write
9. Redis cache write
```

This prevents unnecessary cost and resource consumption.

---

## Deployment Layer

Deployment target:

```txt
Vercel
```

Production domain:

```txt
https://dashboard.ai-techart.com
```

Vercel provides:

- production deployments
- preview deployments
- environment variables
- analytics
- speed insights
- runtime logs
- deployment logs
- domain routing

---

## Environment Strategy

Sensitive variables are stored in Vercel Environment Variables and `.env.local` locally.

Sensitive:

```txt
DATABASE_URL
DATABASE_URL_UNPOOLED
COINGECKO_API_KEY
AI_GATEWAY_API_KEY
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

Non-secret but server-side configuration:

```txt
FEATURE_MARKET_INSIGHTS_ENABLED
FEATURE_AI_MARKET_SUMMARY_ENABLED
FEATURE_DEFAULT_CRYPTO_CHART_MODE
AI_MARKET_SUMMARY_MODEL
```

---

## Production Safety Principles

The architecture follows these principles:

- no secrets in client-side code
- no secrets committed to Git
- AI execution disabled by default
- AI protected by feature flag
- AI protected by Redis rate limiting
- AI responses cached to reduce repeated cost
- database migrations committed to source control
- dependency advisories monitored and resolved
- production deployment verified after each major commit

---

## Current Limitations

The AI route is implemented but not publicly enabled because Vercel AI Gateway currently requires billing verification before model requests can be processed.

This is a deliberate cost-control decision.

The code path remains ready for future activation once billing and usage limits are deliberately configured.
