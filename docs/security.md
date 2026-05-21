# Security Posture

This document describes the current security and cost-control posture of the Swiss Market Dashboard.

The project is built as a production-oriented intelligence platform. Security decisions are intentionally documented because the application integrates external APIs, database credentials, Redis credentials, feature-controlled modules, caching infrastructure, rate limiting, and AI-ready functionality.

---

## Secret Management

Secrets are stored in environment variables.

Local secrets are stored in:

```txt
.env.local
```

This file must never be committed.

Expected local secret handling:

```txt
.env.local ignored by Git
.env.local.backup ignored by Git
no API keys in source code
no database URLs in source code
```

Sensitive variables:

```env
COINGECKO_API_KEY=...
DATABASE_URL=...
DATABASE_URL_UNPOOLED=...
AI_GATEWAY_API_KEY=...
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

Vercel stores production and preview secrets in Project Environment Variables.

---

## Database Security

Database provider:

```txt
Neon Postgres
```

Runtime database URL:

```env
DATABASE_URL
```

Migration database URL:

```env
DATABASE_URL_UNPOOLED
```

Design decisions:

- database credentials are server-side only
- Drizzle ORM is used for structured database access
- migrations are generated and committed
- public users do not receive direct database access
- `/insights` is read-only in the current UI
- no public write endpoint exists for manual insight creation

---

## Redis Security

Redis provider:

```txt
Upstash Redis
```

Used for:

- shared cached data services
- public API response caching
- public API rate limiting
- AI route rate limiting
- AI response caching
- short-lived operational counters
- abuse-prevention infrastructure

Environment variables:

```env
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

Security decisions:

- Redis credentials are server-side only
- Redis token is treated as sensitive
- client identifiers are hashed before being used as rate-limit keys
- Redis keys use TTLs to avoid uncontrolled growth
- Redis eviction is disabled to avoid losing rate-limit integrity unexpectedly
- public API cache entries are short-lived and do not contain secrets
- AI response cache entries are protected behind the AI feature flag and rate limit
- public API observability headers expose cache and rate-limit state without exposing secrets
- raw client IPs are not returned in public API responses

---

## AI Cost Control

AI route:

```txt
POST /api/ai/market-summary
```

Current production status:

```env
FEATURE_AI_MARKET_SUMMARY_ENABLED=false
```

Reason:

AI model calls consume credits and must not be exposed without strict control.

Implemented protections:

```txt
Feature flag kill switch
Zod request validation
Redis rate limiting
Redis response caching
No client-side API key exposure
Server-side only AI Gateway calls
No public UI trigger yet
```

Current rate limit:

```txt
5 requests / 10 minutes / client identifier
```

Current cache TTL:

```txt
30 minutes
```

AI Gateway execution is intentionally disabled in production until billing verification and usage policy are deliberately approved.

---

## Feature Flags

Feature flags are used as operational controls.

Current flags:

```txt
market-insights-enabled
ai-market-summary-enabled
default-crypto-chart-mode
```

The AI feature flag is especially important because it prevents accidental model usage and credit consumption.

Production default:

```env
FEATURE_AI_MARKET_SUMMARY_ENABLED=false
```

---

## API Security

API routes are server-side and keep external credentials hidden.

Current API routes:

```txt
/api/crypto/global
/api/crypto/[id]/market-chart
/api/crypto/[id]/ohlc
/api/weather
/api/ai/market-summary
```

Current protections:

- third-party API keys are not exposed to the browser
- public API responses use Redis-backed caching to reduce third-party API pressure
- public API routes use Redis-backed rate limiting for cache misses and abuse reduction
- request validation is used for the AI route
- AI route is protected by a feature flag
- AI route is protected by Redis rate limiting
- AI route uses Redis response caching to reduce repeated model calls
- AI route has no public UI trigger yet

Public API response headers are standardized for operational visibility.

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

Security posture of these headers:

- route identity is exposed only as a logical label
- data source is exposed only as a provider label
- cache status exposes HIT, MISS or SKIP only
- cache TTL exposes duration in seconds only
- rate-limit headers expose quota state only
- raw IP addresses are never returned
- Redis keys are never returned
- Redis credentials are never returned
- external API keys are never returned
- server-side stack traces are not returned in public API responses

Current public API cache strategy:

```txt
Cache-Control: no-store
```

Reason:

Browser and CDN caching are intentionally not the primary cache layer for these JSON endpoints. Redis is the controlled cache layer because it allows explicit TTLs, shared server-side cache behavior and rate-limit coordination.

Current public API route policies:

```txt
/api/crypto/global              market-data-api
/api/crypto/[id]/market-chart   market-data-api
/api/crypto/[id]/ohlc           market-data-api
/api/weather                    public-api
```

Current public API data sources:

```txt
/api/crypto/global              coingecko
/api/crypto/[id]/market-chart   coingecko
/api/crypto/[id]/ohlc           coingecko
/api/weather                    open-meteo
```

---

## HTTP Security Headers

The application sets production security headers through `next.config.ts`.

Current global response headers:

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

Current Content Security Policy posture:

```txt
default-src 'self'
base-uri 'self'
form-action 'self'
frame-ancestors 'none'
object-src 'none'
script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com
style-src 'self' 'unsafe-inline'
img-src 'self' data: blob: https://coin-images.coingecko.com
font-src 'self' data:
connect-src 'self' https://vitals.vercel-insights.com https://*.vercel-insights.com
worker-src 'self' blob:
manifest-src 'self'
media-src 'self'
upgrade-insecure-requests
```

Development builds additionally allow:

```txt
script-src 'unsafe-eval'
```

Reason:

Next.js development tooling can require eval-like behavior during local development. Production does not include this directive.

Security decisions:

- framing is blocked through `frame-ancestors 'none'` and `X-Frame-Options: DENY`
- MIME sniffing is blocked through `X-Content-Type-Options: nosniff`
- browser referrer leakage is reduced through `strict-origin-when-cross-origin`
- browser capabilities such as camera, microphone, geolocation, payment and USB are disabled
- HTTPS is enforced through HSTS in production-capable deployments
- Vercel Analytics and Speed Insights endpoints are explicitly allowed
- CoinGecko image delivery is explicitly allowed for crypto asset images
- inline scripts and styles are currently allowed for framework compatibility

Future CSP hardening can replace `'unsafe-inline'` with a nonce-based policy. That should be implemented as a separate focused change because an incomplete nonce migration can break Next.js runtime behavior, analytics scripts or styling.
---

## Dependency Security

Dependency advisories are monitored through GitHub Dependabot and pnpm audit.

Recent resolved advisories:

```txt
postcss: XSS via unescaped </style> in CSS stringify output
esbuild: development server CORS exposure
```

Resolution strategy:

```txt
pnpm overrides
pnpm-workspace.yaml
lockfile update
audit verification
```

Current expected audit result:

```txt
pnpm audit
No known vulnerabilities found

pnpm audit --prod
No known vulnerabilities found
```

---

## pnpm Supply-Chain Configuration

The project uses `pnpm-workspace.yaml` for pnpm-compatible configuration.

Current responsibilities:

- package overrides for security advisories
- approved build scripts for trusted native/tooling packages
- workspace-level pnpm configuration

Approved build scripts are intentionally limited to known packages required by the toolchain.

---

## Build and Quality Gates

Before production commits, the following commands should pass:

```bash
pnpm type-check
pnpm lint
pnpm test:ci
pnpm build
```

Security checks:

```bash
pnpm audit
pnpm audit --prod
```

These checks ensure:

- TypeScript correctness
- linting consistency
- test suite stability
- production build success
- dependency advisory status

---

## Known External Constraint

Vercel AI Gateway currently requires billing verification before model requests can be processed.

Observed behavior:

```txt
AI Gateway requires a valid credit card on file to service requests.
```

Current response:

```txt
AI execution remains disabled through FEATURE_AI_MARKET_SUMMARY_ENABLED=false
```

This is not treated as a code defect. It is an external account-level requirement and a cost-control decision.

---

## Security Principles

The current project posture follows these principles:

- never expose secrets to the client
- keep AI disabled until rate limiting and cost controls exist
- use feature flags for operational safety
- store persistent data in a managed SQL database
- avoid public write endpoints unless needed
- rate-limit expensive or abuse-prone functionality
- cache expensive or frequently requested responses
- protect third-party APIs with short-lived Redis caches and rate limits
- expose safe operational metadata through standardized response headers
- never expose raw client identifiers, Redis keys or upstream credentials
- resolve dependency advisories promptly
- document production architecture clearly

---

## Future Security Improvements

Potential future improvements:

- authenticated admin-only AI generation
- user authentication for saved watchlists
- per-user rate limits
- stricter API abuse detection
- Vercel Firewall rules
- bot protection tuning
- structured runtime logging
- Sentry or equivalent error reporting
- CSP nonce-based hardening without 'unsafe-inline'
- automated security header regression checks
- automated dependency update workflow

