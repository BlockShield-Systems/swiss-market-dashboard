# Project Evidence

This document collects objective, verifiable evidence about the current state of Swiss Market Dashboard.

It is not a claim of perfection. It is a structured record of what can be checked directly through source code, tests, documentation, production responses and local commands.

---

## Live System

Production deployment:

```txt
https://dashboard.ai-techart.com
```

Repository:

```txt
https://github.com/BlockShield-Systems/swiss-market-dashboard
```

---

## Runtime Surface

Current production routes:

```txt
/
 /crypto
 /crypto/[id]
 /weather
 /insights
 /settings
 /about
 /robots.txt
 /sitemap.xml
 /opengraph-image
```

Current public API routes:

```txt
GET /api/crypto/global
GET /api/weather?key=zurich
GET /api/crypto/bitcoin/market-chart?days=7
GET /api/crypto/bitcoin/ohlc?days=7
```

AI-ready route:

```txt
POST /api/ai/market-summary
```

Current AI execution state:

```env
FEATURE_AI_MARKET_SUMMARY_ENABLED=false
```

Reason:

```txt
AI execution is cost-sensitive and remains behind a server-side feature flag until provider billing, usage limits and operational controls are deliberately configured.
```

---

## Production Smoke Test Evidence

The project includes a production smoke test script:

```txt
scripts/smoke-test-production.mjs
```

Run:

```bash
pnpm smoke:prod
```

The smoke test verifies:

```txt
HTML route availability
robots.txt availability
sitemap.xml availability
OpenGraph image availability
public API availability
HTTP status codes
content types
security headers
public API observability headers
forbidden framework header absence
basic JSON response shapes
```

Current expected smoke test scope:

```txt
201 checks
0 expected failures
```

The smoke test target defaults to:

```txt
https://dashboard.ai-techart.com
```

Override target:

```bash
SMOKE_TEST_BASE_URL=https://example-preview.vercel.app pnpm smoke:prod
```

---

## Quality Gate Evidence

Primary local quality gate:

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

Production verification:

```bash
pnpm smoke:prod
```

These commands are intended to be run before production-facing changes are committed.

---

## Test Coverage Areas

The automated test suite currently covers:

```txt
Feature flag behavior
Request client identification
Redis client initialization
Cache utilities
Rate-limit helper behavior
External API clients
Cached data providers
Public API validation safeguards
Public API runtime behavior
Market insights database query helpers
Selected UI components
Production smoke-test behavior through live checks
```

Representative test locations:

```txt
__tests__/lib/flags.test.ts
__tests__/lib/request-ip.test.ts
__tests__/lib/redis.test.ts
__tests__/lib/cache.test.ts
__tests__/lib/rate-limit.test.ts
__tests__/lib/api/coingecko.test.ts
__tests__/lib/api/openmeteo.test.ts
__tests__/lib/data/cached-data.test.ts
__tests__/app/api/public-api-validation.test.ts
__tests__/app/api/public-api-runtime.test.ts
__tests__/app/api/ai-market-summary.test.ts
__tests__/lib/market-insights.test.ts
__tests__/components/preferences-provider.test.tsx
__tests__/components/crypto-table.test.tsx
```

---

## Security Evidence

Implemented production security controls include:

```txt
Content-Security-Policy
Referrer-Policy
X-Content-Type-Options
X-Frame-Options
Permissions-Policy
Cross-Origin-Opener-Policy
Cross-Origin-Resource-Policy
Strict-Transport-Security
Disabled framework powered-by header
Server-side secret handling
Redis-backed rate limiting
Hashed client identifiers for rate-limit keys
Feature-flag kill switch for AI execution
Dependency audits
Production smoke-test verification
```

Security documentation:

```txt
docs/security.md
```

Example production header check:

```bash
curl -I https://dashboard.ai-techart.com
```

Example API header check:

```bash
curl -I https://dashboard.ai-techart.com/api/crypto/global
```

---

## Public API Observability Evidence

Public API responses expose standardized observability headers:

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

Expected relevant headers include:

```txt
X-API-Route: crypto-global
X-Data-Source: coingecko
X-Cache: HIT
X-Cache-TTL: 60
X-Cache-Scope: shared-data-service
Cache-Control: no-store
```

The exact `X-Cache` value may vary depending on runtime state:

```txt
HIT
MISS
SKIP
```

---

## Cache and Rate-Limit Evidence

Shared cached data service files:

```txt
src/lib/data/crypto-global.ts
src/lib/data/weather-forecast.ts
src/lib/data/coin-market-chart.ts
src/lib/data/coin-ohlc-chart.ts
```

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

Rate-limit helper files:

```txt
src/lib/public-api-rate-limit.ts
src/lib/rate-limit.ts
src/lib/request-ip.ts
```

Cache helper file:

```txt
src/lib/cache.ts
```

Redis client file:

```txt
src/lib/redis.ts
```

---

## Data and Persistence Evidence

Persistent storage:

```txt
Neon Postgres
```

ORM and migrations:

```txt
Drizzle ORM
Drizzle Kit
```

Primary persistence area:

```txt
market_insights
```

Representative files:

```txt
src/lib/db/schema.ts
src/lib/db/queries/market-insights.ts
src/lib/db/seed.ts
```

Purpose:

```txt
Persistent market insight archive
Manual seeded insight records
Prepared storage path for future AI-generated summaries
```

---

## External Data Integration Evidence

CoinGecko integration:

```txt
src/lib/api/coingecko.ts
```

Used for:

```txt
Global crypto market data
Coin market data
Coin detail data
Market chart data
OHLC data
```

Open-Meteo integration:

```txt
src/lib/api/openmeteo.ts
```

Used for:

```txt
Swiss weather forecast data
```

Both integrations are accessed server-side.

---

## Feature Flag Evidence

Feature flag files:

```txt
src/lib/flags.ts
```

Configured flags:

```env
FEATURE_MARKET_INSIGHTS_ENABLED=true
FEATURE_AI_MARKET_SUMMARY_ENABLED=false
FEATURE_DEFAULT_CRYPTO_CHART_MODE=area
```

Purpose:

```txt
Controlled rollout
Cost-sensitive feature protection
Operational kill switches
Default chart mode configuration
```

---

## Documentation Evidence

Current documentation map:

```txt
README.md
docs/architecture.md
docs/architecture-diagrams.md
docs/case-study.md
docs/openapi.yaml
docs/security.md
docs/feedback.md
docs/project-evidence.md
```

Planned documentation additions:

```txt
docs/operations.md
docs/threat-model.md
docs/decisions/
SECURITY.md
CHANGELOG.md
```

---

## Current Known Constraints

Current constraints are explicit:

```txt
AI execution is implemented but disabled in production.
No authentication system is implemented.
No admin panel is implemented.
No sandbox is implemented.
No premium or user account area is implemented.
```

These constraints are intentional. The current system focuses on public market data, public API behavior, production safety, observability, caching, rate limiting and transparent documentation.

---

## Verification Philosophy

The project favors evidence that can be checked directly:

```txt
Source code
Tests
Production responses
Response headers
Smoke-test output
Security headers
Documented trade-offs
Explicit feature flags
Reproducible commands
```

This is preferred over unverifiable claims.