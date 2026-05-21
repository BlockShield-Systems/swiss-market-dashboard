# 0004. Use Feature Flags for AI Execution

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

The project includes an AI-ready market summary route.

AI execution introduces additional operational concerns:

```txt
provider cost
provider quota
output quality
rate-limit requirements
cache requirements
error handling
rollout control
```

The route should not be publicly enabled just because the code path exists.

---

## Decision

Keep AI market summary execution behind a server-side feature flag.

Current route:

```txt
POST /api/ai/market-summary
```

Current production setting:

```env
FEATURE_AI_MARKET_SUMMARY_ENABLED=false
```

The route exists as an implemented server-side path but remains disabled in production by default.

---

## Rationale

A feature flag provides an explicit operational control for cost-sensitive behavior.

This allows the project to:

```txt
deploy the code safely
disable AI execution without removing code
avoid accidental public model usage
control rollout timing
verify rate-limit and cache behavior before enablement
keep provider costs deliberate
```

---

## Alternatives Considered

### Remove the AI route entirely

Removing the route would avoid cost risk but would also remove the prepared integration path.

### Enable AI route immediately

This would expose cost and output behavior before operational controls are intentionally confirmed.

### Client-side AI integration

Client-side AI integration is not acceptable because provider credentials must remain server-side.

---

## Consequences

Positive consequences:

```txt
AI execution remains controlled
production deployment can include the route safely
cost-sensitive behavior is explicit
rollout does not require architectural changes
server-side secrets remain protected
```

Trade-offs:

```txt
the route requires clear documentation
production behavior depends on correct environment values
testing must cover disabled and enabled paths
future enablement requires operational review
```

---

## Current AI Protection Model

Expected protection flow:

```txt
feature flag check
request validation
Redis-backed AI rate limit
AI response cache lookup
market context fetch
AI Gateway call
optional persistence
cache write
JSON response
```

Current production default:

```env
FEATURE_AI_MARKET_SUMMARY_ENABLED=false
```

---

## Related Documentation

```txt
README.md
SECURITY.md
docs/security.md
docs/threat-model.md
docs/operations.md
```
