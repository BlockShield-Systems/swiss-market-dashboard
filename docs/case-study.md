# Engineering Case Study: Swiss Market Dashboard

Swiss Market Dashboard is a production-oriented fullstack data platform for Swiss market intelligence, crypto analytics, weather data, persistent market insights, public API routes, Redis-backed caching, rate limiting, feature flags and AI-ready market summary infrastructure.

This case study explains the technical context, architecture decisions, implementation trade-offs and operational verification model behind the system.

---

## 1. Project Context

The project was built around a simple but strict engineering question:

```txt
How can a public data dashboard be built with production-oriented behavior, observable API responses, controlled external API usage, security hardening and clear operational verification?
```

The result is a Next.js-based dashboard deployed on Vercel with:

```txt
Public dashboard pages
Public API routes
External data integrations
Redis-backed cached data services
Redis-backed rate limiting
Postgres-backed persistent insights
Feature flags
AI-ready server infrastructure
Security headers
Production smoke testing
Expanded automated test coverage
```

The system intentionally avoids unnecessary product complexity. It focuses on public market data, transparent runtime behavior and maintainable infrastructure.

---

## 2. Goals

The main goals were:

```txt
Build a useful public dashboard
Keep third-party API access server-side
Avoid duplicated data-fetching logic
Expose stable public API contracts
Make cache and rate-limit behavior externally observable
Protect cost-sensitive AI execution behind feature flags
Persist market insight records in SQL
Use Redis for shared cache and abuse prevention
Harden production HTTP responses
Verify production behavior after deployment
Document architecture and operational constraints
```

The project is not optimized for novelty. It is optimized for clarity, reliability and controlled runtime behavior.

---

## 3. Non-Goals

The following features are intentionally not part of the current system:

```txt
Authentication system
User accounts
Admin panel
Premium area
Public AI UI action
Sandbox
Payment flows
Community/forum functionality
```

Reason:

```txt
These features would increase complexity without improving the current core system boundary.
```

The current system boundary is:

```txt
public dashboard
public data APIs
persistent market insights
server-side integrations
observable cache/rate-limit behavior
controlled AI-ready infrastructure
production verification
```

---

## 4. Main Constraints

The project is shaped by several practical constraints.

### External API Constraints

The system depends on external providers:

```txt
CoinGecko
Open-Meteo
Vercel AI Gateway
```

These providers may have:

```txt
rate limits
latency variance
temporary failures
pricing changes
quota limits
billing requirements
response shape changes
```

The architecture responds to this with:

```txt
server-side API isolation
Redis-backed caching
rate limiting
response normalization
error handling
fallback behavior
production smoke testing
```

### AI Execution Constraint

AI market summary infrastructure is implemented but disabled in production.

Current flag:

```env
FEATURE_AI_MARKET_SUMMARY_ENABLED=false
```

Reason:

```txt
AI execution is cost-sensitive.
Provider billing and usage limits must be deliberately configured before public activation.
```

The route remains protected by:

```txt
feature flag
gateway key check
request validation
Redis rate limiting
Redis response cache
server-side execution only
```

### Budget and Infrastructure Constraint

The system uses managed services to reduce operational burden:

```txt
Vercel for hosting
Neon Postgres for SQL persistence
Upstash Redis for cache and rate limiting
CoinGecko and Open-Meteo for external data
```

This avoids maintaining custom servers while still allowing production-like runtime behavior.

---

## 5. High-Level Architecture

The architecture is organized around clear boundaries:

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
  +-- Server Components
  +-- Client Components
  +-- Route Handlers
        |
        +-- Shared Cached Data Services
        +-- Neon Postgres via Drizzle ORM
        +-- Upstash Redis cache and rate limiting
        +-- Vercel AI Gateway integration
```

Detailed architecture diagrams:

```txt
docs/architecture-diagrams.md
```

Main architecture document:

```txt
docs/architecture.md
```

---

## 6. Frontend Architecture

The frontend is built with:

```txt
Next.js App Router
React
TypeScript
Tailwind CSS
Reusable UI components
Recharts
lightweight-charts
lucide-react
```

Main routes:

```txt
/
 /crypto
 /crypto/[id]
 /weather
 /insights
 /settings
 /about
```

The UI combines:

```txt
server-rendered data loading
interactive client components
chart mode switching
market overview cards
weather overview
crypto tables
insight archive cards
locale-aware copy
```

The frontend does not directly access secrets or external provider credentials. External data access is isolated behind server-side helpers and route handlers.

---

## 7. API Architecture

Public API routes are implemented with Next.js Route Handlers:

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

Public API responsibilities:

```txt
normalize third-party data
protect upstream providers
avoid leaking credentials
return stable JSON contracts
apply shared Redis cache
apply rate limits on uncached paths
expose observability headers
return clear error responses
```

Common error responses include:

```txt
400 invalid request
429 rate limit exceeded
502 upstream/provider failure
```

---

## 8. Shared Cached Data Services

A key architectural decision was to avoid duplicated external API logic between pages and API routes.

Shared cached data providers are located in:

```txt
src/lib/data/crypto-global.ts
src/lib/data/weather-forecast.ts
src/lib/data/coin-market-chart.ts
src/lib/data/coin-ohlc-chart.ts
```

These modules are used by:

```txt
server-rendered pages
public API routes
```

Current flow:

```txt
Caller
  |
  v
readCached...()
  |
  v
Redis lookup
  |
  +-- HIT  -> return cached data
  |
  +-- MISS/SKIP -> fetch external provider -> normalize -> Redis write -> return data
```

This reduces:

```txt
duplicated fetch logic
inconsistent TTL behavior
inconsistent response normalization
unnecessary provider requests
```

---

## 9. Cache Strategy

Current public cache TTLs:

```txt
Crypto global data        60 seconds
Coin market chart data    300 seconds
Coin OHLC chart data      300 seconds
Weather forecast data     1800 seconds
```

Cache keys are stable and versioned.

Examples:

```txt
public-api:crypto:global:v1
public-api:weather:zurich:v1
public-api:crypto:market-chart:bitcoin:7:v1
public-api:crypto:ohlc:bitcoin:7:v1
```

The public API responses use:

```txt
Cache-Control: no-store
```

Reason:

```txt
Redis is the controlled cache layer.
Browser/CDN caching is not relied on for JSON API correctness.
```

---

## 10. Rate Limiting Strategy

Public API rate limiting is implemented with Upstash Redis.

Current public limits:

```txt
Crypto market data APIs   60 requests / minute / client identifier
General public APIs       120 requests / minute / client identifier
```

AI route limit:

```txt
5 requests / 10 minutes / client identifier
```

Client identifiers are derived from forwarded headers and hashed before use.

Purpose:

```txt
reduce abuse risk
protect upstream providers
avoid raw client identifier storage
preserve public API availability
control cost-sensitive execution paths
```

Rate-limit headers are returned when the rate-limit path is evaluated:

```txt
X-RateLimit-Limit
X-RateLimit-Remaining
X-RateLimit-Reset
X-RateLimit-Policy
X-RateLimit-Window
```

---

## 11. Public API Observability

A deliberate design decision was to make runtime API behavior externally inspectable without exposing secrets.

Public API observability headers:

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

Expected relevant headers:

```txt
X-API-Route: crypto-global
X-Data-Source: coingecko
X-Cache: HIT
X-Cache-TTL: 60
X-Cache-Scope: shared-data-service
Cache-Control: no-store
```

This helps verify:

```txt
which route handled the request
which upstream source is used
whether Redis served the response
which TTL applies
which cache scope owns the response
whether rate limiting was evaluated
```

---

## 12. Persistence Layer

Persistent storage is handled by:

```txt
Neon Postgres
Drizzle ORM
Drizzle Kit
```

Primary table:

```txt
market_insights
```

Purpose:

```txt
store market insight records
support the /insights route
provide a persistent archive
prepare storage for future AI-generated summaries
```

Representative files:

```txt
src/lib/db/schema.ts
src/lib/db/queries/market-insights.ts
src/lib/db/seed.ts
```

The current insights page displays:

```txt
title
summary
source
model
confidence
metadata
created date
```

---

## 13. Feature Flag Strategy

Feature flags are used for controlled rollout and cost-sensitive behavior.

Current flags:

```env
FEATURE_MARKET_INSIGHTS_ENABLED=true
FEATURE_AI_MARKET_SUMMARY_ENABLED=false
FEATURE_DEFAULT_CRYPTO_CHART_MODE=area
```

Implemented flag behavior:

```txt
market insights route can be enabled or disabled
AI market summary execution is protected by a kill switch
default crypto chart mode is configurable
invalid chart mode values fall back safely
```

The AI flag is especially important because it prevents:

```txt
accidental provider usage
uncontrolled model costs
unplanned public AI exposure
resource consumption before operational limits are finalized
```

---

## 14. AI-Ready Infrastructure

The AI route exists at:

```txt
POST /api/ai/market-summary
```

The intended AI flow is:

```txt
request
feature flag check
gateway key check
body validation
rate limit
AI cache lookup
CoinGecko context fetch
prompt construction
AI Gateway call
Postgres persistence
Redis cache write
JSON response
```

The prompt design enforces:

```txt
no financial advice
no hype
no buy/sell recommendation
concise market intelligence tone
data uncertainty notice
risk awareness
German and English output support
```

Current production status:

```txt
implemented
tested for disabled and invalid request behavior
disabled in production by feature flag
```

This is a deliberate operational decision, not an unfinished UI state.

---

## 15. Security Model

Implemented controls include:

```txt
server-side secrets only
no public exposure of API credentials
Content-Security-Policy
Strict-Transport-Security
X-Frame-Options
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
Cross-Origin-Opener-Policy
Cross-Origin-Resource-Policy
disabled framework powered-by header
Redis-backed rate limiting
hashed client identifiers
feature-flag kill switches
dependency audits
production smoke-test verification
```

Security documentation:

```txt
docs/security.md
```

The security model focuses on:

```txt
limiting browser capabilities
protecting server-side credentials
reducing abuse risk
controlling cost-sensitive execution
making runtime behavior verifiable
avoiding unnecessary public attack surface
```

---

## 16. Testing Strategy

The automated test suite covers:

```txt
feature flags
request client identification
Redis client initialization
cache utilities
rate-limit helper behavior
external API clients
cached data providers
public API validation safeguards
public API runtime behavior
market insights database queries
selected UI components
```

Representative test files:

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
```

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

---

## 17. Production Verification

The project includes a production smoke test:

```txt
scripts/smoke-test-production.mjs
```

Run:

```bash
pnpm smoke:prod
```

The smoke test verifies:

```txt
HTML routes
robots.txt
sitemap.xml
OpenGraph image
public API endpoints
status codes
content types
security headers
public API observability headers
absence of the X-Powered-By header
basic JSON response shapes
```

Current expected scope:

```txt
201 checks
0 expected failures
```

This complements unit and integration tests by checking the live deployment surface.

---

## 18. Important Trade-Offs

### Redis Cache Instead of Browser/CDN Cache for JSON APIs

Decision:

```txt
Use Redis as the controlled cache layer.
Return Cache-Control: no-store for public JSON APIs.
```

Reason:

```txt
Cache behavior remains explicit, server-controlled and externally observable through response headers.
```

Trade-off:

```txt
Potentially less CDN-level caching efficiency, but clearer correctness and better runtime transparency.
```

---

### Feature-Flagged AI Instead of Public AI UI

Decision:

```txt
Keep AI route implemented but disabled in production.
```

Reason:

```txt
AI execution depends on provider billing, model availability and cost controls.
```

Trade-off:

```txt
Less visible AI functionality today, but stronger operational safety.
```

---

### Shared Cached Data Providers Instead of Internal HTTP Calls

Decision:

```txt
Pages and public APIs use shared data service modules directly.
```

Reason:

```txt
Avoid unnecessary internal HTTP calls and duplicate external API logic.
```

Trade-off:

```txt
Requires clean module boundaries and careful testing of shared behavior.
```

---

### Managed Infrastructure Instead of Custom Servers

Decision:

```txt
Use Vercel, Neon and Upstash.
```

Reason:

```txt
Reduce operational overhead while keeping production-grade capabilities.
```

Trade-off:

```txt
Runtime behavior depends on managed provider limits and pricing models.
```

---

## 19. What Worked Well

The strongest outcomes are:

```txt
shared data provider architecture
standardized public API response headers
production smoke-test coverage
security header hardening
Redis-backed rate limiting
feature-flag protection for AI
clear separation between public UI, server APIs, cache, DB and external providers
incremental commits with verification after each step
```

The most useful design decision was making cache and route behavior externally visible through headers. This makes production debugging and automated smoke testing significantly simpler.

---

## 20. What Remains Intentionally Open

Near-term documentation and operations improvements:

```txt
OpenAPI specification
Operations runbook
Threat model
Architecture decision records
Changelog
Performance and accessibility audit documentation
```

Potential future product features, still intentionally deferred:

```txt
AI summary UI action
authentication
admin controls
scheduled reports
watchlists
user-specific settings
```

These should only be added if the system boundary and operational model justify the added complexity.

---

## 21. Lessons

The project reinforces several engineering lessons:

```txt
Public APIs benefit from observable runtime headers.
Cost-sensitive features should have kill switches before they have UI.
Shared cached providers reduce duplication and provider pressure.
Production smoke tests catch issues that local tests cannot fully represent.
Security headers are easier to maintain when centralized.
Documentation is more useful when it records trade-offs, not just features.
Managed infrastructure still requires explicit operational boundaries.
```

---

## 22. Current System Summary

Current system state:

```txt
Production dashboard deployed
Public APIs deployed
Redis cache and rate limiting active
Neon Postgres persistence active
Market insights archive active
AI route implemented but disabled
Security headers active
X-Powered-By disabled
Production smoke test active
Expanded test coverage active
Architecture and evidence documentation available
```

Primary references:

```txt
README.md
docs/architecture.md
docs/architecture-diagrams.md
docs/security.md
scripts/smoke-test-production.mjs
```

---

## 23. Conclusion

Swiss Market Dashboard demonstrates a production-oriented approach to building a public data system with Next.js, Redis, Postgres, public API routes, external data providers, security controls, feature flags and production verification.

The most important architectural characteristic is not any single technology choice. It is the combination of:

```txt
controlled server-side integrations
shared cached data services
observable API behavior
feature-flagged cost control
security hardening
automated tests
live smoke-test verification
explicit documentation of trade-offs
```

This keeps the system understandable, verifiable and ready for controlled future extension.
