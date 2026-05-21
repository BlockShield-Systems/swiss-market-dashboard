# Architecture

This document describes the runtime architecture of the Swiss Market Dashboard.

The goal is to explain how the application is structured, how data flows through the system, where external providers are used, how caching and rate limiting are applied, and how operational controls such as feature flags and production verification fit together.

Visual diagrams are maintained separately:

```txt
docs/architecture-diagrams.md
```

---

## System Scope

Swiss Market Dashboard is a production-oriented full-stack data application built with:

```txt
Next.js App Router
React
TypeScript
Vercel
Neon Postgres
Drizzle ORM
Upstash Redis
CoinGecko API
Open-Meteo API
Vercel AI Gateway integration
```

Production deployment:

```txt
https://dashboard.ai-techart.com
```

Repository:

```txt
https://github.com/BlockShield-Systems/swiss-market-dashboard
```

The application provides:

```txt
public dashboard pages
crypto market data
Swiss weather data
persistent market insights
public API routes
Redis-backed caching
Redis-backed rate limiting
security headers
feature-flagged AI infrastructure
production smoke-test verification
```

---

## High-Level Runtime Flow

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
  +-- Shared cached data providers
  |     |
  |     +-- Upstash Redis
  |     +-- CoinGecko API
  |     +-- Open-Meteo API
  |
  +-- Neon Postgres via Drizzle ORM
  +-- Vercel AI Gateway integration
```

The architecture avoids duplicated data-fetching paths by using shared cached data provider modules for both pages and public API routes where applicable.

---

## Application Layers

### Presentation Layer

The presentation layer is built with:

```txt
Next.js App Router
React
TypeScript
Tailwind CSS
UI components
Recharts
lightweight-charts
lucide-react
```

Public pages:

```txt
/
 /crypto
 /crypto/[id]
 /weather
 /insights
 /settings
 /about
```

Responsibilities:

```txt
render dashboard pages
display normalized market and weather data
provide interactive chart behavior
display persisted market insights
read feature-controlled defaults
avoid exposing server-side secrets
```

The UI uses server-side data access where possible and client components where interactivity is required.

---

### Route Handler Layer

Public API routes are implemented with Next.js Route Handlers.

Current public API routes:

```txt
GET /api/crypto/global
GET /api/weather?key=zurich
GET /api/crypto/{id}/market-chart?days=7
GET /api/crypto/{id}/ohlc?days=7
```

AI-ready route:

```txt
POST /api/ai/market-summary
```

Responsibilities:

```txt
validate request parameters
read from shared cached data providers
apply rate limiting on relevant paths
return stable JSON responses
expose safe observability headers
isolate third-party provider credentials
handle upstream failures without leaking internals
```

The public API contract is documented in:

```txt
docs/openapi.yaml
```

---

## Shared Cached Data Providers

Shared cached data providers centralize access to external market and weather data.

Current files:

```txt
src/lib/data/crypto-global.ts
src/lib/data/weather-forecast.ts
src/lib/data/coin-market-chart.ts
src/lib/data/coin-ohlc-chart.ts
```

Purpose:

```txt
avoid duplicated external API calls
reuse Redis-backed cache behavior
share normalized data between pages and API routes
keep provider-specific logic outside page components
make cache behavior testable
```

General flow:

```txt
Page or API route
  |
  v
Shared cached data provider
  |
  +-- read Redis cache
  |
  +-- return cached payload on HIT
  |
  +-- fetch external provider on MISS
  |
  +-- normalize provider response
  |
  +-- write Redis cache with TTL
  |
  v
Return normalized data
```

Current cache TTLs:

```txt
Crypto global data        60 seconds
Coin market chart data    300 seconds
Coin OHLC chart data      300 seconds
Weather forecast data     1800 seconds
```

---

## External Data Providers

### CoinGecko

CoinGecko is used for crypto market data.

Used for:

```txt
global crypto market data
coin market data
market chart data
OHLC/candlestick data
crypto asset images
```

Security and architecture rules:

```txt
CoinGecko access happens server-side.
The API key is read from environment variables.
The API key is never exposed to the browser.
Provider responses are normalized before public exposure.
Non-OK provider responses are handled explicitly.
```

---

### Open-Meteo

Open-Meteo is used for Swiss weather forecast data.

Used for:

```txt
weather forecast data
Swiss city weather module
weather API responses
```

Security and architecture rules:

```txt
Open-Meteo access happens server-side.
Weather responses are normalized before use.
Invalid city keys are rejected or handled according to route behavior.
Forecast data is cached in Redis.
```

---

## Redis Layer

Redis provider:

```txt
Upstash Redis
```

Redis is used for:

```txt
shared data cache
public API rate limiting
AI route rate limiting
AI response cache
short-lived operational state
```

Core Redis-related files:

```txt
src/lib/redis.ts
src/lib/cache.ts
src/lib/rate-limit.ts
src/lib/public-api-rate-limit.ts
src/lib/request-ip.ts
```

Redis design goals:

```txt
reduce external provider pressure
avoid duplicated provider calls
support consistent cache behavior across pages and APIs
provide rate-limit state
avoid exposing raw client identifiers
keep cache data server-side
```

Public API JSON responses currently use:

```txt
Cache-Control: no-store
```

Reason:

```txt
Redis is the controlled cache layer.
Browser and CDN caching are not the primary cache mechanism for public JSON APIs.
```

---

## Rate Limiting

Public APIs use Redis-backed rate limiting.

Current public API rate limits:

```txt
Crypto market data APIs   60 requests / minute / client identifier
General public APIs       120 requests / minute / client identifier
```

AI route limit:

```txt
AI summary route          5 requests / 10 minutes / client identifier
```

Rate limiting is applied to reduce:

```txt
public API abuse
cache-miss amplification
external provider pressure
cost-sensitive AI execution
```

Client identifiers are derived from request information and are not returned in public API responses.

Public rate-limit headers may include:

```txt
X-RateLimit-Limit
X-RateLimit-Remaining
X-RateLimit-Reset
X-RateLimit-Policy
X-RateLimit-Window
```

---

## Public API Observability

Public API responses expose standardized headers for operational visibility.

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

Purpose:

```txt
identify the logical route
identify the upstream data source
show Redis cache state
show cache TTL
show cache scope
show rate-limit state
support integration debugging
```

These headers must not expose:

```txt
provider credentials
database URLs
Redis tokens
raw Redis keys
raw client identifiers
private deployment configuration
```

---

## Database Layer

Database provider:

```txt
Neon Postgres
```

ORM:

```txt
Drizzle ORM
```

Migration tooling:

```txt
Drizzle Kit
```

Primary persisted data:

```txt
market_insights
```

Purpose:

```txt
store seeded market insights
support the /insights route
prepare for future AI-generated market summaries
keep persistent data separate from cached provider data
```

Database access rules:

```txt
database access happens server-side
DATABASE_URL is never exposed to the browser
migrations are version-controlled
public users do not receive direct database access
current insights UI is read-only
```

Database commands:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
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

## Feature Flags

Feature flags are used as operational controls.

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

Feature flags are used to:

```txt
control optional functionality
disable cost-sensitive AI execution
configure default chart behavior
support controlled rollout
avoid unnecessary redeployments for simple runtime decisions
```

Valid chart modes:

```txt
area
line
candlestick
```

---

## AI-Ready Market Summary Route

AI route:

```txt
POST /api/ai/market-summary
```

Current production state:

```env
FEATURE_AI_MARKET_SUMMARY_ENABLED=false
```

The route exists but is disabled in production by default.

Intended protection flow:

```txt
feature flag check
request validation
Redis-backed AI rate limit
AI response cache lookup
market context fetch
AI Gateway call
optional persistence
cache write
JSON response
```

Implemented controls:

```txt
server-side feature flag
request validation
Redis-backed rate limiting
Redis-backed response caching
server-side AI Gateway access
no client-side AI provider key exposure
prompt constraints against financial advice
```

The route should only be enabled after confirming:

```txt
billing limits
provider quota
rate-limit behavior
cache behavior
error handling
output constraints
monitoring expectations
production verification
```

---

## Security Architecture

Security controls are documented in:

```txt
SECURITY.md
docs/security.md
docs/threat-model.md
```

Implemented security controls include:

```txt
server-side secret handling
placeholder-only .env.example
security headers
Content-Security-Policy
disabled x-powered-by header
Redis-backed rate limiting
Redis-backed caching
feature-flagged AI route
stable API error responses
production smoke-test verification
```

Sensitive values must remain server-side:

```txt
COINGECKO_API_KEY
DATABASE_URL
DATABASE_URL_UNPOOLED
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
AI_GATEWAY_API_KEY
```

---

## Deployment Architecture

Deployment target:

```txt
Vercel
```

Production domain:

```txt
https://dashboard.ai-techart.com
```

Vercel provides:

```txt
production deployments
preview deployments
environment variables
domain routing
runtime logs
deployment logs
analytics
speed insights
```

Production environment variables are managed through Vercel project settings.

Local environment variables are stored in:

```txt
.env.local
```

Public examples use:

```txt
.env.example
```

The example file must contain placeholders only.

---

## Build and Runtime Notes

The build may show:

```txt
Using edge runtime on a page currently disables static generation for that page
```

Current known source:

```txt
src/app/opengraph-image.tsx
export const runtime = "edge";
```

This is expected for the dynamic OpenGraph image route and does not indicate a failure of normal dashboard pages.

Production validation remains:

```bash
pnpm build
pnpm smoke:prod
```

---

## Testing and Verification

Main verification commands:

```bash
pnpm type-check
pnpm lint
pnpm test:ci
pnpm build
```

Security and dependency checks:

```bash
pnpm audit
pnpm audit --prod
```

Production smoke test:

```bash
pnpm smoke:prod
```

The smoke test validates:

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

## Architecture Constraints

Current deliberate constraints:

```txt
AI execution is disabled in production by default.
Public JSON APIs use Redis as the controlled cache layer.
Browser and CDN caching are not relied on for public JSON API data.
Secrets are server-side only.
The current public UI does not expose authenticated user features.
The current insights UI is read-only.
The OpenGraph image route uses Edge runtime.
```

Deferred intentionally:

```txt
public AI UI action
authentication system
admin panel
premium or user-specific area
sandbox
```

These features should only be added when the product boundary and operational requirements are clear.

---

## Change Impact Rules

When public API behavior changes:

```txt
update docs/openapi.yaml
update route tests
run the quality gate
run the production smoke test
```

When cache TTLs or rate limits change:

```txt
update README.md
update docs/openapi.yaml where headers or behavior are affected
update docs/operations.md
update tests if values are asserted
```

When security behavior changes:

```txt
update SECURITY.md if reporting or policy scope changes
update docs/security.md
update docs/threat-model.md if risk assumptions change
run pnpm smoke:prod
```

When architecture changes:

```txt
update docs/architecture.md
update docs/architecture-diagrams.md
update README.md documentation map if needed
```

---

## Related Documentation

```txt
README.md                         Project overview and operational entry point
SECURITY.md                       Security policy and vulnerability reporting
docs/architecture-diagrams.md     Visual architecture and runtime diagrams
docs/case-study.md                Engineering case study and trade-off analysis
docs/openapi.yaml                 Public API contract for market and weather endpoints
docs/operations.md                Operations runbook and production verification procedures
docs/security.md                  Technical security controls and production headers
docs/threat-model.md              Public threat model and risk overview
scripts/smoke-test-production.mjs Production smoke-test runner
```
