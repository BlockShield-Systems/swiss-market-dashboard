# 0002. Use Redis for Cache and Rate Limits

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

Swiss Market Dashboard integrates external data providers and public API routes.

The application needs to reduce repeated external provider calls, expose predictable API behavior, and protect cache-miss paths from excessive request volume.

The system requires shared runtime state for:

```txt
market data cache
weather forecast cache
public API rate limiting
AI route rate limiting
AI response cache
short-lived operational state
```

---

## Decision

Use Upstash Redis as the shared cache and rate-limit backend.

Redis is used for:

```txt
shared cached data services
public API response caching
public API rate limiting
AI route rate limiting
AI response caching
short-lived operational state
```

---

## Rationale

Redis fits the project because cache entries and rate-limit counters are short-lived, server-side, and shared across route handlers and server-rendered pages.

The same managed Redis service can support:

```txt
cache HIT/MISS behavior
TTL-based data freshness
rate-limit windows
cache observability headers
AI response reuse
```

This avoids relying on browser caching or CDN caching for public JSON API behavior.

---

## Alternatives Considered

### Browser or CDN caching only

Browser/CDN caching can be useful, but it is not the controlled cache layer for this project.

Limitations:

```txt
less direct control from application logic
harder to coordinate with rate limiting
less useful for shared server-side cache reuse
not sufficient for provider call reduction in all paths
```

### In-memory cache

An in-memory cache would be simple but not reliable across deployments, serverless instances, or distributed runtime environments.

Limitations:

```txt
not shared between instances
lost on cold starts or redeploys
not suitable for distributed rate limits
```

### Database-backed cache

A relational database can store cache data, but Redis is better suited for short-lived TTL-based data and counters.

---

## Consequences

Positive consequences:

```txt
shared cache across pages and route handlers
provider call reduction
consistent cache TTL behavior
rate-limit state stored outside application memory
safe public observability through headers
reusable cache utilities
```

Trade-offs:

```txt
Redis availability becomes relevant for cache and rate-limit behavior
cache TTLs must be documented and maintained
Redis credentials must remain server-side
failure behavior must avoid leaking internal details
```

---

## Current Cache TTLs

```txt
Crypto global data        60 seconds
Coin market chart data    300 seconds
Coin OHLC chart data      300 seconds
Weather forecast data     1800 seconds
AI response cache         1800 seconds
```

---

## Current Rate Limits

```txt
Crypto market data APIs   60 requests / minute / client identifier
General public APIs       120 requests / minute / client identifier
AI summary route          5 requests / 10 minutes / client identifier
```

---

## Related Documentation

```txt
README.md
docs/architecture.md
docs/security.md
docs/threat-model.md
docs/operations.md
```
