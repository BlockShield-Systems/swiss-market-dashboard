# Changelog

All notable project changes are documented in this file.

The project currently uses dated changelog entries instead of published release tags. This keeps the history readable while the application is evolving through focused technical commits.

The structure is inspired by Keep a Changelog:

```txt
Added
Changed
Removed
Security
Documentation
```

Reference:

```txt
https://keepachangelog.com/en/1.1.0/
```

---

## Unreleased

Planned or under consideration:

```txt
Architecture decision records
Optional CI quality gate documentation
Optional accessibility audit documentation
Optional CODE_OF_CONDUCT.md if the public contribution flow expands
```

---

## 2026-05-21

### Added

Added a root-level security policy:

```txt
SECURITY.md
```

The policy documents:

```txt
security reporting process
responsible disclosure expectations
supported project scope
testing boundaries
secret handling expectations
public API scope
verification commands
```

Added a public threat model:

```txt
docs/threat-model.md
```

The threat model documents:

```txt
system scope
trust boundaries
protected assets
main risks
current mitigations
residual risks
review triggers
verification baseline
```

Added a public API contract:

```txt
docs/openapi.yaml
```

The OpenAPI contract covers:

```txt
GET /api/crypto/global
GET /api/weather?key=zurich
GET /api/crypto/{id}/market-chart?days=7
GET /api/crypto/{id}/ohlc?days=7
```

Added operations documentation:

```txt
docs/operations.md
```

The operations runbook covers:

```txt
local verification
production verification
environment variables
smoke-test usage
rollback considerations
runtime expectations
failure handling
```

Added architecture diagrams:

```txt
docs/architecture-diagrams.md
```

The diagrams cover:

```txt
system context
container overview
public page request flow
public API request flow
shared cached data provider flow
rate-limit flow
AI-ready route protection flow
security boundaries
production verification
documentation relationships
```

Added an engineering case study:

```txt
docs/case-study.md
```

The case study documents:

```txt
project context
goals
constraints
architecture decisions
testing strategy
security posture
operational trade-offs
```

Added automated test coverage for:

```txt
Redis client initialization
external API clients
cached data providers
public API validation
public API runtime behavior
security headers
production smoke-test expectations
```

Added runtime tests for public API routes covering:

```txt
cache HIT behavior
cache MISS behavior
rate-limit responses
upstream failure responses
public API observability headers
```

Added external API client tests for:

```txt
CoinGecko API integration
Open-Meteo API integration
response normalization
error handling
request parameters
provider headers
```

Added cached data provider tests for:

```txt
crypto global data
coin market chart data
coin OHLC chart data
weather forecast data
Redis cache reads
Redis cache writes
cache miss behavior
cache hit behavior
TTL behavior
```

---

### Changed

Updated the README as the primary project entry point.

The README now summarizes:

```txt
production URL
system overview
public pages
public API routes
cache and rate-limit behavior
security posture
environment variables
quality gate
production smoke-test baseline
documentation map
```

Updated the public documentation map to clearly separate:

```txt
project overview
security policy
runtime architecture
visual architecture diagrams
engineering case study
public API contract
operations runbook
technical security controls
threat model
change history
```

Updated architecture documentation to focus on:

```txt
runtime layers
route handlers
shared cached data providers
Redis layer
database layer
feature flags
AI-ready route
deployment architecture
verification
change impact rules
```

Updated security documentation to focus on implemented technical controls:

```txt
secret management
public API protection
Redis cache
rate limiting
security headers
Content Security Policy
feature flags
AI route controls
database security
dependency checks
production verification
```

Updated architecture diagrams to include the current documentation structure, including:

```txt
SECURITY.md
docs/threat-model.md
CHANGELOG.md
```

Updated environment setup documentation with placeholder-based example values.

Example configuration now uses non-secret placeholders:

```env
COINGECKO_API_KEY=your_coingecko_api_key_here
DATABASE_URL=your_neon_database_url_here
DATABASE_URL_UNPOOLED=your_neon_unpooled_database_url_here
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url_here
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token_here
AI_GATEWAY_API_KEY=your_ai_gateway_api_key_here
```

---

### Removed

Removed unused starter assets from the public directory:

```txt
public/file.svg
public/globe.svg
public/window.svg
public/next.svg
public/vercel.svg
```

Aligned the documentation set around the currently maintained public documents.

Current maintained documentation set:

```txt
README.md
SECURITY.md
docs/architecture.md
docs/architecture-diagrams.md
docs/case-study.md
docs/openapi.yaml
docs/operations.md
docs/security.md
docs/threat-model.md
CHANGELOG.md
```

---

### Security

Documented the project security policy and vulnerability reporting process.

Security documentation now includes:

```txt
SECURITY.md
docs/security.md
docs/threat-model.md
docs/operations.md
docs/openapi.yaml
```

Current documented security controls include:

```txt
server-side secret handling
placeholder-based environment examples
security headers
Content-Security-Policy
disabled x-powered-by header
Redis-backed rate limiting
Redis-backed shared caching
feature-flagged AI route
production smoke-test verification
dependency audit commands
```

Production smoke-test baseline:

```txt
201 checks passed
0 checks failed
```

The production smoke test verifies:

```txt
public pages
public API endpoints
security headers
public API observability headers
absence of x-powered-by
basic response shapes
```

---

### Documentation

Current documentation map:

```txt
README.md                         Project overview and operational entry point
SECURITY.md                       Security policy and vulnerability reporting
docs/architecture.md              System architecture and runtime flows
docs/architecture-diagrams.md     Visual architecture and runtime diagrams
docs/case-study.md                Engineering case study and trade-off analysis
docs/openapi.yaml                 Public API contract for market and weather endpoints
docs/operations.md                Operations runbook and production verification procedures
docs/security.md                  Technical security controls and production headers
docs/threat-model.md              Public threat model and risk overview
CHANGELOG.md                      Project change history
scripts/smoke-test-production.mjs Production smoke-test runner
```

---

## Current Verification Baseline

Recommended local checks:

```bash
pnpm type-check
pnpm lint
pnpm test:ci
pnpm build
```

Recommended security and dependency checks:

```bash
pnpm audit
pnpm audit --prod
```

Recommended production verification:

```bash
pnpm smoke:prod
```

Expected production smoke-test result:

```txt
201 checks passed
0 checks failed
```

---

## Notes

The AI market summary route is implemented but disabled in production by default.

Current production setting:

```env
FEATURE_AI_MARKET_SUMMARY_ENABLED=false
```

Reason:

```txt
AI execution is cost-sensitive and remains behind explicit operational controls.
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

This is expected for the dynamic OpenGraph image route and does not indicate a failure of normal dashboard pages.
