# ShelfToTales

ShelfToTales is a full-stack web application designed for book lovers. It features a modern, responsive React frontend integrated with a robust Spring Boot backend, providing a complete platform for browsing, managing, and exploring books.

## Features

- **User Authentication:** Secure registration and login using JWT (JSON Web Tokens).
- **Book Catalog:** Browse books, view details, and filter by categories.
- **Wishlist Management:** Authenticated users can add books to their personal wishlist and manage their saved items.
- **Shopping Cart:** Add books to a cart and proceed to checkout (Orders API structure included).
- **Responsive Design:** A polished, enterprise-ready React frontend ensuring a seamless experience across devices.

## Tech Stack

### Frontend
- **React 18:** Modern UI development.
- **React Router:** For client-side routing.
- **Axios:** For making HTTP requests to the backend.
- **Bootstrap / React-Bootstrap:** For styling and responsive layout.
- **SweetAlert2:** For elegant user notifications.

### Backend
- **Java 17:** Core programming language.
- **Spring Boot 3.4.0:** Framework for building the RESTful API.
- **Spring Security:** For handling authentication and authorization.
- **Spring Data JPA / Hibernate:** For database operations and ORM.
- **H2 Database (In-Memory):** Default database for development and testing (easily swappable to PostgreSQL).
- **Lombok:** To reduce boilerplate code.
- **JWT (io.jsonwebtoken):** For secure, stateless API authentication.

## Project Structure

The repository is divided into two main directories:

- `frontend/`: Contains the React application.
- `backend/shelfToTales/`: Contains the Spring Boot application.

## Getting Started

### Prerequisites
- Node.js and npm (for the frontend)
- Java 17 (for the backend)
- Maven (included via wrapper in the backend)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend/shelfToTales
   ```
2. Build the project:
   ```bash
   mvn clean compile
   ```
3. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
The backend server will start on `http://localhost:8080`.

*(Note: The application uses an in-memory H2 database by default. You can access the H2 console at `http://localhost:8080/h2-console` using the JDBC URL `jdbc:h2:mem:shelftotalesdb`, username `sa`, and password `password`.)*

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *(or `npm start`)*

The React application will open in your default browser, typically at `http://localhost:3000`.

## API Endpoints Overview

- **Auth (`/api/auth`)**: `/login`, `/register`
- **Books (`/api/books`)**: `GET /`, `GET /{id}`, `GET /category/{categoryId}`, `GET /search`
- **Categories (`/api/categories`)**: `GET /`
- **Wishlist (`/api/wishlist`)**: `GET /`, `POST /{bookId}`, `DELETE /{bookId}` (Requires Auth)

## Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## License

This project is licensed under the ISC License.
