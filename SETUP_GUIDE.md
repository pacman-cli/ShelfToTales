# ShelfToTales — Setup, Run & Test Guide

Complete guide to set up, run, and test the ShelfToTales platform on any machine.

---

## Prerequisites

| Tool | Version | Check Command |
|------|---------|---------------|
| Java JDK | 17+ | `java -version` |
| Maven | 3.9+ | `mvn -version` (or use included `./mvnw`) |
| Node.js | 20+ | `node -v` |
| npm | 9+ | `npm -v` |
| PostgreSQL | 14+ | `psql --version` |
| Redis | 7+ | `redis-cli ping` |
| Git | 2.30+ | `git --version` |

### Optional (for AI features)
| Tool | Purpose |
|------|---------|
| ONNX model files | Semantic search (run `scripts/download-models.sh`) |
| OpenAI API key | Conversational chatbot (works without — falls back to rule-based) |

---

## Quick Start (5 minutes)

```bash
# 1. Clone
git clone <repo-url> ShelfToTales
cd ShelfToTales

# 2. Start PostgreSQL & Redis (Docker method)
docker run -d --name shelftotales-db \
  -e POSTGRES_DB=shelftotales \
  -e POSTGRES_USER=shelftotales \
  -e POSTGRES_PASSWORD=shelftotales_password \
  -p 5432:5432 postgres:16

docker run -d --name shelftotales-redis -p 6379:6379 redis:7-alpine

# 3. Run Backend
cd backend/shelfToTales
./mvnw spring-boot:run

# 4. Run Frontend (new terminal)
cd frontend-next
npm install --legacy-peer-deps
npm run dev
```

**App available at:** http://localhost:3000  
**API available at:** http://localhost:8080/api  
**Swagger UI:** http://localhost:8080/swagger-ui/index.html

---

## Detailed Setup

### 1. Database Setup

#### Option A: Docker (Recommended)
```bash
docker run -d --name shelftotales-db \
  -e POSTGRES_DB=shelftotales \
  -e POSTGRES_USER=shelftotales \
  -e POSTGRES_PASSWORD=shelftotales_password \
  -p 5432:5432 postgres:16
```

#### Option B: Local PostgreSQL
```bash
# Create database
psql -U postgres -c "CREATE DATABASE shelftotales;"
psql -U postgres -c "CREATE USER shelftotales WITH PASSWORD 'shelftotales_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE shelftotales TO shelftotales;"
```

### 2. Redis Setup

#### Option A: Docker
```bash
docker run -d --name shelftotales-redis -p 6379:6379 redis:7-alpine
```

#### Option B: Local Redis
```bash
# macOS
brew install redis && brew services start redis

# Ubuntu
sudo apt install redis-server && sudo systemctl start redis
```

### 3. Backend Setup

```bash
cd backend/shelfToTales

# Build (downloads dependencies)
./mvnw clean compile

# Run with default profile (connects to localhost DB/Redis)
./mvnw spring-boot:run
```

**Environment variables (optional overrides):**
```bash
export DB_PASSWORD=shelftotales_password
export REDIS_HOST=localhost
export REDIS_PORT=6379
export JWT_SECRET_KEY=your-secret-key-here
export AI_CHAT_PROVIDER=none          # or "openai"
export AI_CHAT_API_KEY=sk-...         # only if using openai
```

**Flyway runs automatically** — all 50 migrations execute on first startup, creating tables and seeding data.

### 4. Frontend Setup

```bash
cd frontend-next

# Install dependencies
npm install --legacy-peer-deps

# Create .env.local (optional — defaults to localhost:8080)
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api" > .env.local

# Run development server
npm run dev
```

### 5. AI Features Setup (Optional)

```bash
# Download ONNX embedding model (22MB)
chmod +x scripts/download-models.sh
./scripts/download-models.sh

# Restart backend — semantic search will use real embeddings
```

Without the model, semantic search falls back to hash-based similarity (still functional, just less accurate).

---

## Running Tests

### Backend Tests (87 tests)
```bash
cd backend/shelfToTales

# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=FollowServiceTest

# Run with verbose output
./mvnw test -Dtest=CouponServiceTest -Dsurefire.useFile=false
```

### Frontend Tests (26 tests)
```bash
cd frontend-next

# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run E2E tests (requires app running)
npm run test:e2e
```

---

## Project Structure

```
ShelfToTales/
├── backend/shelfToTales/          ← Spring Boot API
│   ├── src/main/java/             ← Source code (231 Java files)
│   │   └── com/example/shelftotales/
│   │       ├── admin/             ← Admin management (6 files)
│   │       ├── ai/               ← AI/ML features (13 files)
│   │       ├── commerce/          ← Orders, payments, coupons (30 files)
│   │       ├── exchange/          ← Book exchange marketplace (12 files)
│   │       ├── gamification/      ← Streaks, achievements (16 files)
│   │       ├── social/            ← Follow, friends, feed (26 files)
│   │       ├── config/            ← Spring configuration
│   │       ├── controller/        ← Remaining REST controllers
│   │       ├── model/             ← Shared entities (User, Book)
│   │       ├── observer/          ← Event observers
│   │       └── ...
│   ├── src/main/resources/
│   │   ├── application.properties ← App configuration
│   │   └── db/migration/         ← 50 Flyway migrations
│   └── src/test/                  ← 87 unit tests
│
├── frontend-next/                 ← Next.js 15 frontend
│   ├── app/                       ← Pages and components
│   ├── e2e/                       ← Playwright E2E tests
│   └── package.json
│
├── scripts/
│   └── download-models.sh         ← AI model downloader
│
├── docs/
│   ├── ENTERPRISE_ARCHITECTURE_GUIDE.md
│   ├── superpowers/specs/         ← Design specs (Phases 2-4)
│   └── superpowers/plans/         ← Implementation plans
│
└── .github/workflows/ci.yml       ← GitHub Actions CI
```

---

## API Endpoints Overview

### Public (no auth required)
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| POST | /api/auth/google | Google OAuth login |
| GET | /api/books | Browse books (paginated) |
| GET | /api/books/{id} | Book details |
| GET | /api/categories | List categories |
| GET | /api/search/semantic?q=... | AI semantic search |

### Authenticated (JWT required)
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/dashboard | User dashboard stats |
| POST | /api/social/follow/{id} | Follow user |
| GET | /api/feed/following | Activity feed |
| GET | /api/feed/discover | AI-personalized discover |
| POST | /api/ai/chat | AI recommendation chatbot |
| POST | /api/checkout | Enhanced checkout |
| GET | /api/notifications | Notifications |
| GET | /api/streaks | Reading streak |
| GET | /api/achievements/mine | Earned achievements |
| GET | /api/challenges | Reading challenges |
| GET | /api/exchange/listings | Book exchange marketplace |

### Admin (ADMIN role required)
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/admin/analytics/dashboard | Platform stats |
| POST | /api/admin/users/{id}/ban | Ban user |
| POST | /api/admin/coupons | Create coupon |
| PUT | /api/admin/orders/{id}/status | Update order status |

---

## Default Credentials

After first startup, seeded users:
| Email | Password | Role |
|-------|----------|------|
| admin@shelftotales.com | Admin123! | ADMIN |
| user@shelftotales.com | User123! | USER |

---

## Configuration Reference

| Property | Default | Description |
|----------|---------|-------------|
| `spring.datasource.url` | `jdbc:postgresql://localhost:5432/shelftotales` | Database URL |
| `spring.datasource.password` | `shelftotales_password` | DB password |
| `spring.redis.host` | `localhost` | Redis host |
| `jwt.secret-key` | (default in props) | JWT signing key |
| `ai.chat.provider` | `none` | AI chat: `none` or `openai` |
| `ai.chat.api-key` | (empty) | OpenAI API key |
| `app.cors.allowed-origins` | `http://localhost:3000` | CORS origins |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Connection refused` on port 5432 | Start PostgreSQL: `docker start shelftotales-db` |
| `Connection refused` on port 6379 | Start Redis: `docker start shelftotales-redis` |
| `Flyway migration failed` | Drop and recreate DB: `dropdb shelftotales && createdb shelftotales` |
| Frontend 401 errors | Login again — JWT may have expired (24h) |
| `ONNX model not found` warning | Run `scripts/download-models.sh` (optional) |
| `npm install` peer dep errors | Use `npm install --legacy-peer-deps` |
| Tests fail with `Cannot find module` | Run `npm install --legacy-peer-deps` |

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3.4, Spring Security 6, Spring Data JPA |
| Database | PostgreSQL 16, Flyway migrations |
| Cache | Redis (caching + token blacklist) |
| Real-time | WebSocket (STOMP + SockJS) |
| AI | ONNX Runtime (local embeddings), OpenAI API (optional chatbot) |
| Frontend | Next.js 15, React 19, Bootstrap 5, Chart.js |
| Testing | JUnit 5, Mockito, Vitest, Playwright |
| CI/CD | GitHub Actions |
| Containerization | Docker |

---

## Design Patterns Used

| Pattern | Where |
|---------|-------|
| Strategy | PaymentGateway, ChatProvider, ReadingStatusTransition, AchievementEvaluation |
| Observer | Spring Events → Feed, Notifications, Streaks, Challenges, Achievements |
| Factory | NotificationFactory (Email/Push/InApp) |
| State Machine | Order, ExchangeListing, ExchangeRequest |
| Builder | All entities and DTOs (Lombok @Builder) |
| Singleton | ONNX model session |

---

## Build for Production

```bash
# Backend JAR
cd backend/shelfToTales
./mvnw clean package -DskipTests
# Output: target/shelfToTales-0.0.1-SNAPSHOT.jar

# Frontend static build
cd frontend-next
npm run build
# Output: .next/ directory

# Run production backend
java -jar target/shelfToTales-0.0.1-SNAPSHOT.jar \
  --spring.profiles.active=prod

# Run production frontend
npm start
```

### Docker Build
```bash
cd backend/shelfToTales
docker build -t shelftotales-api .
docker run -p 8080:8080 \
  -e DATABASE_URL=jdbc:postgresql://host:5432/shelftotales \
  -e REDIS_HOST=redis-host \
  shelftotales-api
```
