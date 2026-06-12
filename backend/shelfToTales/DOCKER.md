# Docker Setup for ShelfToTales Backend

This directory contains Docker configuration to run the ShelfToTales backend with PostgreSQL database.

## Prerequisites

- Docker installed on your machine
- Docker Compose installed (usually comes with Docker Desktop)

## Quick Start

To run the entire application stack (backend + PostgreSQL) with a single command:

```bash
docker-compose up --build
```

This will:
1. Build the Spring Boot application Docker image
2. Start PostgreSQL database
3. Start the backend application
4. Wait for PostgreSQL to be healthy before starting the backend

## Services

### PostgreSQL Database
- **Image**: postgres:16-alpine
- **Port**: 5432 (mapped to host)
- **Database**: shelftotalesdb
- **Username**: shelftotales
- **Password**: shelftotales_password
- **Data Persistence**: Uses Docker volume `postgres_data`

### Backend Application
- **Port**: 8080 (mapped to host)
- **Database**: Connects to PostgreSQL container
- **Health Check**: Waits for PostgreSQL to be healthy before starting

## Accessing the Application

Once running, you can access:
- **Backend API**: http://localhost:8080
- **H2 Console**: Disabled in Docker mode (PostgreSQL is used instead)

## Docker Commands

### Start the services
```bash
docker-compose up
```

### Start in detached mode (background)
```bash
docker-compose up -d
```

### Stop the services
```bash
docker-compose down
```

### Stop and remove volumes (clears database data)
```bash
docker-compose down -v
```

### View logs
```bash
docker-compose logs -f
```

### View specific service logs
```bash
docker-compose logs -f app
docker-compose logs -f postgres
```

### Rebuild the application
```bash
docker-compose up --build
```

## Environment Variables

You can customize the database configuration by modifying the environment variables in `docker-compose.yml`:

```yaml
environment:
  DB_URL: jdbc:postgresql://postgres:5432/shelftotalesdb
  DB_DRIVER: org.postgresql.Driver
  DB_USERNAME: shelftotales
  DB_PASSWORD: shelftotales_password
  DB_DIALECT: org.hibernate.dialect.PostgreSQLDialect
  H2_CONSOLE_ENABLED: false
```

## Running with PostgreSQL (Default)

The backend uses **PostgreSQL** in every non-test profile. The JDBC URL in `application.properties` defaults to `jdbc:postgresql://localhost:5432/shelftotalesdb`. H2 appears only in `src/test/resources/application.properties` (in-memory, `ddl-auto=create-drop`, Flyway disabled) so unit tests do not need a live database.

## Legacy: Running with H2

If a previous version of this project used an H2 default, that has been superseded. The current `application.properties` is wired to PostgreSQL; switching back to H2 would require overriding the datasource URL, driver, and JPA dialect in a custom `application-{profile}.properties` file.

## Troubleshooting

### Port already in use
If port 8080 or 5432 is already in use, modify the ports mapping in `docker-compose.yml`:
```yaml
ports:
  - "8081:8080"  # Change 8080 to 8081 or another available port
```

### Database connection issues
Check if PostgreSQL is healthy:
```bash
docker-compose ps
```

View PostgreSQL logs:
```bash
docker-compose logs postgres
```

### Clear all data and start fresh
```bash
docker-compose down -v
docker-compose up --build
```

## Production Considerations

For production deployment, consider:
1. Change default passwords in `docker-compose.yml`
2. Use environment variables or secrets management
3. Enable SSL/TLS for database connections
4. Add proper resource limits in docker-compose.yml
5. Use a managed database service (AWS RDS, Google Cloud SQL, etc.)
6. Configure proper backup strategies
