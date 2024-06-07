# Ride Sharing Service

Backend service for a minimal ride-sharing platform. Riders request trips, the nearest
available driver is assigned, and the trip moves through a simple lifecycle.

## Stack

- Node.js and TypeScript (strict), Express
- PostgreSQL with Prisma
- Zod for request validation, JWT (jose) and bcryptjs for auth
- pino for logging, Vitest and Supertest for tests

## Getting started

```bash
cp .env.example .env
docker compose up -d        # PostgreSQL (also creates the roam_test database)
npm install
npm run db:migrate          # apply migrations
npm run dev
```

The server listens on `http://localhost:3000` by default.

## Scripts

| Script                | Purpose                                        |
| --------------------- | ---------------------------------------------- |
| `npm run dev`         | Run the API with ts-node                       |
| `npm run build`       | Compile to `dist/`                             |
| `npm start`           | Run the compiled server                        |
| `npm test`            | Run unit and integration tests (needs Postgres) |
| `npm run lint`        | ESLint                                         |
| `npm run format`      | Prettier                                       |
| `npm run db:migrate`  | Apply Prisma migrations                        |

## Configuration

| Variable                | Default | Description                              |
| ----------------------- | ------- | ---------------------------------------- |
| `PORT`                  | `3000`  | HTTP port                                |
| `DATABASE_URL`          | -       | PostgreSQL connection string (required)  |
| `JWT_SECRET`            | -       | Secret used to sign tokens (required)    |
| `JWT_EXPIRES_IN`        | `1d`    | Token lifetime                           |
| `FARE_BASE_CENTS`       | `250`   | Flat amount added to every fare          |
| `FARE_PER_KM_CENTS`     | `120`   | Price per kilometre                      |
| `FARE_MINIMUM_CENTS`    | `500`   | Lowest fare charged                      |
| `MATCH_RADIUS_KM`       | `10`    | How far from the pickup a driver can be  |

## How it works

1. A driver registers with their vehicle, reports a location, and goes online.
2. A rider asks for a fare estimate, then requests a ride.
3. The closest online driver within the match radius is reserved for the ride (status `BUSY`).
4. The driver accepts, starts and completes the ride. Either party can cancel before it starts.

Ride status: `REQUESTED` → `ACCEPTED` → `IN_PROGRESS` → `COMPLETED`, or `CANCELLED` from
`REQUESTED` / `ACCEPTED`. Money is stored as integer cents. Distance is great-circle (haversine).

## API

All `/api` routes except register and login need `Authorization: Bearer <token>`.
Errors look like `{ "error": { "code", "message", "details?" } }`.

### Auth

| Method | Path                 | Description                                                           |
| ------ | -------------------- | --------------------------------------------------------------------- |
| POST   | `/api/auth/register` | `{ email, password, name, role: RIDER \| DRIVER, vehicleModel?, vehiclePlate? }` (vehicle fields required for drivers) |
| POST   | `/api/auth/login`    | `{ email, password }` → `{ token, user }`                             |
| GET    | `/api/users/me`      | Current user                                                          |

### Drivers (role `DRIVER`)

| Method | Path                       | Description                                   |
| ------ | -------------------------- | --------------------------------------------- |
| GET    | `/api/drivers/me`          | Driver profile and current status             |
| PUT    | `/api/drivers/me/location` | `{ latitude, longitude }`                     |
| PUT    | `/api/drivers/me/status`   | `{ status: ONLINE \| OFFLINE }` (needs a location first) |

### Rides

| Method | Path                       | Role   | Description                                         |
| ------ | -------------------------- | ------ | --------------------------------------------------- |
| POST   | `/api/rides/estimate`      | RIDER  | `{ pickup, dropoff }` → distance and fare           |
| POST   | `/api/rides`               | RIDER  | Request a ride and get the nearest driver assigned  |
| GET    | `/api/rides`               | any    | Own rides. Query: `status`, `page`, `limit`         |
| GET    | `/api/rides/:id`           | any    | A ride you are part of                              |
| POST   | `/api/rides/:id/accept`    | DRIVER | Accept the assigned ride                            |
| POST   | `/api/rides/:id/start`     | DRIVER | Start an accepted ride                              |
| POST   | `/api/rides/:id/complete`  | DRIVER | Complete a ride in progress                         |
| POST   | `/api/rides/:id/cancel`    | any    | Cancel before the ride starts                       |

`pickup` and `dropoff` are `{ "latitude": number, "longitude": number }`.

### Health

- `GET /health` — liveness
- `GET /health/ready` — checks the database connection

## Out of scope

Payments, ratings, real-time push (clients poll ride status), surge pricing and admin tooling.
