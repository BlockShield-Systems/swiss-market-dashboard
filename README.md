# Swiss Market Dashboard

Swiss Market Dashboard is a production-oriented full-stack data platform for Swiss market data, crypto analytics, weather information, persistent market insights, Redis-backed caching, public API observability, feature flags, and AI-ready market summary infrastructure.

Production:

```txt
https://dashboard.ai-techart.com
```

Repository:

```txt
https://github.com/BlockShield-Systems/swiss-market-dashboard
```

---

## Overview

The application combines:

```txt
Next.js App Router
React
TypeScript
Tailwind CSS
Neon Postgres
Drizzle ORM
Upstash Redis
CoinGecko API
Open-Meteo API
Vercel AI Gateway integration
Vercel deployment
```

The system is built around server-side data access, shared cached data providers, public API route handlers, security headers, feature flags, and repeatable production verification.

The AI market summary route is implemented but disabled in production by default. This keeps cost-sensitive execution behind an explicit server-side rollout decision.

---

## Live Capabilities

### Dashboard Pages

```txt
/
 /crypto
 /crypto/[id]
 /weather
 /insights
 /settings
 /about
```

### Public API Routes

```txt
GET /api/crypto/global
GET /api/weather?key=zurich
GET /api/crypto/bitcoin/market-chart?days=7
GET /api/crypto/bitcoin/ohlc?days=7
```

### AI-Ready Route

```txt
POST /api/ai/market-summary
```

Current production state:

```env
FEATURE_AI_MARKET_SUMMARY_ENABLED=false
```

The route exists as a guarded server-side path but is intentionally disabled until billing, rate-limit, cache, and provider controls are explicitly confirmed.

---

## Core Features

### Market and Crypto Data

```txt
crypto market overview
coin detail pages
market chart data
OHLC/candlestick data
CHF-based normalized responses
CoinGecko-backed server-side integration
```

### Swiss Weather Data

```txt
Swiss city weather module
Open-Meteo-backed forecast data
server-side weather API route
Redis-backed forecast cache
```

### Market Insights

```txt
persistent market insights
Neon Postgres storage
Drizzle ORM schema and migrations
/insights route
feature-flag controlled visibility
```

### Feature Flags

Feature flags are used for rollout control and cost-sensitive functionality.

```env
FEATURE_MARKET_INSIGHTS_ENABLED=true
FEATURE_AI_MARKET_SUMMARY_ENABLED=false
FEATURE_DEFAULT_CRYPTO_CHART_MODE=area
```

Implemented flags:

```txt
market-insights-enabled
ai-market-summary-enabled
default-crypto-chart-mode
```

Valid chart modes:

```txt
area
line
candlestick
```

---

## Architecture Summary

High-level runtime flow:

```txt
Browser
  |
  v
Vercel Edge / CDN
  |
  v
Next.js Application
  |
  +-- App Router pages
  +-- Server components
  +-- Client components
  +-- Route handlers
  |
  +-- Shared cached data services
  |     |
  |     +-- Upstash Redis
  |     +-- CoinGecko API
  |     +-- Open-Meteo API
  |
  +-- Neon Postgres via Drizzle ORM
  +-- Vercel AI Gateway integration
```

Shared cached data service modules:

```txt
src/lib/data/crypto-global.ts
src/lib/data/weather-forecast.ts
src/lib/data/coin-market-chart.ts
src/lib/data/coin-ohlc-chart.ts
```

The same data-provider layer is used by server-rendered pages and public API route handlers. This avoids duplicated external fetch logic and keeps cache behavior consistent.

Detailed architecture documentation:

```txt
docs/architecture.md
docs/architecture-diagrams.md
```

---

## Public API Observability

Public API responses expose standardized headers for route identity, data source, cache status, cache TTL, cache scope, and rate-limit state.

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

Example:

```bash
curl -I https://dashboard.ai-techart.com/api/crypto/global
```

Expected header categories:

```txt
route identifier
data source
cache state
cache TTL
cache scope
security headers
```

The headers are intended for operational visibility and integration clarity. They do not expose secrets, raw client identifiers, Redis keys, or provider credentials.

The public API contract is documented in:

```txt
docs/openapi.yaml
```

---

## Cache and Rate Limits

Upstash Redis is used for shared caching and rate limiting.

Current cache TTLs:

```txt
Crypto global data        60 seconds
Coin market chart data    300 seconds
Coin OHLC chart data      300 seconds
Weather forecast data     1800 seconds
```

Current public API rate limits:

```txt
Crypto market data APIs   60 requests / minute / client identifier
General public APIs       120 requests / minute / client identifier
```

AI route controls:

```txt
AI summary route          5 requests / 10 minutes / client identifier
AI response cache         1800 seconds
```

The AI route is disabled in production by default:

```env
FEATURE_AI_MARKET_SUMMARY_ENABLED=false
```

---

## Security Posture

Implemented controls include:

```txt
Content-Security-Policy
Referrer-Policy
X-Content-Type-Options
X-Frame-Options
Permissions-Policy
Cross-Origin-Opener-Policy
Cross-Origin-Resource-Policy
Strict-Transport-Security
disabled x-powered-by header
server-side secret handling
Redis-backed rate limiting
Redis-backed caching
feature-flagged AI route
production smoke-test verification
```

Security documentation:

```txt
SECURITY.md
docs/security.md
docs/threat-model.md
```

Security policy:

```txt
SECURITY.md
```

Technical security controls:

```txt
docs/security.md
```

Threat model and risk overview:

```txt
docs/threat-model.md
```

---

## Environment Variables

Local development uses:

```txt
.env.local
```

This file must never be committed.

The example file uses placeholders only:

```txt
.env.example
```

Required variables:

```env
# External API
COINGECKO_API_KEY=your_coingecko_api_key_here

# Neon Postgres
DATABASE_URL=your_neon_database_url_here
DATABASE_URL_UNPOOLED=your_neon_unpooled_database_url_here

# Upstash Redis
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url_here
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token_here

# Feature flags
FEATURE_MARKET_INSIGHTS_ENABLED=true
FEATURE_AI_MARKET_SUMMARY_ENABLED=false
FEATURE_DEFAULT_CRYPTO_CHART_MODE=area

# AI Gateway
AI_GATEWAY_API_KEY=your_ai_gateway_api_key_here
AI_MARKET_SUMMARY_MODEL=alibaba/qwen-3-14b
```

Production secrets are managed through Vercel environment variables.

---

## Local Development

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

Open locally:

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

Runtime database variable:

```env
DATABASE_URL=...
```

Migration database variable:

```env
DATABASE_URL_UNPOOLED=...
```

---

## Quality Gate

Primary local verification:

```bash
pnpm type-check
pnpm lint
pnpm test:ci
pnpm build
```

Dependency audit:

```bash
pnpm audit
pnpm audit --prod
```

Production smoke test:

```bash
pnpm smoke:prod
```

The production smoke test verifies:

```txt
key HTML routes
robots.txt
sitemap.xml
OpenGraph image
public API endpoints
HTTP status codes
content types
security headers
public API observability headers
absence of x-powered-by
basic JSON response shapes
```

Expected production baseline:

```txt
201 checks passed
0 checks failed
```

---

## Testing Coverage Areas

The test suite covers:

```txt
feature flags
request client identification
Redis client initialization
cache utilities
rate-limit headers
external API clients
cached data providers
public API validation
public API runtime behavior
market insights queries
selected UI components
```

---

## Production Notes

Deployment target:

```txt
Vercel
```

Production domain:

```txt
https://dashboard.ai-techart.com
```

Known build warning:

```txt
Using edge runtime on a page currently disables static generation for that page
```

Current known source:

```txt
src/app/opengraph-image.tsx
export const runtime = "edge";
```

This is expected for the dynamic OpenGraph image route and does not indicate a failure of the normal application pages.

Production validation remains:

```bash
pnpm build
pnpm smoke:prod
```

---

## Documentation Map

```txt
README.md                         Project overview and operational entry point
SECURITY.md                       Security policy and vulnerability reporting
docs/architecture.md              System architecture and runtime flows
docs/architecture-diagrams.md     Visual architecture and runtime diagrams
docs/decisions/                     Architecture decision records
docs/case-study.md                Engineering case study and trade-off analysis
docs/openapi.yaml                 Public API contract for market and weather endpoints
docs/operations.md                Operations runbook and production verification procedures
docs/security.md                  Technical security controls and production headers
docs/threat-model.md              Public threat model and risk overview
CHANGELOG.md                      Project change history
scripts/smoke-test-production.mjs Production smoke-test runner
```

Recommended next documentation additions:

```txt
```

---

## Project Principles

```txt
Production behavior over mock-only behavior
Explicit trade-offs over hidden assumptions
Server-side secrets only
Cost-sensitive features behind feature flags
Shared data providers instead of duplicated fetch logic
Observable public API responses
Redis as controlled cache and rate-limit layer
No real secrets in examples or documentation
Small deployable increments
Quality gates before production changes
```

---

## Roadmap

Near-term improvements:

```txt
Optional accessibility audit documentation
Optional CI quality gate documentation
```

Deferred intentionally:

```txt
Public AI UI action
Authentication system
Admin panel
Sandbox
Premium/user area
```

These features require a clearer product boundary and should not be added only for architectural complexity.

---

## References

Architecture:

```txt
docs/architecture.md
docs/architecture-diagrams.md
```

Security:

```txt
SECURITY.md
docs/security.md
docs/threat-model.md
```

API contract:

```txt
docs/openapi.yaml
```

Operations:

```txt
docs/operations.md
scripts/smoke-test-production.mjs
```

Live deployment:

```txt
https://dashboard.ai-techart.com
```
