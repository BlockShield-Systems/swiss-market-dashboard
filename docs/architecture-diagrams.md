# Architecture Diagrams

This document provides visual architecture diagrams for Swiss Market Dashboard.

The diagrams are intended to make the runtime structure, data flows, cache behavior, security boundaries and production verification process easier to review.

---

## 1. System Context

```mermaid
flowchart TD
  User["User Browser"] --> Vercel["Vercel Edge / CDN"]
  Vercel --> App["Next.js Application"]

  App --> Pages["App Router Pages"]
  App --> ApiRoutes["Route Handlers / Public APIs"]
  App --> OgImage["OpenGraph Image Route"]
  App --> SeoFiles["robots.txt / sitemap.xml"]

  Pages --> DataServices["Shared Cached Data Services"]
  ApiRoutes --> DataServices

  DataServices --> Redis["Upstash Redis"]
  DataServices --> CoinGecko["CoinGecko API"]
  DataServices --> OpenMeteo["Open-Meteo API"]

  ApiRoutes --> RateLimit["Redis-backed Rate Limiting"]
  RateLimit --> Redis

  ApiRoutes --> Postgres["Neon Postgres"]
  Postgres --> Drizzle["Drizzle ORM"]

  ApiRoutes --> AiGateway["Vercel AI Gateway"]
  AiGateway -. "disabled by feature flag in production" .-> FeatureFlags["Feature Flags"]

  App --> Analytics["Vercel Analytics / Speed Insights"]
```

Main idea:

```txt
The application is deployed on Vercel and uses server-side integrations for external APIs, Redis caching, Redis rate limiting and Postgres persistence.
```

---

## 2. Container Architecture

```mermaid
flowchart LR
  subgraph Client["Client Layer"]
    Browser["Browser"]
    UI["React UI Components"]
  end

  subgraph App["Next.js Application"]
    Pages["App Router Pages"]
    ServerComponents["Server Components"]
    ClientComponents["Client Components"]
    RouteHandlers["Route Handlers"]
    FeatureFlagLayer["Feature Flag Layer"]
  end

  subgraph Data["Data Access Layer"]
    CachedProviders["Shared Cached Data Providers"]
    CacheUtils["Cache Utilities"]
    ApiClients["External API Clients"]
    DbQueries["Database Query Helpers"]
  end

  subgraph Infra["Infrastructure"]
    Redis["Upstash Redis"]
    Neon["Neon Postgres"]
    CoinGecko["CoinGecko"]
    OpenMeteo["Open-Meteo"]
    AiGateway["Vercel AI Gateway"]
  end

  Browser --> UI
  UI --> Pages
  Pages --> ServerComponents
  Pages --> ClientComponents
  Pages --> CachedProviders

  RouteHandlers --> FeatureFlagLayer
  RouteHandlers --> CachedProviders
  RouteHandlers --> DbQueries

  CachedProviders --> CacheUtils
  CachedProviders --> ApiClients
  CacheUtils --> Redis
  ApiClients --> CoinGecko
  ApiClients --> OpenMeteo
  DbQueries --> Neon

  RouteHandlers --> AiGateway
```

Container responsibilities:

```txt
Pages                  Render dashboard routes
Route Handlers         Expose public API and AI-ready server endpoints
Cached Providers       Share external data access between pages and APIs
Cache Utilities         Read/write JSON data in Redis and create cache headers
API Clients             Isolate third-party API calls
Database Queries        Encapsulate Drizzle ORM access
Feature Flags           Control rollout and cost-sensitive behavior
```

---

## 3. Public API Request Flow

```mermaid
sequenceDiagram
  autonumber

  participant Client as Client
  participant Route as Next.js Route Handler
  participant Cache as Shared Cached Data Service
  participant Redis as Upstash Redis
  participant RateLimit as Rate Limit
  participant Provider as External Provider
  participant Response as JSON Response

  Client->>Route: GET public API route
  Route->>Cache: read cached data
  Cache->>Redis: get cache key

  alt Cache HIT
    Redis-->>Cache: cached JSON
    Cache-->>Route: data + HIT
    Route-->>Response: 200 JSON + X-Cache: HIT
    Response-->>Client: response
  else Cache MISS or SKIP
    Redis-->>Cache: no data or cache unavailable
    Cache-->>Route: null + MISS/SKIP

    Route->>RateLimit: check client identifier

    alt Rate limit exceeded
      RateLimit-->>Route: blocked
      Route-->>Response: 429 JSON + X-RateLimit-* + X-Cache
      Response-->>Client: response
    else Rate limit allowed
      RateLimit-->>Route: allowed
      Route->>Provider: fetch upstream data
      Provider-->>Route: upstream JSON
      Route->>Redis: write normalized response with TTL
      Route-->>Response: 200 JSON + X-Cache + X-RateLimit-*
      Response-->>Client: response
    end
  end
```

Important behavior:

```txt
Cache HIT responses avoid rate-limit checks for public shared data.
MISS and SKIP responses go through rate limiting before upstream fetching.
All public API responses expose route, source, cache and cache-scope headers.
Rate-limit headers are included when the rate-limit path is evaluated.
```

---

## 4. Shared Cached Data Provider Flow

```mermaid
flowchart TD
  Caller["Page or API Route"] --> ReadCache["readCached...()"]
  ReadCache --> CacheKey["Build stable cache key"]
  CacheKey --> RedisRead["Redis get"]

  RedisRead --> Decision{"Cached data exists?"}

  Decision -->|Yes| Hit["Return data with cacheStatus HIT"]
  Decision -->|No| Fetch["fetchAndCache...()"]

  Fetch --> ExternalApi["External API Client"]
  ExternalApi --> Normalize["Normalize response"]
  Normalize --> RedisWrite["Redis set with TTL"]
  RedisWrite --> ReturnMiss["Return data with cacheStatus MISS or SKIP"]

  Hit --> Caller
  ReturnMiss --> Caller
```

Current shared cached providers:

```txt
src/lib/data/crypto-global.ts
src/lib/data/weather-forecast.ts
src/lib/data/coin-market-chart.ts
src/lib/data/coin-ohlc-chart.ts
```

Current cache key pattern:

```txt
public-api:{domain}:{resource}:{identifier}:{window}:v1
```

Examples:

```txt
public-api:crypto:global:v1
public-api:weather:zurich:v1
public-api:crypto:market-chart:bitcoin:7:v1
public-api:crypto:ohlc:bitcoin:7:v1
```

---

## 5. Cache and Rate-Limit Header Flow

```mermaid
flowchart LR
  DataResult["CachedDataResult"] --> CacheHeaders["createCacheHeaders()"]
  RateLimitResult["RateLimitResult"] --> RateLimitHeaders["createRateLimitHeaders()"]

  CacheHeaders --> Merge["mergeHeaders()"]
  RateLimitHeaders --> Merge

  Merge --> Response["NextResponse.json()"]

  Response --> H1["X-API-Route"]
  Response --> H2["X-Data-Source"]
  Response --> H3["X-Cache"]
  Response --> H4["X-Cache-TTL"]
  Response --> H5["X-Cache-Scope"]
  Response --> H6["Cache-Control"]
  Response --> H7["X-RateLimit-*"]
```

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

Design goal:

```txt
Runtime behavior should be externally verifiable without exposing secrets, raw client identifiers or internal credentials.
```

---

## 6. AI-Ready Route Protection Flow

```mermaid
flowchart TD
  Request["POST /api/ai/market-summary"] --> FeatureFlag{"AI feature enabled?"}

  FeatureFlag -->|No| Disabled["403 Feature disabled"]
  FeatureFlag -->|Yes| GatewayKey{"AI gateway key configured?"}

  GatewayKey -->|No| Misconfigured["503 AI gateway unavailable"]
  GatewayKey -->|Yes| Validate["Validate request body with Zod"]

  Validate -->|Invalid| BadRequest["400 Invalid request"]
  Validate -->|Valid| RateLimit["Redis rate limit"]

  RateLimit -->|Blocked| TooMany["429 Too many requests"]
  RateLimit -->|Allowed| CacheLookup["Redis AI response cache lookup"]

  CacheLookup -->|HIT| CachedResponse["Return cached AI summary"]
  CacheLookup -->|MISS| CoinContext["Fetch CoinGecko context"]

  CoinContext --> Prompt["Build constrained prompt"]
  Prompt --> AiGateway["Call Vercel AI Gateway"]
  AiGateway --> Persist["Persist generated summary in Neon Postgres"]
  Persist --> CacheWrite["Write AI response cache"]
  CacheWrite --> Response["Return generated summary"]
```

Current production state:

```env
FEATURE_AI_MARKET_SUMMARY_ENABLED=false
```

Reason:

```txt
AI execution is cost-sensitive and remains behind a server-side kill switch until provider billing, usage limits and operational controls are deliberately configured.
```

---

## 7. Database Flow for Market Insights

```mermaid
flowchart TD
  InsightsPage["/insights page"] --> FeatureFlag{"market-insights-enabled?"}

  FeatureFlag -->|No| NotFound["404 via notFound()"]
  FeatureFlag -->|Yes| Query["getLatestMarketInsights()"]

  Query --> Drizzle["Drizzle ORM"]
  Drizzle --> Neon["Neon Postgres"]
  Neon --> Table["market_insights table"]

  Table --> Records["Insight records"]
  Records --> Render["Render insight cards"]
```

Primary table purpose:

```txt
Persistent market insight archive
Manual seeded records
Prepared storage path for future AI-generated summaries
```

---

## 8. Production Verification Flow

```mermaid
flowchart TD
  Change["Code or documentation change"] --> LocalChecks["Local quality gate"]

  LocalChecks --> TypeCheck["pnpm type-check"]
  LocalChecks --> Lint["pnpm lint"]
  LocalChecks --> Tests["pnpm test:ci"]
  LocalChecks --> Build["pnpm build"]
  LocalChecks --> Audit["pnpm audit / pnpm audit --prod"]

  TypeCheck --> Commit["Commit and push"]
  Lint --> Commit
  Tests --> Commit
  Build --> Commit
  Audit --> Commit

  Commit --> Deploy["Vercel production deployment"]
  Deploy --> Smoke["pnpm smoke:prod"]

  Smoke --> Routes["HTML routes"]
  Smoke --> Seo["robots.txt / sitemap.xml"]
  Smoke --> Og["OpenGraph image"]
  Smoke --> Api["Public API endpoints"]
  Smoke --> Headers["Security and API headers"]
  Smoke --> Json["Basic JSON shapes"]

  Routes --> Result["Production verification result"]
  Seo --> Result
  Og --> Result
  Api --> Result
  Headers --> Result
  Json --> Result
```

Current production smoke-test scope:

```txt
201 checks
0 expected failures
```

Smoke test script:

```txt
scripts/smoke-test-production.mjs
```

---

## 9. Security Boundary Overview

```mermaid
flowchart TD
  Browser["Browser"] --> PublicRoutes["Public pages and public APIs"]

  PublicRoutes --> ServerOnly["Server-side execution boundary"]

  ServerOnly --> Env["Environment variables"]
  ServerOnly --> Redis["Upstash Redis"]
  ServerOnly --> Db["Neon Postgres"]
  ServerOnly --> Providers["External APIs"]

  Env --> Secrets["Secrets remain server-side"]

  PublicRoutes --> Headers["Security headers"]
  PublicRoutes --> RateLimit["Rate limiting"]
  PublicRoutes --> FeatureFlags["Feature flags"]

  RateLimit --> HashedClient["Hashed client identifiers"]
  FeatureFlags --> KillSwitch["Cost-sensitive kill switches"]
  Headers --> BrowserPolicy["Browser-enforced security policy"]
```

Protected concerns:

```txt
API keys
Database URLs
Redis credentials
AI gateway credentials
Raw client identifiers
Cost-sensitive AI execution
```

Production controls:

```txt
CSP
HSTS
X-Frame-Options
X-Content-Type-Options
Permissions-Policy
Rate limiting
Feature flags
No X-Powered-By header
Production smoke test verification
```

---

## 10. Documentation Relationship

```mermaid
flowchart LR
  Readme["README.md"] --> Architecture["docs/architecture.md"]
  Readme --> Security["docs/security.md"]
  Readme --> Evidence["docs/project-evidence.md"]
  Readme --> Feedback["docs/feedback.md"]

  Architecture --> Diagrams["docs/architecture-diagrams.md"]
  Security --> ThreatModel["Future: docs/threat-model.md"]
  Evidence --> Smoke["scripts/smoke-test-production.mjs"]
  Feedback --> IssueTemplate[".github/ISSUE_TEMPLATE/technical-feedback.yml"]

  Diagrams --> CaseStudy["docs/case-study.md"]
  Architecture --> OpenApi["docs/openapi.yaml"]
  Evidence --> Operations["docs/operations.md"]
```

Documentation intent:

```txt
README.md provides the entry point.
docs/architecture.md explains the system structure.
docs/architecture-diagrams.md visualizes the runtime model.
docs/security.md documents security controls.
docs/project-evidence.md records objective verification points.
docs/feedback.md defines useful public technical feedback.
```