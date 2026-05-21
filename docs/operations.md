# Operations Runbook

This runbook documents operational procedures for Swiss Market Dashboard.

It focuses on local verification, production verification, environment configuration, known failure modes, provider behavior, rollback strategy and incident-oriented checks.

---

## 1. System Scope

Swiss Market Dashboard is a production-oriented fullstack data platform deployed on Vercel.

Current runtime scope:

```txt
Next.js App Router pages
Next.js Route Handlers
Public JSON APIs
Redis-backed shared cached data services
Redis-backed rate limiting
Neon Postgres persistence
Drizzle ORM migrations
External provider integrations
Feature flags
Security headers
Production smoke testing
```

Current public routes:

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

---

## 2. Deployment Target

Production deployment:

```txt
https://dashboard.ai-techart.com
```

Hosting platform:

```txt
Vercel
```

Primary managed services:

```txt
Neon Postgres
Upstash Redis
CoinGecko
Open-Meteo
Vercel AI Gateway integration
```

---

## 3. Required Environment Variables

Required local file:

```txt
.env.local
```

Never commit:

```txt
.env.local
```

### CoinGecko

```env
COINGECKO_API_KEY=...
```

Used for:

```txt
server-side CoinGecko requests
crypto global data
coin market data
coin detail data
market chart data
OHLC data
```

### Neon Postgres

```env
DATABASE_URL=...
DATABASE_URL_UNPOOLED=...
```

Usage:

```txt
DATABASE_URL          runtime database access
DATABASE_URL_UNPOOLED migration workflow
```

### Upstash Redis

```env
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

Used for:

```txt
shared cached data services
public API rate limiting
AI route rate limiting
AI response cache
short-lived operational state
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

Current production AI behavior:

```txt
The AI route is implemented but disabled through FEATURE_AI_MARKET_SUMMARY_ENABLED=false.
```

---

## 4. Local Setup

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

---

## 5. Local Quality Gate

Run before production-facing commits:

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

Recommended complete local verification:

```bash
pnpm type-check
pnpm lint
pnpm test:ci
pnpm build
pnpm audit
pnpm audit --prod
```

---

## 6. Production Smoke Test

Run production smoke test:

```bash
pnpm smoke:prod
```

Default target:

```txt
https://dashboard.ai-techart.com
```

Override target:

```bash
SMOKE_TEST_BASE_URL=https://example-preview.vercel.app pnpm smoke:prod
```

Windows PowerShell override:

```powershell
$env:SMOKE_TEST_BASE_URL = "https://example-preview.vercel.app"
pnpm smoke:prod
Remove-Item Env:SMOKE_TEST_BASE_URL
```

Current expected smoke-test scope:

```txt
201 checks
0 expected failures
```

The smoke test verifies:

```txt
HTML route availability
robots.txt
sitemap.xml
OpenGraph image
public API endpoints
status codes
content types
security headers
public API observability headers
absence of X-Powered-By header
basic JSON response shapes
```

Smoke test script:

```txt
scripts/smoke-test-production.mjs
```

---

## 7. Production Verification Checklist

After deployment, verify:

```bash
curl -I https://dashboard.ai-techart.com
curl -I https://dashboard.ai-techart.com/api/crypto/global
pnpm smoke:prod
```

Expected page-level security headers include:

```txt
content-security-policy
referrer-policy
x-content-type-options
x-frame-options
x-permitted-cross-domain-policies
cross-origin-opener-policy
cross-origin-resource-policy
permissions-policy
strict-transport-security
```

Expected absence:

```txt
x-powered-by
```

Expected public API observability headers include:

```txt
x-api-route
x-data-source
x-cache
x-cache-ttl
x-cache-scope
cache-control
```

Rate-limit headers are expected when the uncached/rate-limit path is evaluated:

```txt
x-ratelimit-limit
x-ratelimit-remaining
x-ratelimit-reset
x-ratelimit-policy
x-ratelimit-window
```

---

## 8. Public API Runtime Expectations

### Cache HIT

Expected behavior:

```txt
Return 200 JSON
Expose X-Cache: HIT
Avoid upstream provider call
Avoid public rate-limit check for shared cached data response
```

### Cache MISS

Expected behavior:

```txt
Read cache
Evaluate rate limit
Fetch upstream provider when allowed
Normalize response
Write Redis cache
Return 200 JSON
Expose X-Cache: MISS
Expose X-RateLimit-* headers
```

### Cache SKIP

Expected behavior:

```txt
Redis read failed or cache unavailable
Continue with upstream provider path
Evaluate rate limit
Return response if provider succeeds
Expose X-Cache: SKIP
```

### Rate Limit Exceeded

Expected behavior:

```txt
Return 429 JSON
Do not call upstream provider
Expose X-RateLimit-* headers
Expose cache observability headers
```

### Upstream Provider Failure

Expected behavior:

```txt
Return 502 JSON
Expose cache observability headers
Log provider failure server-side
```

---

## 9. Known Failure Modes

### CoinGecko Failure

Symptoms:

```txt
/api/crypto/global returns 502
/api/crypto/[id]/market-chart returns 502
/api/crypto/[id]/ohlc returns 502
crypto pages may show fallback or warning states
```

Checks:

```bash
curl -I https://dashboard.ai-techart.com/api/crypto/global
curl https://dashboard.ai-techart.com/api/crypto/global
pnpm smoke:prod
```

Likely causes:

```txt
CoinGecko outage
CoinGecko rate limiting
Invalid or missing COINGECKO_API_KEY
Network/provider latency
Unexpected response shape
```

Expected mitigation:

```txt
Redis HIT responses continue while cache is valid
Uncached paths return controlled 502 responses
Production smoke test identifies API failure
```

---

### Open-Meteo Failure

Symptoms:

```txt
/api/weather?key=zurich returns 502
weather page may show fallback or warning state
```

Checks:

```bash
curl -I "https://dashboard.ai-techart.com/api/weather?key=zurich"
curl "https://dashboard.ai-techart.com/api/weather?key=zurich"
pnpm smoke:prod
```

Likely causes:

```txt
Open-Meteo outage
network/provider latency
unexpected response shape
```

Expected mitigation:

```txt
Redis HIT responses continue while cache is valid
Uncached paths return controlled 502 responses
```

---

### Redis Failure

Symptoms:

```txt
X-Cache may become SKIP
rate-limit checks may be skipped depending on failure point
higher upstream provider usage
server logs contain Redis-related warnings
```

Checks:

```bash
curl -I https://dashboard.ai-techart.com/api/crypto/global
curl -I "https://dashboard.ai-techart.com/api/weather?key=zurich"
pnpm smoke:prod
```

Likely causes:

```txt
UPSTASH_REDIS_REST_URL missing or invalid
UPSTASH_REDIS_REST_TOKEN missing or invalid
Upstash outage
network issue
```

Expected behavior:

```txt
Cache read failures return SKIP rather than crashing the public API route.
Rate-limit failures are logged and skipped in current route behavior.
Provider fetch can still proceed if upstream is available.
```

Operational risk:

```txt
Provider pressure increases when Redis cache is unavailable.
Rate-limit protection can be degraded if Redis-based limiter is unavailable.
```

---

### Neon Postgres Failure

Symptoms:

```txt
/insights may fail or render error behavior
AI-generated persistence path would fail if AI is enabled
database query tests are unaffected locally when mocked
```

Checks:

```bash
pnpm db:studio
pnpm smoke:prod
```

Likely causes:

```txt
DATABASE_URL missing or invalid
Neon outage
migration mismatch
database connection issue
```

Expected mitigation:

```txt
Market and weather public APIs do not depend on Postgres.
The insights feature is isolated from public market/weather API availability.
```

---

### AI Gateway Failure

Current production state:

```txt
AI execution is disabled through FEATURE_AI_MARKET_SUMMARY_ENABLED=false.
```

If enabled in the future, possible symptoms:

```txt
503 gateway unavailable
429 AI route rate limit exceeded
provider/model errors
missing AI_GATEWAY_API_KEY
high cost exposure if limits are configured incorrectly
```

Current mitigation:

```txt
AI route remains behind server-side feature flag.
No public AI UI action is exposed.
AI route is not part of the public OpenAPI contract.
```

---

### Security Header Regression

Symptoms:

```txt
pnpm smoke:prod fails on missing security headers
curl -I output misses expected headers
browser console reports CSP violations
```

Checks:

```bash
curl -I https://dashboard.ai-techart.com
pnpm smoke:prod
```

Expected headers:

```txt
content-security-policy
referrer-policy
x-content-type-options
x-frame-options
permissions-policy
strict-transport-security
```

Expected absence:

```txt
x-powered-by
```

Mitigation:

```txt
Review next.config.ts header configuration.
Check whether a new third-party script, image or connection requires a CSP update.
Re-run production smoke test after deployment.
```

---

## 10. Rollback Strategy

Primary rollback mechanism:

```txt
Vercel deployment rollback
```

Recommended rollback conditions:

```txt
production smoke test fails after deployment
public API returns unexpected 5xx responses
security headers regress
major route becomes unavailable
CSP blocks core UI behavior
database migration causes runtime failure
```

Rollback steps:

```txt
1. Identify the last known good deployment in Vercel.
2. Promote or rollback to the last known good deployment.
3. Run pnpm smoke:prod.
4. Verify key curl checks.
5. Review logs for the failed deployment.
6. Create a corrective commit before redeploying.
```

Post-rollback checks:

```bash
curl -I https://dashboard.ai-techart.com
curl -I https://dashboard.ai-techart.com/api/crypto/global
pnpm smoke:prod
```

---

## 11. Database Operations

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

Operational notes:

```txt
Use DATABASE_URL_UNPOOLED for migrations.
Use DATABASE_URL for runtime access.
Do not commit local environment files.
Review generated migrations before applying them.
```

---

## 12. Cache Operations

Cache is managed through Upstash Redis.

Current public cache TTLs:

```txt
Crypto global data        60 seconds
Coin market chart data    300 seconds
Coin OHLC chart data      300 seconds
Weather forecast data     1800 seconds
```

Cache key examples:

```txt
public-api:crypto:global:v1
public-api:weather:zurich:v1
public-api:crypto:market-chart:bitcoin:7:v1
public-api:crypto:ohlc:bitcoin:7:v1
```

Cache status header values:

```txt
HIT
MISS
SKIP
```

Meaning:

```txt
HIT   Redis returned cached data
MISS  Redis was available but no cached value existed
SKIP  Cache operation failed or was skipped
```

---

## 13. Rate-Limit Operations

Public API rate-limit policies:

```txt
market-data-api
public-api
```

Current limits:

```txt
market-data-api   60 requests / minute / client identifier
public-api        120 requests / minute / client identifier
```

AI route limit:

```txt
5 requests / 10 minutes / client identifier
```

Client identifiers:

```txt
derived from forwarded request headers
hashed before Redis use
raw client identifiers are not exposed through public API responses
```

Rate-limit headers:

```txt
X-RateLimit-Limit
X-RateLimit-Remaining
X-RateLimit-Reset
X-RateLimit-Policy
X-RateLimit-Window
```

---

## 14. Feature Flag Operations

Current flags:

```env
FEATURE_MARKET_INSIGHTS_ENABLED=true
FEATURE_AI_MARKET_SUMMARY_ENABLED=false
FEATURE_DEFAULT_CRYPTO_CHART_MODE=area
```

Operational behavior:

```txt
FEATURE_MARKET_INSIGHTS_ENABLED controls the /insights route.
FEATURE_AI_MARKET_SUMMARY_ENABLED controls AI route execution.
FEATURE_DEFAULT_CRYPTO_CHART_MODE controls default chart mode.
```

Valid default chart modes:

```txt
area
line
candlestick
```

Invalid chart mode values fall back safely.

AI activation should require:

```txt
confirmed provider billing
confirmed usage limits
confirmed model availability
confirmed rate limiting
confirmed response caching
confirmed production smoke-test update
explicit rollback plan
```

---

## 15. Manual Production Checks

Homepage:

```bash
curl -I https://dashboard.ai-techart.com
```

Crypto global API:

```bash
curl -I https://dashboard.ai-techart.com/api/crypto/global
curl https://dashboard.ai-techart.com/api/crypto/global
```

Weather API:

```bash
curl -I "https://dashboard.ai-techart.com/api/weather?key=zurich"
curl "https://dashboard.ai-techart.com/api/weather?key=zurich"
```

Market chart API:

```bash
curl -I "https://dashboard.ai-techart.com/api/crypto/bitcoin/market-chart?days=7"
curl "https://dashboard.ai-techart.com/api/crypto/bitcoin/market-chart?days=7"
```

OHLC API:

```bash
curl -I "https://dashboard.ai-techart.com/api/crypto/bitcoin/ohlc?days=7"
curl "https://dashboard.ai-techart.com/api/crypto/bitcoin/ohlc?days=7"
```

---

## 16. Pre-Commit Checklist

Before committing production-facing changes:

```txt
No secrets committed
.env.local unchanged
TypeScript passes
ESLint passes
Jest passes
Production build passes
Audit passes
Documentation updated if behavior changed
OpenAPI updated if public API contract changed
Smoke test updated if production verification surface changed
```

Commands:

```bash
pnpm type-check
pnpm lint
pnpm test:ci
pnpm build
pnpm audit
pnpm audit --prod
```

---

## 17. Post-Deploy Checklist

After production deployment:

```txt
Production page returns 200
Public APIs return expected responses
Security headers exist
X-Powered-By is absent
OpenGraph image returns image/png
robots.txt returns text/plain
sitemap.xml returns XML
Smoke test passes
No unexpected browser console CSP errors
```

Commands:

```bash
curl -I https://dashboard.ai-techart.com
curl -I https://dashboard.ai-techart.com/api/crypto/global
pnpm smoke:prod
```

---

## 18. Documentation References

Primary project entry point:

```txt
README.md
```

Architecture:

```txt
docs/architecture.md
docs/architecture-diagrams.md
```

API contract:

```txt
docs/openapi.yaml
```

Security:

```txt
docs/security.md
```

Engineering case study:

```txt
docs/case-study.md
```

Project evidence:

```txt
```

Feedback guide:

```txt
```

Production smoke test:

```txt
scripts/smoke-test-production.mjs
```

---

## 19. Operating Principles

Operational decisions should follow these principles:

```txt
Prefer explicit verification over assumptions.
Prefer controlled rollout over public exposure by default.
Prefer server-side secrets only.
Prefer Redis as the controlled JSON API cache layer.
Prefer stable public API contracts.
Prefer observable response headers.
Prefer documented trade-offs.
Prefer rollback over live debugging when production behavior is broken.
Prefer small corrective commits over broad emergency changes.
```
