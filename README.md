# Railways Reservation Demo

A small, runnable railway reservation demo built with Node.js, Express, plain HTML/CSS/JavaScript, and a local JSON file. It includes train search, account registration/login, booking creation, booking history, and cancellation.

> This is a learning/demo app. Schedules, availability, and fares are sample data; bookings are stored on the server's local disk. No payment is taken, and this is not connected to Indian Railways or a live reservation system. Do not use it to store real customer data or as a production ticketing service.

## Requirements

- Node.js 18 or newer
- npm

MongoDB and payment credentials are not required. The server creates `data/railways.json` with sample train schedules on first start. The `data/` directory is ignored by Git.

## Run locally

```bash
git clone https://github.com/sanjaykumar7539/Railways.git
cd Railways
npm install
cp .env.example .env
npm run dev
```

Open <http://localhost:5000>. On Windows, create `.env` by copying `.env.example` in File Explorer or use `Copy-Item .env.example .env` in PowerShell. `npm start` starts the same server without auto-reload.

Register an account in the app (password must be at least 8 characters), search a route, and confirm a demo booking. Account passwords are hashed with bcrypt; the browser receives a short-lived JWT. The demo booking workflow does not request or process payment.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Server health check |
| POST | `/api/auth/register` | Register `{ "name", "email", "password" }` |
| POST | `/api/auth/login` | Login `{ "email", "password" }` |
| GET | `/api/trains?from=Chennai&to=Bengaluru&date=YYYY-MM-DD&passengers=1&travelClass=SL` | Search sample schedules |
| GET | `/api/bookings` | List the signed-in user's bookings (Bearer token required) |
| POST | `/api/bookings` | Create a demo booking (Bearer token required) |
| DELETE | `/api/bookings/:id` | Cancel the signed-in user's booking (Bearer token required) |

Train searches currently support the direct sample routes seeded in `server.js`. Class codes: `1A`, `2A`, `3A`, `SL`. The local JSON store is intended for single-process development only; it is not safe for concurrent/multi-instance production deployments.

## Configuration

Copy `.env.example` to `.env`. For a public deployment, set `NODE_ENV=production` and provide a long, unique `JWT_SECRET`. `PORT` defaults to 5000. `DATA_DIR` can point at a persistent writable directory. Keep `.env` and `data/railways.json` private and backed up appropriately.

## Verify

```bash
npm test
```

## Project layout

```text
server.js                 Express API and JSON-file persistence
public/index.html          Responsive browser interface
public/js/script.js        Search, login, booking, and cancellation flows
public/css/style.css       Existing stylesheet
```
