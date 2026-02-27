# food-app backend

Node.js (Express) backend for a basic food app with SQLite persistence.

## Run

```bash
npm install
npm start
# or
npm run dev
```

Server binds to `HOST` / `PORT` (defaults are typically `0.0.0.0:3001` in this environment).

## API

Operational:
- `GET /health` – health check
- `GET /ready` – readiness check (verifies DB connectivity)
- `GET /` – API info

Food resources:
- `GET /api/menu-items`
- `POST /api/menu-items`
- `GET /api/menu-items/:id`
- `PUT /api/menu-items/:id`
- `DELETE /api/menu-items/:id`

Orders:
- `GET /api/orders`
- `POST /api/orders`
- `GET /api/orders/:id`
- `PATCH /api/orders/:id/status`
- `DELETE /api/orders/:id` (admin-like delete)

All endpoints return JSON.
- Menu items include: `name`, `description`, `priceCents`, `category`, `imageUrl`, `available`
- Orders include `items` with `{menuItemId, quantity}` and computed totals.
- Order statuses: `pending`, `confirmed`, `preparing`, `delivered`, `cancelled`
"""
