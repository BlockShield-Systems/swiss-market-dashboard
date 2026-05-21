# 0003. Use Shared Cached Data Providers

Status:

```txt
Accepted
```

Documented on:

```txt
2026-05-22
```

---

## Context

The application needs market and weather data in multiple places:

```txt
server-rendered dashboard pages
public API route handlers
crypto detail pages
weather pages
runtime tests
production smoke-test expectations
```

Without a shared data layer, the project would risk duplicating provider fetch logic between pages and API routes.

Duplicated fetch logic would make it harder to maintain:

```txt
cache behavior
provider error handling
response normalization
TTL values
test coverage
public API consistency
```

---

## Decision

Use shared cached data provider modules for market and weather data access.

Current provider files:

```txt
src/lib/data/crypto-global.ts
src/lib/data/weather-forecast.ts
src/lib/data/coin-market-chart.ts
src/lib/data/coin-ohlc-chart.ts
```

These modules centralize:

```txt
cache key construction
Redis cache reads
provider fetch fallback
Redis cache writes
TTL handling
normalized return data
cache status reporting
```

---

## Rationale

Shared cached data providers keep data access consistent across server-rendered pages and public API routes.

This supports:

```txt
one provider integration path
one cache behavior per data type
less duplicated code
easier testing
clearer runtime expectations
consistent cache TTLs
```

The public API layer can focus on request handling, validation, headers, and rate limiting instead of duplicating provider access.

---

## Alternatives Considered

### Fetch external providers directly inside pages

This would make page code harder to test and would duplicate cache behavior.

### Fetch external providers directly inside route handlers

This would work for APIs but would not help server-rendered pages reuse the same cached data path.

### Internal HTTP calls from pages to own API routes

This would create unnecessary internal network overhead and blur server-side boundaries.

The project instead uses direct shared modules for server-side reuse.

---

## Consequences

Positive consequences:

```txt
shared cache behavior
less duplicated provider logic
clearer tests for cache HIT/MISS behavior
consistent TTL handling
centralized provider fallback logic
better separation between route handling and data access
```

Trade-offs:

```txt
shared provider modules must remain stable
changes affect both pages and API routes
cache key changes require careful review
tests must cover both cache and fetch paths
```

---

## Current Flow

```txt
Page or API route
  |
  v
Shared cached data provider
  |
  +-- Redis cache read
  +-- provider fetch on MISS
  +-- normalization
  +-- Redis cache write
  |
  v
Normalized data result
```

---

## Related Documentation

```txt
README.md
docs/architecture.md
docs/architecture-diagrams.md
docs/operations.md
docs/openapi.yaml
```
