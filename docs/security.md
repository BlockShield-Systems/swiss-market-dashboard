# Security Controls

This document describes the technical security controls used by the Swiss Market Dashboard.

For vulnerability reporting, use:

```txt
SECURITY.md
```

For the public risk overview, use:

```txt
docs/threat-model.md
```

---

## Scope

This document covers the implemented security controls for the production application and public API routes.

Production:

```txt
https://dashboard.ai-techart.com
```

Repository:

```txt
https://github.com/BlockShield-Systems/swiss-market-dashboard
```

Covered areas:

```txt
security headers
secret handling
public API protection
Redis-backed caching
Redis-backed rate limiting
feature flags
AI route controls
dependency checks
production smoke-test verification
```

---

## Security Principles

The project follows these operational security principles:

```txt
Keep secrets server-side.
Use placeholders in public examples.
Do not expose provider credentials to the browser.
Use Redis as the controlled cache and rate-limit layer.
Rate-limit cache-miss and cost-sensitive paths.
Keep AI execution behind a server-side feature flag.
Expose safe observability headers, not secrets.
Verify production behavior with a smoke test.
```

---

## Secret Management

Secrets are stored in environment variables.

Local development uses:

```txt
.env.local
```

The file must never be committed.

The public example file must contain placeholders only:

```txt
.env.example
```

Sensitive variables:

```env
COINGECKO_API_KEY=...
DATABASE_URL=...
DATABASE_URL_UNPOOLED=...
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
AI_GATEWAY_API_KEY=...
```

Non-secret operational configuration:

```env
FEATURE_MARKET_INSIGHTS_ENABLED=true
FEATURE_AI_MARKET_SUMMARY_ENABLED=false
FEATURE_DEFAULT_CRYPTO_CHART_MODE=area
AI_MARKET_SUMMARY_MODEL=alibaba/qwen-3-14b
```

Production secrets are managed through Vercel environment variables.

Security expectations:

```txt
No real secrets in source code.
No real secrets in documentation.
No real secrets in .env.example.
No provider credentials in client bundles.
No provider credentials in public API responses.
Rotate exposed credentials immediately.
```

---

## Public API Protection

Public API routes are implemented with Next.js Route Handlers.

Current public API routes:

```txt
GET /api/crypto/global
GET /api/weather?key=zurich
GET /api/crypto/{id}/market-chart?days=7
GET /api/crypto/{id}/ohlc?days=7
```

API contract:

```txt
docs/openapi.yaml
```

Implemented controls:

```txt
server-side provider access
input validation
Redis-backed cache
Redis-backed rate limiting
stable JSON responses
standardized observability headers
safe upstream failure handling
```

Expected public error categories:

```txt
400 Bad Request
429 Too Many Requests
502 Bad Gateway
```

Public responses must not expose:

```txt
API keys
database URLs
Redis tokens
raw Redis keys
raw client identifiers
internal stack traces
private deployment configuration
```

---

## API Observability Headers

Public API responses expose standardized operational headers.

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
show route identity
show upstream data source
show cache status
show cache TTL
show cache scope
show rate-limit state
support debugging and integration clarity
```

These headers are intentionally limited. They do not expose secrets or raw infrastructure details.

---

## Redis Cache

Upstash Redis is used for shared data caching.

Current cache TTLs:

```txt
Crypto global data        60 seconds
Coin market chart data    300 seconds
Coin OHLC chart data      300 seconds
Weather forecast data     1800 seconds
AI response cache         1800 seconds
```

Shared cached data provider files:

```txt
src/lib/data/crypto-global.ts
src/lib/data/weather-forecast.ts
src/lib/data/coin-market-chart.ts
src/lib/data/coin-ohlc-chart.ts
```

Security and reliability goals:

```txt
reduce external provider pressure
avoid duplicate fetch logic
keep cache behavior server-side
expose cache status safely through response headers
avoid browser or CDN caching dependency for public JSON APIs
```

Public JSON API routes currently use:

```txt
Cache-Control: no-store
```

Reason:

```txt
Redis is the controlled cache layer for public JSON API data.
```

---

## Rate Limiting

Upstash Redis is also used for rate limiting.

Current public limits:

```txt
Crypto market data APIs   60 requests / minute / client identifier
General public APIs       120 requests / minute / client identifier
```

AI route limit:

```txt
AI summary route          5 requests / 10 minutes / client identifier
```

Rate-limit behavior:

```txt
cache hits can be served without unnecessary provider calls
cache misses are protected where external provider pressure is relevant
429 responses include rate-limit headers where applicable
client identifiers are not returned in public responses
```

Current public API policies:

```txt
market-data-api
public-api
```

---

## HTTP Security Headers

The application configures production security headers through Next.js configuration.

Expected header categories:

```txt
Content-Security-Policy
Referrer-Policy
X-Content-Type-Options
X-Frame-Options
X-Permitted-Cross-Domain-Policies
Cross-Origin-Opener-Policy
Cross-Origin-Resource-Policy
Permissions-Policy
Strict-Transport-Security
```

The framework powered-by header is disabled:

```txt
x-powered-by
```

Expected behavior:

```txt
Public routes should not expose x-powered-by.
```

Security goals:

```txt
reduce framework fingerprinting
block framing
reduce MIME sniffing
restrict browser capabilities
limit referrer leakage
enforce HTTPS behavior where applicable
provide a baseline Content Security Policy
```

Production verification:

```bash
pnpm smoke:prod
```

Expected result:

```txt
201 checks passed
0 checks failed
```

---

## Content Security Policy

The application uses a Content Security Policy to restrict browser behavior.

Current CSP goals:

```txt
default to same-origin behavior
block object embedding
block framing
limit connection sources
allow required analytics endpoints
allow required image sources
support framework runtime requirements
```

CSP changes should be treated carefully.

Recommended checks after CSP changes:

```bash
pnpm build
pnpm smoke:prod
```

Manual browser verification is also recommended because overly strict CSP changes can break scripts, styles, analytics, images, or runtime behavior.

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

Security purpose:

```txt
disable cost-sensitive behavior
control optional routes
avoid accidental AI execution
support controlled rollout
```

---

## AI Route Controls

AI route:

```txt
POST /api/ai/market-summary
```

Current production state:

```env
FEATURE_AI_MARKET_SUMMARY_ENABLED=false
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

The route is intentionally disabled in production by default.

Before enabling it publicly, verify:

```txt
billing limits
provider quota
rate-limit behavior
cache behavior
error handling
output constraints
monitoring expectations
production smoke-test behavior
```

---

## Database Security

Database provider:

```txt
Neon Postgres
```

ORM:

```txt
Drizzle ORM
```

Runtime database variable:

```env
DATABASE_URL=...
```

Migration database variable:

```env
DATABASE_URL_UNPOOLED=...
```

Current database security posture:

```txt
database credentials are server-side only
migrations are version-controlled
public users do not receive direct database access
current insights UI is read-only
no public manual insight write endpoint exists
```

Database commands:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm db:studio
```

---

## Dependency Security

Dependency checks are part of the verification process.

Commands:

```bash
pnpm audit
pnpm audit --prod
```

General expectations:

```txt
review dependency advisories
avoid unnecessary dependencies
keep framework and tooling current
verify lockfile changes
run audits before production releases
```

Dependency audits do not prove that unknown vulnerabilities do not exist, but they are an important baseline check.

---

## Production Verification

Primary verification commands:

```bash
pnpm type-check
pnpm lint
pnpm test:ci
pnpm build
pnpm audit
pnpm audit --prod
pnpm smoke:prod
```

The production smoke test validates:

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

## Known Build Warning

The build can show:

```txt
Using edge runtime on a page currently disables static generation for that page
```

Current known source:

```txt
src/app/opengraph-image.tsx
export const runtime = "edge";
```

This is expected for the dynamic OpenGraph image route and does not indicate a failure of normal application pages.

Validation remains:

```bash
pnpm build
pnpm smoke:prod
```

---

## Security Change Checklist

Before merging security-relevant changes, verify:

```txt
No real secrets are committed.
.env.example contains placeholders only.
Security headers remain present.
x-powered-by remains absent.
Public API routes keep stable error behavior.
Public API observability headers remain safe.
Rate limits remain active where required.
AI route remains feature-flagged.
OpenAPI documentation remains aligned with public API behavior.
Production smoke test passes.
```

Recommended command sequence:

```bash
pnpm type-check
pnpm lint
pnpm test:ci
pnpm build
pnpm audit
pnpm audit --prod
pnpm smoke:prod
```

---

## Related Documentation

```txt
SECURITY.md                    Security policy and vulnerability reporting
docs/threat-model.md           Public threat model and risk overview
docs/openapi.yaml              Public API contract
docs/operations.md             Operational verification and rollback notes
docs/architecture.md           System architecture
docs/architecture-diagrams.md  Visual architecture diagrams
README.md                      Project overview
```
