# 0001. Use Next.js App Router

Status:

```txt
Accepted
```

Documented on:

```txt
2026-05-21
```

---

## Context

Swiss Market Dashboard is a full-stack data application with public dashboard pages, public API routes, server-side data access, Redis-backed caching, feature flags, security headers, and production deployment on Vercel.

The application needs a framework model that supports:

```txt
server-rendered pages
route handlers
server components
client components
metadata routes
production deployment on Vercel
TypeScript-first development
clear separation between server-side and client-side code
```

The project also needs to keep secrets server-side and avoid exposing provider credentials to the browser.

---

## Decision

Use Next.js App Router as the main application architecture.

The application uses:

```txt
App Router pages
server components
client components where interactivity is required
Next.js route handlers for public APIs
metadata routes such as opengraph-image
Vercel deployment
```

---

## Rationale

Next.js App Router fits the application because it allows the project to combine UI rendering and backend route handlers in one TypeScript codebase.

Relevant project needs:

```txt
public dashboard pages
server-side data fetching
public JSON APIs
security header configuration
metadata handling
feature-flagged routes
production build verification
Vercel deployment compatibility
```

The App Router model also supports a clean boundary between server-only logic and browser-facing components.

---

## Alternatives Considered

### Separate frontend and backend applications

A separate frontend and backend could provide strong separation, but it would add operational complexity.

Trade-offs:

```txt
more deployment units
more duplicated configuration
more API boundary management
more infrastructure overhead
```

This was not necessary for the current application scope.

### Pages Router

The Pages Router is stable, but the App Router better fits the current Next.js direction and the project’s server component and route handler structure.

### Static-only site

A static-only site would not fit the project because the application depends on:

```txt
server-side provider calls
Redis cache
rate limiting
database reads
public API route handlers
feature flags
```

---

## Consequences

Positive consequences:

```txt
single full-stack TypeScript application
server-side data access remains close to route/page code
public API routes live in the same application
Vercel deployment remains straightforward
metadata routes are supported
feature-flagged behavior can stay server-side
```

Trade-offs:

```txt
runtime behavior must be understood per route
server/client boundaries must be respected
some routes may opt into dynamic behavior
Edge runtime constraints must be documented where used
```

---

## Current Notes

The OpenGraph image route uses Edge runtime:

```txt
src/app/opengraph-image.tsx
```

This can produce the known build warning:

```txt
Using edge runtime on a page currently disables static generation for that page
```

This is expected for the dynamic OpenGraph image route and does not indicate a failure of normal application pages.

---

## Related Documentation

```txt
README.md
docs/architecture.md
docs/architecture-diagrams.md
docs/operations.md
docs/security.md
```
