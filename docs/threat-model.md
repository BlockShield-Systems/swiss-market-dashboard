# Threat Model

This document describes the public threat model for the Swiss Market Dashboard.

The goal is to document the main security assumptions, protected assets, trust boundaries, relevant risks, existing mitigations, and remaining limitations in a concise and reviewable way.

This is not a penetration-test report and does not contain exploit instructions.

---

## System Scope

The threat model applies to the public production deployment and the source repository.

```txt
Production URL:
https://dashboard.ai-techart.com

Repository:
https://github.com/BlockShield-Systems/swiss-market-dashboard
```

Covered areas:

```txt
Public dashboard pages
Public API routes
Server-side data fetching
Redis-backed caching
Redis-backed rate limiting
Neon Postgres persistence
Feature flags
Security headers
AI-ready market summary route
Production smoke-test verification
```

Covered public pages:

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

Covered public API routes:

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

Current production state:

```env
FEATURE_AI_MARKET_SUMMARY_ENABLED=false
```

The AI route is implemented but intentionally disabled in production unless operational cost, rate-limit, and provider controls are explicitly confirmed.

---

## Out of Scope

The following areas are outside this threat model:

```txt
Security of third-party infrastructure providers
Security of client devices
Security of browser extensions
Social engineering against maintainers
Physical attacks
Compromised developer machines
Attacks against GitHub, Vercel, Neon, Upstash, CoinGecko, Open-Meteo, or Vercel AI Gateway
```

Third-party providers remain important dependencies, but their internal security is governed by their own policies and controls.

---

## System Overview

The application is a Next.js full-stack dashboard deployed on Vercel.

High-level flow:

```txt
Browser
  |
  v
Vercel Edge / CDN
  |
  v
Next.js Application
  |
  +-- Public pages
  +-- Public API route handlers
  +-- Shared cached data services
  +-- Security headers
  +-- Feature flags
  |
  +-- Upstash Redis
  |     +-- shared cache
  |     +-- rate limiting
  |
  +-- Neon Postgres
  |     +-- market insights
  |
  +-- External providers
        +-- CoinGecko
        +-- Open-Meteo
        +-- Vercel AI Gateway
```

Important design principles:

```txt
Secrets stay server-side.
External provider calls happen server-side.
Public API routes expose stable JSON contracts.
Redis is used as the controlled cache layer.
Rate limits reduce abuse and external provider pressure.
Security headers are verified in production.
AI execution is guarded by a server-side feature flag.
```

---

## Trust Boundaries

The main trust boundaries are:

```txt
Public client -> Vercel / Next.js application
Next.js application -> Redis
Next.js application -> Neon Postgres
Next.js application -> external data providers
Deployment environment -> runtime secrets
Source repository -> production deployment
```

Public clients are considered untrusted.

The application must not trust:

```txt
query parameters
path parameters
request headers controlled by clients
request bodies
user agents
external provider availability
external provider response shape
```

Server-side systems are trusted only within their intended responsibility:

```txt
Redis stores short-lived cache and rate-limit state.
Neon stores persistent market insight data.
Vercel stores deployment configuration and environment variables.
External providers return market, weather, or AI data but are not treated as always available or always valid.
```

---

## Protected Assets

### Sensitive Assets

These must never be exposed publicly:

```txt
COINGECKO_API_KEY
DATABASE_URL
DATABASE_URL_UNPOOLED
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
AI_GATEWAY_API_KEY
provider credentials
database connection details
Redis credentials
internal stack traces
private deployment configuration
```

### Public Assets

These are intentionally public:

```txt
dashboard pages
public API responses
public response headers
OpenAPI documentation
architecture documentation
security documentation
robots.txt
sitemap.xml
OpenGraph image
```

Public assets still require integrity and availability.

### Operational Assets

These support safe operation:

```txt
feature flags
cache TTLs
rate-limit policies
database migrations
smoke-test script
test suite
build configuration
dependency lockfile
documentation map
```

---

## Main Risks and Mitigations

### 1. Secret Exposure

Risk:

```txt
A real API key, database URL, Redis token, or AI Gateway key is accidentally committed, logged, exposed in a response, or included in documentation.
```

Current mitigations:

```txt
Secrets are read from environment variables.
.env.local is ignored by Git.
.env.example uses placeholders only.
Provider calls happen server-side.
No public API response should include secrets.
No client bundle should contain server-side credentials.
```

Verification:

```bash
git status
pnpm build
pnpm smoke:prod
```

Additional manual check:

```bash
git grep "COINGECKO_API_KEY"
git grep "DATABASE_URL"
git grep "UPSTASH_REDIS_REST_TOKEN"
git grep "AI_GATEWAY_API_KEY"
```

Expected result:

```txt
Only safe configuration references and placeholders should appear.
No real secret values should appear.
```

---

### 2. Public API Abuse

Risk:

```txt
Public API endpoints can be requested repeatedly by automated clients, causing unnecessary load or external provider pressure.
```

Current mitigations:

```txt
Redis-backed rate limiting
cache-first data flow
short-lived Redis cache entries
stable 429 responses
public cache and rate-limit headers
separate policies for market-data and general public APIs
```

Current documented public API rate limits:

```txt
Crypto market data APIs: 60 requests per minute per client identifier
General public APIs: 120 requests per minute per client identifier
```

Residual risk:

```txt
Distributed clients can still spread requests across multiple network origins.
Additional provider-level or platform-level controls may be required if abuse increases.
```

---

### 3. Cache Misuse or Stale Data

Risk:

```txt
Clients receive stale data, or invalid inputs influence cache behavior.
```

Current mitigations:

```txt
server-side cache key builders
validated route parameters
limited allowed chart day values
known weather city keys
short TTLs for market data
longer TTL for weather forecast data
cache headers for visibility
```

Current cache TTLs:

```txt
Crypto global data: 60 seconds
Crypto market chart data: 300 seconds
Crypto OHLC chart data: 300 seconds
Weather forecast data: 1800 seconds
```

Residual risk:

```txt
Market and weather data freshness still depends on external providers and configured TTLs.
```

---

### 4. External Provider Failure

Risk:

```txt
CoinGecko, Open-Meteo, or the AI provider can fail, rate-limit, return unexpected data, or become temporarily unavailable.
```

Current mitigations:

```txt
server-side provider clients
non-OK response handling
response normalization
Redis caching
stable public error responses
502 behavior for upstream failures
tests for external API clients and data providers
```

Expected public behavior:

```txt
The application should not expose provider credentials, raw internal errors, or stack traces.
```

Residual risk:

```txt
Fresh data availability cannot be guaranteed during upstream provider outages.
```

---

### 5. Invalid Input

Risk:

```txt
Unexpected coin IDs, unsupported chart day values, invalid weather city keys, or malformed request bodies can reach route handlers.
```

Current mitigations:

```txt
route-level validation
allowed day values
known city keys
safe fallback behavior where documented
400 responses for invalid inputs where applicable
OpenAPI contract for public routes
tests for public API validation
```

Relevant documentation:

```txt
docs/openapi.yaml
```

Residual risk:

```txt
New routes must follow the same validation pattern to avoid inconsistent behavior.
```

---

### 6. Security Header Regression

Risk:

```txt
A future configuration change removes or weakens security headers.
```

Current mitigations:

```txt
centralized header configuration
Content-Security-Policy
Referrer-Policy
X-Content-Type-Options
X-Frame-Options
Permissions-Policy
Cross-Origin-Opener-Policy
Cross-Origin-Resource-Policy
Strict-Transport-Security
disabled x-powered-by header
production smoke-test verification
```

Verification command:

```bash
pnpm smoke:prod
```

Expected result:

```txt
201 checks passed
0 checks failed
```

The smoke test also verifies that public routes do not expose:

```txt
x-powered-by
```

---

### 7. AI Route Cost and Output Risk

Risk:

```txt
AI execution can create cost, provider quota usage, unreliable output, or misleading generated content.
```

Current mitigations:

```txt
AI route disabled by default in production
server-side feature flag
input validation
Redis-backed AI rate limiting
AI response caching
no public UI trigger for uncontrolled execution
prompt constraints against financial advice
```

Current production setting:

```env
FEATURE_AI_MARKET_SUMMARY_ENABLED=false
```

Residual risk:

```txt
If the route is enabled publicly, billing limits, provider quotas, rate limits, output quality, and monitoring must be reviewed again.
```

---

### 8. Database Exposure or Misuse

Risk:

```txt
Database credentials or write paths could be exposed, or persistent data could be modified through unintended public behavior.
```

Current mitigations:

```txt
DATABASE_URL remains server-side only.
Drizzle ORM is used for structured database access.
Migrations are version-controlled.
The current public UI does not expose a manual write endpoint for insights.
The insights page reads controlled persisted data.
```

Residual risk:

```txt
Future write endpoints or authenticated features require a dedicated security review.
```

---

### 9. Dependency and Supply-Chain Risk

Risk:

```txt
A direct or transitive dependency can contain a vulnerability or unsafe behavior.
```

Current mitigations:

```txt
pnpm lockfile
dependency audit commands
TypeScript checks
linting
test suite
production build validation
limited dependency additions
```

Verification commands:

```bash
pnpm audit
pnpm audit --prod
```

Residual risk:

```txt
Dependency audits do not prove that unknown vulnerabilities do not exist.
```

---

## Security Invariants

The following statements should remain true after future changes:

```txt
No real secrets are committed.
.env.example contains placeholders only.
Public routes do not expose x-powered-by.
Production security headers are present.
Public API routes validate input.
Cache MISS paths are rate-limited where required.
Provider failures do not expose secrets or stack traces.
AI execution remains feature-flagged.
The OpenAPI contract matches public API behavior.
The production smoke test passes.
```

---

## Verification Baseline

Recommended verification commands:

```bash
pnpm type-check
pnpm lint
pnpm test:ci
pnpm build
pnpm audit
pnpm audit --prod
pnpm smoke:prod
```

Expected production smoke-test baseline:

```txt
201 checks passed
0 checks failed
```

---

## Review Triggers

This threat model should be reviewed when any of the following changes occur:

```txt
new public API route
new external provider
new authentication or user account feature
new public write endpoint
AI route enabled in production
rate-limit policy changed
cache TTL changed
security headers changed
database schema changed for public behavior
deployment provider changed
new secret or environment variable added
```

---

## Related Documentation

```txt
SECURITY.md                    Security reporting policy
docs/security.md               Technical security controls and headers
docs/operations.md             Operational verification and rollback notes
docs/openapi.yaml              Public API contract
docs/architecture.md           System architecture
docs/architecture-diagrams.md  Visual architecture diagrams
README.md                      Project overview
```

---

## References

```txt
GitHub Security Policy Documentation
https://docs.github.com/en/code-security/getting-started/adding-a-security-policy-to-your-repository

OWASP Threat Modeling
https://owasp.org/www-community/Threat_Modeling

OWASP Top 10
https://owasp.org/www-project-top-ten/

Next.js Headers Configuration
https://nextjs.org/docs/app/api-reference/config/next-config-js/headers
```
