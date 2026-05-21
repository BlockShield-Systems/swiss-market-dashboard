# 0005. Use OpenAPI for Public API Contract

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

Swiss Market Dashboard exposes public API routes for market and weather data.

Current public API routes include:

```txt
GET /api/crypto/global
GET /api/weather?key=zurich
GET /api/crypto/{id}/market-chart?days=7
GET /api/crypto/{id}/ohlc?days=7
```

These APIs expose:

```txt
query parameters
path parameters
JSON response bodies
error responses
cache headers
rate-limit headers
data-source headers
security-relevant response behavior
```

A clear public contract is needed so behavior is documented outside the implementation.

---

## Decision

Use OpenAPI as the public API contract format.

Current file:

```txt
docs/openapi.yaml
```

The project uses OpenAPI 3.1.0 for public API documentation.

---

## Rationale

OpenAPI provides a structured and widely understood format for documenting HTTP APIs.

It is useful for:

```txt
documenting routes
documenting parameters
documenting response schemas
documenting error responses
documenting headers
supporting future validation or tooling
improving integration clarity
```

This is better than describing public API behavior only in prose.

---

## Alternatives Considered

### README-only API documentation

README-only documentation is easy to read but becomes harder to maintain as API behavior grows.

### Inline comments only

Inline comments help maintainers but do not provide a public API contract.

### Generated documentation only

Generated documentation can be useful later, but a maintained OpenAPI file is currently simpler and explicit.

---

## Consequences

Positive consequences:

```txt
public API behavior is documented in one contract
headers and schemas are explicit
integrators can inspect expected responses
API changes have a clear documentation target
security-relevant response behavior is visible
```

Trade-offs:

```txt
OpenAPI must stay aligned with implementation
schema changes require documentation updates
manual documentation can drift without review
```

---

## Change Rule

When public API behavior changes, update:

```txt
docs/openapi.yaml
route tests
README.md if public behavior changes
docs/operations.md if verification behavior changes
```

Recommended checks:

```bash
pnpm type-check
pnpm lint
pnpm test:ci
pnpm build
pnpm smoke:prod
```

---

## Related Documentation

```txt
README.md
docs/openapi.yaml
docs/architecture.md
docs/operations.md
docs/security.md
```
