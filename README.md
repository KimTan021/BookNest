# Online Bookstore

Full-stack online bookstore application with a Spring Boot REST API, JWT authentication, MySQL persistence, Flyway migrations, and a React + Vite frontend.

## Overview

This project provides a simple e-commerce flow for browsing books, viewing author details, registering and logging in, managing a shopping cart, and checking out orders.

The repository is split into two main parts:

- `src/`: Spring Boot backend
- `frontend/`: React frontend built with Vite and Material UI

## Features

- Public book catalog with pagination
- Book search by title
- Category-based filtering
- Book details page with stock and pricing
- Author details page with linked books
- User registration and login with JWT
- Protected cart operations
- Checkout flow and order history
- Swagger / OpenAPI documentation
- Database versioning with Flyway
- Backend unit, controller, and integration tests
- GitHub Actions CI for backend tests

## Tech Stack

### Backend

- Java 21
- Spring Boot 4
- Spring Web MVC
- Spring Data JPA
- Spring Security
- JWT (`jjwt`)
- Flyway
- MySQL
- H2 for tests
- springdoc OpenAPI / Swagger UI

### Frontend

- React 18
- TypeScript
- Vite
- Material UI
- React Router

## Project Structure

```text
onlinebookstore/
|- src/
|  |- main/
|  |  |- java/com/kimtan/onlinebookstore/
|  |  |- resources/
|  |     |- db/migration/
|  |     |- application.properties
|  |- test/
|- frontend/
|  |- src/
|  |- public/
|  |- package.json
|- .github/workflows/ci.yml
|- pom.xml
|- mvnw
|- mvnw.cmd
```

## Main User Flows

### Public

- Browse the catalog from the home page
- Filter books by category
- Search books by title
- Open a book details page
- Open an author details page

### Authenticated

- Register a new account
- Log in and receive a JWT token
- Add books to cart
- Update cart quantities
- Remove items or clear the cart
- Checkout the cart into an order
- Review order history

## Architecture

### Backend

The backend exposes REST endpoints under `/api`. Public endpoints are available for authentication, books, categories, and authors. Cart and order endpoints require a valid bearer token.

Important backend layers:

- `controller`: REST endpoints
- `service`: business logic
- `repository`: JPA data access
- `entity`: persistence models
- `dto`: API responses and auth payloads
- `security`: JWT parsing and authentication filter
- `config`: security, OpenAPI, and optional data seeding

### Frontend

The frontend is a standalone React app that talks to the backend through `/api`. During local development, Vite proxies `/api` requests to `http://localhost:8082`.

Key frontend areas:

- `features/books`: catalog and book details
- `features/auth`: login and registration
- `features/cart`: cart management
- `features/orders`: order history
- `features/authors`: author details
- `state/AuthContext.tsx`: token persistence and auth state
- `lib/api.ts`: API client functions

## Database

The application uses MySQL in local development.

Flyway migrations are stored in `src/main/resources/db/migration` and include:

- schema creation
- seed catalog data
- author bio population
- duplicate cleanup and uniqueness constraints

The catalog includes seeded categories, authors, and roughly 40 books through Flyway. There is also an optional application seeder controlled by `app.seed.enabled`.

## Prerequisites

Install the following before running the project:

- Java 21
- Node.js 18+ or 20+
- npm
- MySQL 8+

## Environment Configuration

The backend reads these values from `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/onlinebookstoreDB
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
server.port=8082

app.jwt.secret=${JWT_SECRET}
app.jwt.expiration-ms=${JWT_EXPIRATION_MS:3600000}
app.cors.allowed-origin-patterns=${CORS_ALLOWED_ORIGIN_PATTERNS:http://localhost:*,http://127.0.0.1:*}
app.seed.enabled=false
```

Required local environment variables:

```powershell
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_mysql_password"
$env:JWT_SECRET="your-very-long-jwt-secret-at-least-32-bytes"
```

The application will fail to start if any of these are missing.

### .env Alternative (Recommended)

The backend will also load a local `.env` file at the project root. This file is ignored by Git and keeps secrets out of source control.

1. Copy the example file:

```powershell
Copy-Item .env.example .env
```

2. Fill in values inside `.env`:

```properties
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=your-very-long-jwt-secret-at-least-32-bytes
```

## Local Setup

### 1. Create the MySQL database

```sql
CREATE DATABASE onlinebookstoreDB;
```

### 2. Start the backend

From the project root:

```powershell
.\mvnw spring-boot:run
```

The backend starts on:

```text
http://localhost:8082
```

Swagger UI:

```text
http://localhost:8082/swagger-ui.html
```

OpenAPI JSON:

```text
http://localhost:8082/api-docs
```

### 3. Start the frontend

In a separate terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend starts on:

```text
http://localhost:5173
```

Because Vite proxies `/api`, the frontend can call the backend without changing the API base URL during local development.

## Build Commands

### Backend

Run tests:

```powershell
.\mvnw test
```

Build the jar:

```powershell
.\mvnw clean package
```

### Frontend

Install dependencies:

```powershell
cd frontend
npm install
```

Run development server:

```powershell
npm run dev
```

Create production build:

```powershell
npm run build
```

Preview production build:

```powershell
npm run preview
```

## API Summary

### Public Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/books`
- `GET /api/books/{id}`
- `GET /api/books/search`
- `GET /api/categories`
- `GET /api/authors/{id}`

### Protected Endpoints

- `GET /api/cart`
- `POST /api/cart/add`
- `PUT /api/cart/update`
- `DELETE /api/cart/remove`
- `DELETE /api/cart/clear`
- `POST /api/orders/checkout`
- `GET /api/orders/history`

Use the JWT returned by login or registration in the `Authorization` header:

```text
Authorization: Bearer <token>
```

## Testing

Backend tests use H2 in-memory database with MySQL compatibility mode through `src/test/resources/application-test.properties`.

Current test coverage includes:

- service tests
- controller tests
- auth integration test

GitHub Actions also runs backend tests on pushes and pull requests to `main`.

## Default Local Ports

- Backend: `8082`
- Frontend: `5173`
- MySQL: `3306`

## Future Improvements

- Admin dashboard for inventory management
- Payment gateway integration
- Wishlist and favorites
- User profile management
- Search by author and category together
- Better image hosting instead of placeholder/seeded URLs
- Frontend automated tests
- Dockerized local setup

## License

No license has been added to this repository yet. If you plan to make the project public on GitHub, add a `LICENSE` file so usage terms are clear.
