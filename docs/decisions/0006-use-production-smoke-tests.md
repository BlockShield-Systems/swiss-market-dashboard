# 0006. Use Production Smoke Tests

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

The project has a live production deployment and public routes that should remain verifiable after changes.

Production behavior includes:

```txt
public pages
robots.txt
sitemap.xml
OpenGraph image
public API endpoints
security headers
API observability headers
absence of x-powered-by
basic JSON response shapes
```

Local tests and builds are necessary, but they do not fully verify deployed production behavior.

---

## Decision

Use a production smoke-test script as part of the verification process.

Current command:

```bash
pnpm smoke:prod
```

Current smoke-test script:

```txt
scripts/smoke-test-production.mjs
```

Expected production baseline:

```txt
201 checks passed
0 checks failed
```

---

## Rationale

Production smoke tests provide a repeatable check against the deployed application.

They verify behavior that local tests cannot fully prove, including:

```txt
deployed route availability
production headers
production API responses
security header presence
forbidden header absence
public endpoint reachability
content-type expectations
```

The smoke test is especially useful after documentation, configuration, deployment, or route changes.

---

## Alternatives Considered

### Manual browser checks only

Manual checks are useful but inconsistent and easy to miss.

### Unit tests only

Unit tests verify isolated logic but do not confirm deployed production behavior.

### Full end-to-end suite only

A full E2E suite can be useful, but the current smoke test provides a lightweight production verification baseline.

---

## Consequences

Positive consequences:

```txt
production behavior is repeatably checked
security headers are verified after deployment
public API availability is checked
x-powered-by absence is verified
basic response shape regressions can be detected
documentation can reference a concrete verification command
```

Trade-offs:

```txt
smoke tests depend on production availability
external provider behavior can affect API checks
smoke tests are not a full penetration test
smoke tests do not replace unit or integration tests
```

---

## Current Verification Scope

The smoke test verifies:

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

Expected result:

```txt
201 checks passed
0 checks failed
```

---

## Related Documentation

```txt
README.md
docs/operations.md
docs/security.md
docs/threat-model.md
scripts/smoke-test-production.mjs
```
