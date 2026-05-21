# Public Feedback

Swiss Market Dashboard is developed as a transparent technical reference system. Feedback is welcome when it is specific, verifiable and useful for improving the architecture, implementation, security posture, API behavior or operational reliability.

This document defines how technical feedback can be provided and what kind of feedback is most useful.

---

## Useful Feedback Areas

The most valuable feedback is concrete and tied to observable behavior, source code, documentation or production responses.

Useful areas include:

```txt
Architecture
API design
Caching strategy
Rate limiting
Security headers
Content-Security-Policy
Feature flag behavior
Production smoke testing
Database modeling
Drizzle ORM usage
Redis usage
Error handling
Runtime resilience
Public API response headers
Testing strategy
Documentation clarity
Accessibility
Performance
Operational verification
```

---

## Preferred Feedback Format

When opening an issue or sending feedback, include as much of the following as possible:

```txt
Area:
What part of the system is affected?

Observation:
What did you notice?

Evidence:
Which route, file, response header, test, command or documentation section supports the observation?

Impact:
Why does it matter?

Suggestion:
What would improve it?
```

Example:

```txt
Area:
Public API observability

Observation:
The API exposes X-Cache and X-Cache-TTL headers, but the documentation could also include one example for a rate-limited response.

Evidence:
GET /api/crypto/global
docs/architecture.md
docs/security.md

Impact:
This would make integration behavior clearer for external readers.

Suggestion:
Add one documented 429 response example with X-RateLimit-* headers.
```

---

## What Is Not Useful

The following feedback is usually not actionable:

```txt
Generic comments without context
Unverifiable claims
Marketing suggestions without technical connection
Requests to add unrelated features
Requests to expose secrets or internal operational details
Requests to bypass rate limits or security controls
Requests to enable cost-sensitive AI behavior without usage controls
```

---

## Current Review Focus

The current review focus is:

```txt
Production behavior
Public API contracts
Security posture
Runtime observability
Caching and rate limiting
Documentation accuracy
Quality gates
Operational verification
```

The AI market summary route is implemented but intentionally disabled in production. Feedback about the AI path is useful when it focuses on rollout safety, cost controls, provider failure modes, caching, rate limiting or feature-flag design.

---

## Public Feedback Channels

Preferred channels:

```txt
GitHub Issues
GitHub Discussions, if enabled later
Direct technical review through linked source files
```

For GitHub Issues, use the technical feedback issue template when possible:

```txt
.github/ISSUE_TEMPLATE/technical-feedback.yml
```

---

## Verification Before Feedback

Before reporting behavior that may be environment-specific, it is useful to verify the production deployment and local checks.

Production smoke test:

```bash
pnpm smoke:prod
```

Local quality gate:

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

Public API header check:

```bash
curl -I https://dashboard.ai-techart.com/api/crypto/global
```

---

## Feedback Use

Accepted feedback may result in:

```txt
Documentation updates
Test coverage improvements
Security hardening
API contract clarification
Architecture documentation improvements
Operational runbook updates
Runtime behavior fixes
```

Feedback is not used as a replacement for objective verification. Production behavior, tests, source code, documented constraints and reproducible checks remain the primary source of truth.