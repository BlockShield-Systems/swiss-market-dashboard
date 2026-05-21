# Architecture Diagrams

This document contains visual architecture and runtime diagrams for the Swiss Market Dashboard.

The diagrams focus on system structure, request flow, shared cached data providers, public API behavior, security boundaries, and operational verification.

---

## System Context

```mermaid
flowchart LR
  User["Browser / Public Client"]
  Vercel["Vercel Edge / CDN"]
  App["Next.js App Router"]
  Redis["Upstash Redis"]
  Postgres["Neon Postgres"]
  CoinGecko["CoinGecko API"]
  OpenMeteo["Open-Meteo API"]
  AIGateway["Vercel AI Gateway"]

  User --> Vercel
  Vercel --> App
  App --> Redis
  App --> Postgres
  App --> CoinGecko
  App --> OpenMeteo
  App --> AIGateway
```

The application exposes public dashboard pages and selected public API routes. External provider access and secret handling remain server-side.

---

## Container Overview

```mermaid
flowchart TB
  subgraph Client["Client"]
    Browser["Browser"]
  end

  subgraph Hosting["Vercel"]
    CDN["Edge / CDN"]
    NextApp["Next.js Application"]
    Pages["App Router Pages"]
    Routes["Route Handlers"]
    Components["Server + Client Components"]
  end

  subgraph DataLayer["Application Data Layer"]
    CachedProviders["Shared Cached Data Providers"]
    ApiClients["External API Clients"]
    DbAccess["Drizzle ORM Access"]
    FeatureFlags["Feature Flags"]
  end

  subgraph ManagedServices["Managed Services"]
    Redis["Upstash Redis<br/>Cache + Rate Limits"]
    Neon["Neon Postgres"]
    AI["Vercel AI Gateway"]
  end

  subgraph ExternalProviders["External Data Providers"]
    CG["CoinGecko"]
    OM["Open-Meteo"]
  end

  Browser --> CDN
  CDN --> NextApp
  NextApp --> Pages
  NextApp --> Routes
  NextApp --> Components

  Pages --> CachedProviders
  Routes --> CachedProviders
  Routes --> FeatureFlags
  Routes --> DbAccess

  CachedProviders --> Redis
  CachedProviders --> ApiClients
  ApiClients --> CG
  ApiClients --> OM
  DbAccess --> Neon
  Routes --> AI
```

Main responsibilities:

```txt
Pages                  render dashboard views
Route handlers         expose public JSON APIs and AI-ready server route
Cached providers       centralize Redis-backed market and weather data access
Redis                  stores cache entries and rate-limit state
Neon Postgres          stores persistent market insights
Feature flags          control optional and cost-sensitive behavior
External API clients   isolate provider-specific request and response handling
```

---

## Public Page Request Flow

```mermaid
sequenceDiagram
  participant Client as Browser
  participant Vercel as Vercel Edge/CDN
  participant App as Next.js Page
  participant Provider as Shared Cached Data Provider
  participant Redis as Upstash Redis
  participant External as External API

  Client->>Vercel: GET page
  Vercel->>App: Render route
  App->>Provider: Request page data
  Provider->>Redis: Read cached data

  alt Cache HIT
    Redis-->>Provider: Cached payload
  else Cache MISS
    Provider->>External: Fetch provider data
    External-->>Provider: Provider response
    Provider->>Redis: Store normalized payload with TTL
  end

  Provider-->>App: Normalized data
  App-->>Vercel: HTML response
  Vercel-->>Client: Page + security headers
```

Pages and route handlers share the same cached data provider modules where applicable.

---

## Public API Request Flow

```mermaid
sequenceDiagram
  participant Client as Public Client
  participant Route as Next.js Route Handler
  participant Cache as Redis Cache
  participant RateLimit as Redis Rate Limit
  participant Provider as External Provider

  Client->>Route: GET /api/...
  Route->>Route: Validate parameters
  Route->>Cache: Read cached data

  alt Cache HIT
    Cache-->>Route: Cached payload
    Route-->>Client: 200 + cache headers
  else Cache MISS
    Route->>RateLimit: Check client limit

    alt Rate limit exceeded
      RateLimit-->>Route: Block
      Route-->>Client: 429 + rate-limit headers
    else Allowed
      Route->>Provider: Fetch upstream data
      Provider-->>Route: Provider response
      Route->>Cache: Store normalized payload
      Route-->>Client: 200 + cache and rate-limit headers
    end
  end
```

Public API routes are designed to prefer cache reuse before performing external provider calls.

---

## Shared Cached Data Provider Flow

```mermaid
flowchart TB
  Pages["Server-rendered pages"]
  Routes["Public API routes"]

  subgraph SharedLayer["Shared Cached Data Providers"]
    Global["crypto-global.ts"]
    Weather["weather-forecast.ts"]
    MarketChart["coin-market-chart.ts"]
    Ohlc["coin-ohlc-chart.ts"]
  end

  Redis["Upstash Redis"]
  CoinGecko["CoinGecko API"]
  OpenMeteo["Open-Meteo API"]

  Pages --> Global
  Pages --> Weather
  Pages --> MarketChart
  Pages --> Ohlc

  Routes --> Global
  Routes --> Weather
  Routes --> MarketChart
  Routes --> Ohlc

  Global --> Redis
  Weather --> Redis
  MarketChart --> Redis
  Ohlc --> Redis

  Global --> CoinGecko
  MarketChart --> CoinGecko
  Ohlc --> CoinGecko
  Weather --> OpenMeteo
```

Current shared cached provider files:

```txt
src/lib/data/crypto-global.ts
src/lib/data/weather-forecast.ts
src/lib/data/coin-market-chart.ts
src/lib/data/coin-ohlc-chart.ts
```

Current cache TTLs:

```txt
Crypto global data        60 seconds
Coin market chart data    300 seconds
Coin OHLC chart data      300 seconds
Weather forecast data     1800 seconds
```

---

## Public API Observability Headers

```mermaid
flowchart LR
  Route["Public API Route"]
  Cache["Cache State"]
  RateLimit["Rate Limit State"]
  Response["HTTP Response"]

  Route --> Cache
  Route --> RateLimit
  Cache --> Response
  RateLimit --> Response

  Response --> ApiRoute["X-API-Route"]
  Response --> DataSource["X-Data-Source"]
  Response --> CacheHeader["X-Cache"]
  Response --> CacheTtl["X-Cache-TTL"]
  Response --> CacheScope["X-Cache-Scope"]
  Response --> Limit["X-RateLimit-Limit"]
  Response --> Remaining["X-RateLimit-Remaining"]
  Response --> Reset["X-RateLimit-Reset"]
  Response --> Policy["X-RateLimit-Policy"]
  Response --> Window["X-RateLimit-Window"]
  Response --> CacheControl["Cache-Control"]
```

Public API headers are used for operational visibility and integration clarity.

They do not expose:

```txt
provider credentials
Redis credentials
database credentials
raw Redis keys
raw client identifiers
private infrastructure details
```

---

## Rate-Limit Flow

```mermaid
flowchart TB
  Request["Incoming API Request"]
  CacheRead["Read Redis Cache"]
  CacheDecision{"Cache HIT?"}
  ReturnCached["Return cached response"]
  IdentifyClient["Derive client identifier"]
  HashClient["Hash client identifier"]
  CheckLimit["Check Redis rate limit"]
  LimitDecision{"Allowed?"}
  Return429["Return 429"]
  FetchProvider["Fetch external provider"]
  StoreCache["Store response in Redis"]
  ReturnFresh["Return fresh response"]

  Request --> CacheRead
  CacheRead --> CacheDecision
  CacheDecision -- Yes --> ReturnCached
  CacheDecision -- No --> IdentifyClient
  IdentifyClient --> HashClient
  HashClient --> CheckLimit
  CheckLimit --> LimitDecision
  LimitDecision -- No --> Return429
  LimitDecision -- Yes --> FetchProvider
  FetchProvider --> StoreCache
  StoreCache --> ReturnFresh
```

Rate limiting is applied on cache-miss paths where external provider pressure or abuse risk is relevant.

---

## AI-Ready Route Protection Flow

```mermaid
flowchart TB
  Request["POST /api/ai/market-summary"]
  FeatureFlag["Check FEATURE_AI_MARKET_SUMMARY_ENABLED"]
  Enabled{"Enabled?"}
  Disabled["Return controlled unavailable response"]
  Validate["Validate request body"]
  RateLimit["Check AI rate limit"]
  CacheRead["Read AI response cache"]
  CacheHit{"Cache HIT?"}
  ReturnCached["Return cached summary"]
  FetchMarket["Fetch market context"]
  AIGateway["Call Vercel AI Gateway"]
  Persist["Persist insight where applicable"]
  CacheWrite["Write AI response cache"]
  ReturnFresh["Return generated summary"]

  Request --> FeatureFlag
  FeatureFlag --> Enabled
  Enabled -- No --> Disabled
  Enabled -- Yes --> Validate
  Validate --> RateLimit
  RateLimit --> CacheRead
  CacheRead --> CacheHit
  CacheHit -- Yes --> ReturnCached
  CacheHit -- No --> FetchMarket
  FetchMarket --> AIGateway
  AIGateway --> Persist
  Persist --> CacheWrite
  CacheWrite --> ReturnFresh
```

Current production state:

```env
FEATURE_AI_MARKET_SUMMARY_ENABLED=false
```

The AI path exists but is disabled in production by default to keep model execution, billing, and output behavior under explicit operational control.

---

## Market Insights Data Flow

```mermaid
flowchart LR
  InsightsPage["/insights page"]
  FeatureFlag["market-insights-enabled"]
  Query["getLatestMarketInsights()"]
  Drizzle["Drizzle ORM"]
  Neon["Neon Postgres"]
  Table["market_insights"]

  InsightsPage --> FeatureFlag
  FeatureFlag --> Query
  Query --> Drizzle
  Drizzle --> Neon
  Neon --> Table
```

The `/insights` route reads persisted insight records through server-side data access.

---

## Security Boundary Overview

```mermaid
flowchart TB
  subgraph Public["Public / Untrusted"]
    Browser["Browser"]
    APIClient["Public API Client"]
  end

  subgraph AppBoundary["Application Boundary"]
    NextApp["Next.js Application"]
    RouteHandlers["Route Handlers"]
    Validation["Validation"]
    Headers["Security Headers"]
    FeatureFlags["Feature Flags"]
  end

  subgraph ServerOnly["Server-Side Only"]
    Env["Environment Variables"]
    RedisClient["Redis Client"]
    DbClient["Database Client"]
    ProviderClients["External Provider Clients"]
  end

  subgraph Managed["Managed Services"]
    Redis["Upstash Redis"]
    Neon["Neon Postgres"]
    Providers["CoinGecko / Open-Meteo / AI Gateway"]
  end

  Browser --> NextApp
  APIClient --> RouteHandlers
  NextApp --> Headers
  RouteHandlers --> Validation
  RouteHandlers --> FeatureFlags
  RouteHandlers --> RedisClient
  RouteHandlers --> DbClient
  RouteHandlers --> ProviderClients

  Env --> RedisClient
  Env --> DbClient
  Env --> ProviderClients

  RedisClient --> Redis
  DbClient --> Neon
  ProviderClients --> Providers
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

## Production Verification Flow

```mermaid
flowchart TB
  Change["Code or documentation change"]
  LocalChecks["Local quality gate"]
  Build["Production build"]
  Deploy["Production deployment"]
  Smoke["Production smoke test"]
  Result{"All checks pass?"}
  Commit["Commit and push"]
  Investigate["Investigate and fix"]

  Change --> LocalChecks
  LocalChecks --> Build
  Build --> Deploy
  Deploy --> Smoke
  Smoke --> Result
  Result -- Yes --> Commit
  Result -- No --> Investigate
  Investigate --> LocalChecks
```

Recommended local and production verification:

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

## Documentation Relationships

```mermaid
flowchart LR
  Readme["README.md"]
  SecurityPolicy["SECURITY.md"]
  Architecture["docs/architecture.md"]
  Diagrams["docs/architecture-diagrams.md"]
  Decisions["docs/decisions/"]
  CaseStudy["docs/case-study.md"]
  OpenApi["docs/openapi.yaml"]
  Operations["docs/operations.md"]
  Security["docs/security.md"]
  ThreatModel["docs/threat-model.md"]
  Changelog["CHANGELOG.md"]
  Smoke["scripts/smoke-test-production.mjs"]

  Readme --> SecurityPolicy
  Readme --> Architecture
  Readme --> Diagrams
  Readme --> Decisions
  Readme --> CaseStudy
  Readme --> OpenApi
  Readme --> Operations
  Readme --> Security
  Readme --> ThreatModel
  Readme --> Smoke
  Readme --> Changelog

  Architecture --> Diagrams
  Architecture --> Decisions
  Architecture --> OpenApi
  SecurityPolicy --> Security
  SecurityPolicy --> ThreatModel
  Security --> ThreatModel
  Operations --> Smoke
```

Current documentation map:

```txt
README.md                         Project overview and operational entry point
SECURITY.md                       Security policy and vulnerability reporting
docs/architecture.md              System architecture and runtime flows
docs/architecture-diagrams.md     Visual architecture and runtime diagrams
docs/decisions/                     Architecture decision records
docs/case-study.md                Engineering case study and trade-off analysis
docs/openapi.yaml                 Public API contract for market and weather endpoints
docs/operations.md                Operations runbook and production verification procedures
docs/security.md                  Technical security controls and production headers
docs/threat-model.md              Public threat model and risk overview
CHANGELOG.md                      Project change history
scripts/smoke-test-production.mjs Production smoke-test runner
```

Recommended future additions:

```txt
```

---

## Notes

The diagrams intentionally show only public and operationally relevant structure.

They do not include:

```txt
real secrets
provider tokens
database credentials
Redis credentials
private infrastructure details
```

For detailed API response schemas, use:

```txt
docs/openapi.yaml
```

For technical security controls, use:

```txt
docs/security.md
```

For security reporting, use:

```txt
SECURITY.md
```

For the public threat model, use:

```txt
docs/threat-model.md
```
