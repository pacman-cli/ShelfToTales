# ShelfToTales

ShelfToTales is a full-stack bookstore app for browsing books, managing categories, signing in with JWT auth, and saving books to a personal wishlist. The repository contains a Spring Boot REST API and a Create React App frontend.

## Stack

### Backend

- Java 17
- Spring Boot 3.4.0
- Spring Web, Security, Validation, Data JPA, Hibernate
- JWT auth with `io.jsonwebtoken`
- Flyway-managed schema and seed data
- H2 for local development by default
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

## Notes for Development

- Backend package boundaries are `controller`, `service`, `repository`, `model`, `dto`, `security`, and `config`.
- Controllers stay thin; business logic belongs in services.
- Frontend API calls should go through `frontend/src/api/api.js`.
- Frontend routes are centralized in `frontend/src/routes/AppRoutes.js`.
- Default CORS allows `http://localhost:3000`.
