# Security Policy

This document explains how security issues for the Swiss Market Dashboard should be reported and what is currently in scope.

Please do not report security vulnerabilities through public GitHub issues.

---

## Project Scope

This security policy applies to the public source repository and the production deployment of the Swiss Market Dashboard.

```txt
Production URL:
https://dashboard.ai-techart.com

Repository:
https://github.com/BlockShield-Systems/swiss-market-dashboard
```

Covered areas:

```txt
Public dashboard pages
Public API routes
Security headers
Rate limiting
Redis-backed caching
Environment variable handling
Feature-flagged AI route
Production smoke-test verification
```

Related technical documentation:

```txt
docs/security.md
docs/threat-model.md
docs/operations.md
docs/openapi.yaml
```

---

## Reporting a Vulnerability

If you believe you have found a security vulnerability, please report it privately.

Preferred reporting method:

```txt
GitHub Security Advisory
```

If GitHub Security Advisories are not available, open a minimal GitHub issue that does **not** include exploit details, active payloads, secrets, or reproduction steps that could be abused publicly.

Do not publish vulnerability details before the issue has been reviewed and, if applicable, fixed.

---

## What to Include

A useful report should include as much of the following information as possible:

```txt
Affected route, file, or feature
Short description of the issue
Expected behavior
Actual behavior
Steps to reproduce
Impact assessment
Relevant request and response headers
Screenshots if helpful
Suggested fix or mitigation if known
```

Please do not include:

```txt
Real API keys
Database URLs
Redis credentials
Access tokens
Private infrastructure details
Sensitive user data
Exploit instructions intended for public abuse
```

---

## Responsible Disclosure

The project follows coordinated vulnerability disclosure principles.

Expected process:

```txt
1. Report the issue privately.
2. Allow time for review and remediation.
3. Avoid public disclosure before a fix or mitigation is available.
4. Coordinate publication details if disclosure is appropriate.
```

The goal is to fix valid security issues without increasing risk for the live deployment or its users.

---

## Testing Rules

Security testing must be non-destructive and limited to normal manual request volume.

Allowed:

```txt
Reviewing public source code
Checking public response headers
Testing documented public API behavior
Testing validation behavior with safe inputs
Reporting inconsistent documentation or security behavior
```

Not allowed:

```txt
Denial-of-service testing
High-volume automated scanning against production
Rate-limit bypass attempts
Credential stuffing
Brute-force attacks
Access attempts against private infrastructure
Testing with stolen credentials
Social engineering
Publishing active exploit details before remediation
```

If a test could affect availability, external providers, rate limits, billing, or shared infrastructure, do not run it against production.

---

## Current Security Controls

The project currently uses the following security controls:

```txt
Security headers
Content-Security-Policy
Disabled x-powered-by header
Server-side secret handling
Redis-backed public API rate limiting
Redis-backed shared data caching
Feature flags for optional and cost-sensitive behavior
AI route disabled by default in production
Stable public API error responses
Production smoke-test verification
Dependency audit commands
```

The production smoke test verifies key runtime expectations, including security headers and absence of the framework powered-by header.

```bash
pnpm smoke:prod
```

Expected production baseline:

```txt
201 checks passed
0 checks failed
```

---

## Secret Handling

Secrets must never be committed to the repository.

Sensitive values include:

```txt
COINGECKO_API_KEY
DATABASE_URL
DATABASE_URL_UNPOOLED
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
AI_GATEWAY_API_KEY
```

Rules:

```txt
Use .env.local for local development secrets.
Use provider-managed environment variables for production.
Use placeholders in .env.example.
Never publish real keys in examples, screenshots, logs, or documentation.
Rotate exposed credentials immediately.
```

---

## Public API Scope

The public API contract is documented in:

```txt
docs/openapi.yaml
```

Current public API routes include:

```txt
GET /api/crypto/global
GET /api/weather?key=zurich
GET /api/crypto/{id}/market-chart?days=7
GET /api/crypto/{id}/ohlc?days=7
```

The AI summary route exists as a guarded server-side route and is disabled by default in production:

```txt
POST /api/ai/market-summary
FEATURE_AI_MARKET_SUMMARY_ENABLED=false
```

---

## Supported Versions

This project currently maintains the active `main` branch and the production deployment.

```txt
main branch          Supported
production deploy    Supported
older commits        Not actively supported
```

Security fixes are applied to the active codebase.

---

## Verification Commands

Before security-relevant changes are published, the following commands should pass:

```bash
pnpm type-check
pnpm lint
pnpm test:ci
pnpm build
pnpm audit
pnpm audit --prod
pnpm smoke:prod
```

---

## Related Documentation

```txt
docs/security.md          Technical security controls and headers
docs/threat-model.md      Public threat model and risk overview
docs/operations.md        Operational verification and rollback notes
docs/openapi.yaml         Public API contract
README.md                 Project overview
```

---

## References

```txt
GitHub Security Policy Documentation
https://docs.github.com/en/code-security/getting-started/adding-a-security-policy-to-your-repository

OWASP Top 10
https://owasp.org/www-project-top-ten/

OWASP Threat Modeling
https://owasp.org/www-community/Threat_Modeling
```
