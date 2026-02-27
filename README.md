# food-app

A simple Food App backend API built with **Node.js (Express)** and **SQLite**.

## Features
- CRUD endpoints for:
  - Users
  - Restaurants
  - Menu Items
  - Orders
- SQLite persistence (file-based DB)
- Request validation (Zod)
- Consistent error responses
- OpenAPI docs served at `/docs`

## Quickstart

### 1) Install deps
```bash
npm install
```

### 2) Initialize DB schema
```bash
npm run db:init
```

### 3) Seed sample data (optional)
```bash
npm run db:seed
```

### 4) Run the server
Dev:
```bash
npm run dev
```

Prod:
```bash
npm start
```

Server listens on `HOST`/`PORT` (see `.env`).

## API Documentation
- Swagger UI: `GET /docs`
- OpenAPI JSON: `GET /openapi.json`

## Notes
- Database file location: `data/app.db`
- This project uses SQLite for simplicity and local development.
"""
