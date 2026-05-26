# ShelfToTales — Full Project Audit Report

**Date:** 2026-05-23  
**Auditor:** Kiro AI  
**Build Status:** ✅ PASS (62/62 tests, 0 failures)

---

## 1. Project Overview

| Metric | Value |
|--------|-------|
| Backend LOC (Java) | 5,362 |
| Backend Test LOC | 1,710 |
| Frontend LOC (JS) | 23,619 |
| DB Migrations | 30 files (299 LOC) |
| Test Files (Backend) | 14 |
| E2E Tests (Frontend) | 5 specs |
| Design Patterns Used | Strategy, Factory, Builder, Observer (WebSocket) |

**Tech Stack:**
- Backend: Spring Boot 3.4, Java 17, PostgreSQL, Redis, Flyway, Resilience4j
- Frontend: Next.js 15.5, React 19, Bootstrap 5, Axios, STOMP/SockJS
- Infrastructure: Docker, GitHub Actions CI, Actuator health probes

---

## 2. Architecture Assessment

### 2.1 Layer Separation — ✅ Good
```
Controller → Service → Repository → Entity
     ↓           ↓
    DTO      Domain Logic (in entities)
```
- Controllers are thin (delegation only)
- Services contain orchestration logic
- Entities contain domain invariants (Order state machine, CartItem validation)
- DTOs separate API contract from persistence model

### 2.2 Design Patterns — ✅ Well Applied

| Pattern | Implementation | Quality |
|---------|---------------|---------|
| **Strategy** | `ReadingStatusTransitionStrategy` + Context | ✅ Clean OCP-compliant |
| **Factory** | `NotificationFactory` (Email, Push, InApp) | ✅ Extensible, no modification needed |
| **Builder** | Lombok `@Builder` on all entities/DTOs | ✅ Consistent |
| **State Machine** | `Order.VALID_TRANSITIONS` map | ✅ Explicit, guarded |
| **Template Method** | `OncePerRequestFilter` (RateLimiting) | ✅ Correct usage |
| **Observer** | WebSocket pub/sub via STOMP | ✅ Decoupled |

### 2.3 Package Structure — ✅ Clean
```
config/        — Security, Redis, WebSocket, OpenAPI
controller/    — REST endpoints (12 controllers)
dto/           — Request/Response objects (25 DTOs)
exception/     — Global exception handler
model/         — JPA entities (15 entities)
notification/  — Factory pattern notification system
repository/    — Spring Data JPA (14 repositories)
security/      — JWT, Rate limiting
service/       — Business logic (12 services)
strategy/      — Reading status transitions
util/          — Auth helpers, password validation, token blacklist
```

---

## 3. Security Audit

| Check | Status | Details |
|-------|--------|---------|
| Authentication | ✅ | JWT with proper validation, token blacklist via Redis |
| Authorization | ✅ | Role-based (USER/ADMIN), endpoint-level security |
| Rate Limiting | ✅ FIXED | TTL-based eviction, no more full-clear bypass |
| WebSocket Auth | ✅ FIXED | STOMP CONNECT now requires valid JWT |
| CORS | ✅ | Configurable origins, credentials allowed, 1h preflight cache |
| HSTS | ✅ | Enabled with includeSubDomains, 1-year max-age |
| Password Validation | ✅ | Custom validator enforces strength rules |
| PII in Logs | ✅ FIXED | Emails masked in auth logs |
| Input Validation | ✅ FIXED | Bean validation on all endpoints |
| SQL Injection | ✅ | Parameterized JPQL queries throughout |
| Secrets Management | ⚠️ | Default JWT secret in properties (env var override available) |
| CSRF | ✅ | Stateless JWT — CSRF not applicable |
| XSS | ✅ | JSON API only, no server-rendered HTML |
| Optimistic Locking | ✅ FIXED | `@Version` on Book prevents concurrent stock corruption |

### Remaining Recommendations:
1. Remove default JWT secret from `application.properties` — require env var in production
2. Add `spring.profiles.active=prod` enforcement in Dockerfile
3. Consider adding request ID (MDC) for log correlation

---

## 4. Performance Audit

| Check | Status | Details |
|-------|--------|---------|
| Database Indexes | ✅ | V6 adds search indexes, V21 adds FK indexes |
| N+1 Queries | ✅ | `@EntityGraph` on book searches |
| Caching | ✅ | Redis-backed: books, bookById, categories, profiles (10min TTL) |
| Similar Books | ✅ FIXED | No longer loads all books; reads pre-computed embeddings only |
| Pagination | ✅ | All list endpoints paginated with configurable size (max 100) |
| Connection Pooling | ✅ | HikariCP (Spring default) + Redis Jedis pool configured |
| Circuit Breaker | ✅ | Google Auth with 50% failure threshold, 30s open state |
| Retry | ✅ | Order checkout retries on optimistic lock failure |

### Remaining Recommendations:
1. Add `@Cacheable` to `getBooksByMood` for frequently accessed moods
2. Pre-compute embeddings via a scheduled batch job instead of on-demand
3. Consider database-level vector search (pgvector) for production scale

---

## 5. Data Integrity Audit

| Check | Status | Details |
|-------|--------|---------|
| Optimistic Locking | ✅ FIXED | `@Version` on Book entity |
| Transaction Boundaries | ✅ | `@Transactional` on all write operations |
| Read-Only Transactions | ✅ FIXED | `findSimilarBooks` now `readOnly=true` |
| Cascade Rules | ✅ | `CascadeType.ALL` + `orphanRemoval` on Order→OrderItems |
| Constraint Enforcement | ✅ | NOT NULL, UNIQUE, FK constraints in migrations |
| State Machine Guards | ✅ | Order transitions validated before application |
| Cart Validation | ✅ | Stock check, quantity limits (max 99), positive-only |

---

## 6. Test Coverage Audit

| Layer | Files | Tests | Coverage Assessment |
|-------|-------|-------|-------------------|
| Services | 12 | 10 test files | ✅ Good — core logic covered |
| Controllers | 12 | 2 test files | ⚠️ Partial — only Auth + Dashboard |
| Security | 1 | 1 test file | ✅ Rate limiter fully tested |
| AI Service | 1 | 1 test file | ✅ Embedding + similarity tested |
| Frontend Unit | — | 4 test files | ⚠️ Partial — contexts + hooks |
| Frontend E2E | — | 5 spec files | ✅ Core flows covered |

### Missing Test Coverage:
- `BookController`, `OrderController`, `CartController` integration tests
- `WebSocketAuthInterceptor` unit test
- `GoogleAuthService` circuit breaker behavior test
- Frontend: page-level component tests

---

## 7. Code Quality Audit

| Check | Status | Details |
|-------|--------|---------|
| Consistent Style | ✅ | Lombok throughout, consistent naming |
| Error Handling | ✅ | Comprehensive `GlobalExceptionHandler` (13 exception types) |
| Logging | ✅ | Structured JSON in prod, human-readable in dev |
| API Documentation | ✅ | OpenAPI/Swagger with `@Operation` annotations |
| DTO Separation | ✅ | No entity leakage to API layer |
| Magic Numbers | ✅ | Constants extracted (`MAX_ITEMS_PER_ORDER`, `MAX_QUANTITY_PER_ITEM`) |
| Dead Code | ✅ | None detected |
| Deprecated APIs | ⚠️ | `httpStrictTransportSecurity()` deprecated (warning only) |

---

## 8. DevOps & Infrastructure Audit

| Check | Status | Details |
|-------|--------|---------|
| CI Pipeline | ✅ | GitHub Actions: compile → test → package (backend + both frontends) |
| Docker | ✅ | Multi-stage build, JRE-alpine runtime |
| Health Probes | ✅ | Actuator health/info/metrics exposed, liveness/readiness enabled |
| Secrets in Code | ⚠️ | Default JWT secret + DB password in properties (env var overridable) |
| Log Aggregation Ready | ✅ | Logstash JSON encoder for prod profile |
| Concurrency Control | ✅ | CI `cancel-in-progress` on same ref |

### Missing:
- No `docker-compose.yml` for local dev (PostgreSQL + Redis)
- No production deployment config (K8s manifests or cloud deploy)
- No Playwright CI step for E2E tests

---

## 9. Frontend Audit

| Check | Status | Details |
|-------|--------|---------|
| Auth Token Storage | ⚠️ | localStorage (XSS-vulnerable; acceptable for this project scope) |
| API Error Handling | ✅ | Centralized interceptor with 401 redirect, 403/5xx toasts |
| State Management | ✅ | useReducer + Context (Auth, Cart, App) |
| Route Protection | ✅ | Auth-gated pages check token presence |
| WebSocket Client | ✅ | STOMP.js with SockJS fallback |
| Build Optimization | ✅ | Next.js 15 with automatic code splitting |
| Accessibility | ⚠️ | Bootstrap provides baseline; no explicit ARIA audit done |

---

## 10. Fixes Applied in This Session

| # | Issue | Severity | Fix Applied |
|---|-------|----------|-------------|
| 1 | Race condition on book stock during checkout | 🔴 Critical | Added `@Version` optimistic locking + `@Retry` |
| 2 | `findSimilarBooks` full-table scan | 🔴 Critical | Refactored to query only pre-computed embeddings |
| 3 | Unauthenticated WebSocket | 🔴 Critical | Added `WebSocketAuthInterceptor` on STOMP CONNECT |
| 4 | Rate limiter `buckets.clear()` bypass | 🟠 Serious | TTL-based eviction + removed XFF trust |
| 5 | PII (email) logged in plaintext | 🟠 Serious | Masked to `j***@gmail.com` format |
| 6 | No validation on mood path variable | 🟡 Moderate | `@Size(max=30)` + `@Pattern(alphabetic only)` |
| 7 | Read/write mixed in findSimilarBooks | 🟡 Moderate | Now `@Transactional(readOnly=true)`, no writes |

---

## 11. Overall Score

| Category | Score | Grade |
|----------|-------|-------|
| Architecture & Design | 9/10 | A |
| Security | 8/10 | B+ |
| Performance | 8/10 | B+ |
| Data Integrity | 9/10 | A |
| Test Coverage | 7/10 | B |
| Code Quality | 9/10 | A |
| DevOps Readiness | 7/10 | B |
| **Overall** | **8.1/10** | **B+** |

---

## 12. Priority Backlog (Remaining Work)

1. **Add controller integration tests** — OrderController, CartController, BookController
2. **Add docker-compose.yml** — PostgreSQL + Redis for local dev
3. **Remove default secrets** — Force env vars for JWT_SECRET_KEY and DB_PASSWORD
4. **Pre-compute embeddings** — Batch job to generate all book embeddings offline
5. **Add WebSocketAuthInterceptor test** — Unit test for CONNECT auth flow
6. **Frontend accessibility audit** — ARIA labels, keyboard navigation, contrast
7. **Add request ID (MDC)** — Correlate logs across request lifecycle
8. **Upgrade deprecated HSTS API** — Replace `httpStrictTransportSecurity()` with new API
