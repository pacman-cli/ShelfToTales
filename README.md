# ShelfToTales

ShelfToTales is a full-stack bookstore and reader-community platform. It starts with a practical e-commerce base for browsing books, authentication, wishlists, categories, admin management, and checkout-oriented UI flows. The broader product vision is a digital home for readers where book discovery, community, sustainability, and reading progress work together.

## Project Vision

ShelfToTales is designed to go beyond a normal online bookstore.

- Build a digital home where commerce meets community.
- Help readers discover books through smarter signals such as mood, images, and emotions.
- Support a sustainable reading culture through book exchanges and donations.
- Turn personal reading goals into shared achievements through gamified engagement.
- Keep the community safe with moderation, secure user management, and monitoring.

## Problem Statement

Modern readers can buy books easily, but they still face several problems:

| Problem | Why it matters |
| --- | --- |
| Lonely reader experience | Finding a real-time community to discuss books is difficult. |
| Information overload | Genre and price filters do not always match a reader's mood or current interest. |
| Spoiler anxiety | Online reviews and feeds can reveal major plot twists before readers are ready. |
| Wasted books | Many books stay unused after one read, with no simple way to trade or donate them locally. |

## Current Application

The current codebase implements the foundation for the ShelfToTales platform:

- Public book catalog with category filtering and keyword search.
- JWT-based user registration and login.
- Authenticated wishlist management.
- React pages for book lists, details, cart, checkout, product comparison, blog, dashboard, profile, purchase history, and virtual bookshelf.
- Admin-only backend APIs for managing books and categories.
- H2 local database with Flyway migrations and starter seed data.
- PostgreSQL-backed Docker setup for backend runtime.
- Swagger/OpenAPI documentation for backend APIs.

## Feature Pillars

### E-Commerce Core

- Product catalog for books.
- Shopping cart and checkout-oriented frontend flows.
- Book detail pages.
- Order and purchase-history UI structure.
- Admin book management.

### User Engagement

- User accounts and JWT authentication.
- Wishlist and favorites.
- Product comparison.
- Quick-view style book browsing.
- Dashboard and profile pages.

### Content and Navigation

- Books organized by category.
- Search by query string.
- Category-based filtering.
- Blog and content pages.
- Blog management UI structure.

### Smart Marketplace Vision

These are planned product directions from the project concept:

- AI image search: users can identify a book by uploading or taking a photo of its cover.
- Mood-based suggestions: users can discover books based on how they want to feel.
- Full checkout and order management as a complete commerce workflow.

### Social Library Vision

The long-term community layer includes:

- Virtual bookshelves to track books read, owned, and wanted next.
- Spoiler-free zones where AI filters hide spoilers from reviews and feeds.
- Virtual reading rooms for shared reading, chat, and background Lo-fi music.

### Giving Economy Vision

ShelfToTales also aims to reduce unused books through:

- Peer-to-peer physical book exchange.
- Donation workflows so books can get a second life.
- Local community circulation instead of one-time ownership only.

### Engagement Tools Vision

Planned reader-growth features include:

- Reading challenges for annual goals and progress tracking.
- Smart PDF annotations.
- Sharing highlighted quotes or favorite passages to a social feed.

### Admin, Trust, and Safety

The platform is designed around a safe and manageable community:

- Moderation tools for reports and community safety.
- Analytics dashboard for trending books and platform activity.
- Real-time monitoring.
- Secure user management.
- Role-based admin endpoints.

## Tech Stack

### Backend

- Java 17
- Spring Boot 3.4.0
- Spring Web, Security, Validation, Data JPA, Hibernate
- JWT auth with `io.jsonwebtoken`
- Flyway-managed schema and seed data
- H2 for local development
- PostgreSQL support for Docker and deployed environments
- Springdoc OpenAPI / Swagger UI
- Lombok

### Frontend

- React 18
- React Router 6
- Axios
- Bootstrap / React-Bootstrap
- SweetAlert2
- CRA scripts

## Repository Layout

```text
.
├── backend/shelfToTales/      # Spring Boot API
│   ├── src/main/java/...      # controllers, services, repositories, models, DTOs
│   ├── src/main/resources/    # app config and Flyway migrations
│   ├── Dockerfile
│   └── docker-compose.yml
└── frontend/                  # React UI
    └── src/
        ├── api/api.js         # shared Axios client
        ├── routes/AppRoutes.js
        ├── pages/
        └── components/
```

## Prerequisites

- Java 17
- Node.js and npm
- Docker Desktop, optional, for PostgreSQL-backed backend runtime

## Run Locally

### Backend

```bash
cd backend/shelfToTales
./mvnw spring-boot:run
```

Backend starts at `http://localhost:8080`.

Default H2 connection:

- JDBC URL: `jdbc:h2:mem:shelftotalesdb`
- User: `sa`
- Password: `password`
- Console: `http://localhost:8080/h2-console`

Swagger UI:

- `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/api-docs`

### Frontend

```bash
cd frontend
npm install
npm start
```

Frontend starts at `http://localhost:3000` and calls the backend through `http://localhost:8080/api`.

## Docker Backend

The backend directory includes Docker Compose for the API plus PostgreSQL.

```bash
cd backend/shelfToTales
docker compose up --build
```

Services:

- Backend: `http://localhost:8080`
- PostgreSQL: `localhost:5432`
- Database: `shelftotalesdb`
- User: `shelftotales`

Stop services:

```bash
docker compose down
```

Remove database volume too:

```bash
docker compose down -v
```

## Configuration

Backend config lives in `backend/shelfToTales/src/main/resources/application.properties`.

Common environment variables:

| Variable | Default |
| --- | --- |
| `DB_URL` | `jdbc:h2:mem:shelftotalesdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE` |
| `DB_DRIVER` | `org.h2.Driver` |
| `DB_USERNAME` | `sa` |
| `DB_PASSWORD` | `password` |
| `DB_DIALECT` | `org.hibernate.dialect.H2Dialect` |
| `H2_CONSOLE_ENABLED` | `true` |
| `JWT_SECRET_KEY` | development key in `application.properties` |
| `JWT_EXPIRATION_MS` | `86400000` |

Use a strong `JWT_SECRET_KEY` outside local development.

## API Overview

Public endpoints:

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register user and return JWT payload |
| `POST` | `/api/auth/login` | Login user and return JWT payload |
| `GET` | `/api/books` | List books |
| `GET` | `/api/books?q=term` | Search books |
| `GET` | `/api/books?categoryId=1` | List books by category |
| `GET` | `/api/books/{id}` | Get one book |
| `GET` | `/api/categories` | List categories |

Authenticated endpoints:

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/wishlist` | Get current user's wishlist |
| `POST` | `/api/wishlist/{bookId}` | Add book to wishlist |
| `DELETE` | `/api/wishlist/{bookId}` | Remove book from wishlist |

Admin endpoints require `ROLE_ADMIN`:

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/admin/books` | Create book |
| `PUT` | `/api/admin/books/{id}` | Update book |
| `DELETE` | `/api/admin/books/{id}` | Delete book |
| `POST` | `/api/admin/categories` | Create category |
| `PUT` | `/api/admin/categories/{id}` | Update category |
| `DELETE` | `/api/admin/categories/{id}` | Delete category |

Send JWTs as:

```http
Authorization: Bearer <token>
```

## Database

Flyway migrations live in `backend/shelfToTales/src/main/resources/db/migration`.

Current migrations create:

- categories
- users
- books
- wishlist items
- seed categories and books

`DataSeeder` also inserts starter categories and books when tables are empty.

## Tests and Builds

Backend:

```bash
cd backend/shelfToTales
./mvnw test
```

Frontend:

```bash
cd frontend
npm test
npm run build
```

## Team

| Name | ID |
| --- | --- |
| Rushdania Bushra | 0112230039 |
| Habiba Khatun | 011221085 |
| Fayjullah Haque | 011221072 |
| Ashikur Rahman Puspo | 0112310304 |
| Mst. Sumia Khatun | 011221563 |

## Notes for Development

- Backend package boundaries are `controller`, `service`, `repository`, `model`, `dto`, `security`, and `config`.
- Controllers stay thin; business logic belongs in services.
- Frontend API calls should go through `frontend/src/api/api.js`.
- Frontend routes are centralized in `frontend/src/routes/AppRoutes.js`.
- Default CORS allows `http://localhost:3000`.
