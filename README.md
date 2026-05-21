# Swiss Market Dashboard

[![Live](https://img.shields.io/badge/live-dashboard.ai--techart.com-16a34a?style=flat-square)](https://dashboard.ai-techart.com)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square)
![React](https://img.shields.io/badge/React-19-149eca?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square)
![Redis Cache](https://img.shields.io/badge/Redis-cache%20%2B%20rate%20limit-dc2626?style=flat-square)
![Security Headers](https://img.shields.io/badge/security-headers%20enabled-0f766e?style=flat-square)
![Smoke Test](https://img.shields.io/badge/production%20smoke%20test-201%20checks-7c3aed?style=flat-square)

Swiss Market Dashboard is a production-oriented fullstack data platform for Swiss market intelligence, crypto analytics, weather data, persistent market insights, Redis-backed caching, API observability, feature flags, and AI-ready market summary infrastructure.

Live production URL:

```txt
https://dashboard.ai-techart.com
```

Repository:

```txt
https://github.com/BlockShield-Systems/swiss-market-dashboard
```

---

## What This Project Is

Swiss Market Dashboard is built as a real fullstack system, not as a minimal UI prototype.

The application combines:

- server-rendered dashboard pages
- public API routes
- external data integrations
- shared Redis-backed cached data services
- SQL-backed persistent market insights
- feature-flagged rollout control
- rate-limited public APIs
- production security headers
- production smoke testing
- documented architecture and security decisions
- AI-ready infrastructure protected by a kill switch

The current production deployment is intentionally conservative: cost-sensitive AI execution is implemented but disabled until provider billing and usage limits are deliberately configured.

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

### AI-Ready API Route

```txt
POST /api/ai/market-summary
```

Current production state:

```env
FEATURE_AI_MARKET_SUMMARY_ENABLED=false
```

The AI route is implemented but intentionally disabled in production. This avoids uncontrolled model usage and keeps cost-sensitive execution behind an explicit rollout decision.

---

## Core Features

### Market Dashboard

- aggregated market overview
- crypto market overview
- Swiss weather overview
- responsive UI
- locale-aware copy
- resilient page-level fallback behavior

### Crypto Analytics

- crypto market table
- coin detail pages
- price, market cap, volume and rank data
- 24h and 7d change metrics
- area, line and candlestick chart modes
- market chart API
- OHLC/candlestick API
- CoinGecko-backed server-side integration

### Swiss Weather Data

- Swiss city weather module
- Open-Meteo-backed forecast data
- server-side weather API route
- shared Redis-backed forecast cache

### Market Insights Archive

- persistent insights stored in Neon Postgres
- Drizzle ORM schema and migrations
- `/insights` route
- source, model, confidence and metadata display
- prepared for future AI-generated summaries

### Feature Flags

Feature flags control rollout and cost-sensitive behavior.

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

### Redis Cache and Rate Limiting

Upstash Redis is used for:

- shared cached data services
- public API response caching
- public API rate limiting
- AI route rate limiting
- AI response caching
- short-lived operational state

Current public cache TTLs:

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

Client identifiers are derived from forwarded request headers and hashed before use.

---

## Tech Stack

### Application

```txt
Next.js App Router
React
TypeScript
Tailwind CSS
shadcn-style UI components
Recharts
lightweight-charts
lucide-react
```

### Backend and APIs

```txt
Next.js Route Handlers
Server-side TypeScript
Zod validation
CoinGecko API
Open-Meteo API
Vercel AI Gateway integration
```

### Data and Persistence

```txt
Neon Postgres
Drizzle ORM
Drizzle Kit migrations
Drizzle Studio
```

### Cache and Rate Limiting

```txt
Upstash Redis
@upstash/redis
@upstash/ratelimit
```

### Deployment and Runtime

```txt
Vercel
Vercel environment variables
Vercel Analytics
Vercel Speed Insights
Production smoke test script
```

### Quality and Security

```txt
TypeScript type checking
ESLint
Jest test suite
Production build validation
pnpm audit
Security headers
Content-Security-Policy
Rate-limit headers
Cache observability headers
```

---

## Architecture Overview

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
        +-- Neon Postgres via Drizzle ORM
        +-- Upstash Redis cache and rate limiting
        +-- Vercel AI Gateway integration

Shared Cached Data Services
  |
  +-- Upstash Redis cache
  +-- CoinGecko API
  +-- Open-Meteo API
```

The architecture avoids duplicated external API access. Server-rendered pages and public API routes use the same shared cached data service modules:

```txt
src/lib/data/crypto-global.ts
src/lib/data/weather-forecast.ts
src/lib/data/coin-market-chart.ts
src/lib/data/coin-ohlc-chart.ts
```

Detailed documentation:

```txt
docs/architecture.md
docs/security.md
```

---

## Public API Observability

Public API responses expose standardized headers for cache state, upstream source, route identity and rate-limit state.

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

Expected relevant response headers:

```txt
X-API-Route: crypto-global
X-Data-Source: coingecko
X-Cache: HIT
X-Cache-TTL: 60
X-Cache-Scope: shared-data-service
Cache-Control: no-store
```

These headers are designed for operational visibility and integration clarity. They do not expose secrets or raw client identifiers.

---

## Public API Examples

### Crypto Global Data

```bash
curl https://dashboard.ai-techart.com/api/crypto/global
```

Returns normalized global crypto market data in CHF.

### Weather Forecast

```bash
curl "https://dashboard.ai-techart.com/api/weather?key=zurich"
```

Supported city keys are defined in:

```txt
src/lib/types/weather.ts
```

### Bitcoin Market Chart

```bash
curl "https://dashboard.ai-techart.com/api/crypto/bitcoin/market-chart?days=7"
```

Supported day values:

```txt
7
30
90
```

Invalid values fall back to:

```txt
7
```

### Bitcoin OHLC Chart

```bash
curl "https://dashboard.ai-techart.com/api/crypto/bitcoin/ohlc?days=7"
```

---

## Security Posture

Implemented production security controls include:

- Content-Security-Policy
- Referrer-Policy
- X-Content-Type-Options
- X-Frame-Options
- Permissions-Policy
- Cross-Origin-Opener-Policy
- Cross-Origin-Resource-Policy
- Strict-Transport-Security
- disabled framework powered-by header
- no secrets in client-side code
- Redis-backed rate limiting
- hashed client identifiers for rate-limit keys
- feature-flag kill switch for cost-sensitive AI execution
- dependency audit workflow
- production smoke test verification

Security documentation:

```txt
docs/security.md
```

---

## Testing and Verification

The project includes automated tests for:

- feature flags
- request client identification
- Redis client initialization
- cache utilities
- rate-limit headers
- external API clients
- cached data providers
- public API validation safeguards
- public API runtime behavior
- market insights database queries
- selected UI components

Primary quality commands:

```bash
pnpm type-check
pnpm lint
pnpm test:ci
pnpm build
pnpm audit
pnpm audit --prod
```

Production smoke test:

```bash
pnpm smoke:prod
```

The production smoke test validates:

- key HTML routes
- robots.txt
- sitemap.xml
- OpenGraph image
- public API endpoints
- response status codes
- content types
- security headers
- public API observability headers
- absence of the framework powered-by header
- basic JSON response shapes

Current production smoke test coverage:

```txt
201 checks
0 expected failures
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

Open locally:

```txt
http://localhost:3000
```

Run the main local quality gate:

```bash
pnpm type-check
pnpm lint
pnpm test:ci
pnpm build
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

## Environment Variables

Required locally in `.env.local`.

Never commit `.env.local`.

### CoinGecko

```env
COINGECKO_API_KEY=...
```

### Neon Postgres

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

### Upstash Redis

```env
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
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

AI execution is disabled by default through:

```env
FEATURE_AI_MARKET_SUMMARY_ENABLED=false
```

---

## Production Status

Implemented and deployed:

```txt
Next.js dashboard
Crypto overview
Crypto detail pages
Weather module
Public API routes
Neon Postgres integration
Drizzle schema and migrations
Market Insights Archive
Feature flags
AI market summary API route
Redis cache infrastructure
Redis rate limiting
Public API observability headers
Production security headers
Production smoke test
Expanded Jest test coverage
```

Intentionally disabled:

```txt
Public AI market summary execution
```

Reason:

```txt
AI execution is cost-sensitive.
The route is implemented and protected.
The feature remains behind a server-side kill switch.
Activation requires deliberate billing, provider and usage-limit configuration.
```

---

## Project Principles

This project is guided by the following engineering principles:

```txt
Production behavior over mock-only behavior
Explicit trade-offs over hidden assumptions
Server-side secrets only
Cost-sensitive features behind feature flags
Shared data providers instead of duplicated fetch logic
Observable API responses
Redis as controlled cache layer
No browser/CDN caching dependency for public JSON APIs
Small deployable increments
Quality gates before production changes
```

---

## Documentation Map

```txt
README.md                       Project overview and operational entry point
docs/architecture.md            System architecture and runtime flows
docs/security.md                Security controls and production headers
scripts/smoke-test-production.mjs Production smoke test runner
```

Recommended next documentation additions:

```txt
docs/case-study.md
docs/openapi.yaml
docs/operations.md
docs/decisions/
SECURITY.md
CHANGELOG.md
```

---

## Roadmap

Near-term improvements:

```txt
Architecture diagrams
Engineering case study
OpenAPI specification for public APIs
Operations runbook
Security policy and threat model
Project changelog
Optional accessibility audit documentation
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
```

Security:

```txt
docs/security.md
```

Production smoke test:

```txt
scripts/smoke-test-production.mjs
```

Live deployment:

```txt
https://dashboard.ai-techart.com
```