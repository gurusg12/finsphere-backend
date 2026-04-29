# FinSphere Backend (Express + MongoDB)

Production-ready REST API for the FinSphere micro-finance management app.

## Stack
- **Express 4** + `express-async-errors`
- **MongoDB / Mongoose 8**
- **JWT** auth (httpOnly cookie + `Authorization: Bearer <token>`)
- **bcryptjs** password hashing
- **zod** request validation
- **helmet**, **cors**, **express-rate-limit**, **compression**, **morgan**

## Quick start

```bash
cp .env.example .env
# Edit MONGODB_URI and JWT_SECRET
npm install
npm run dev          # starts http://localhost:4000
npm run seed         # optional: creates default admin + master data
```

## Default admin (after seed)
```
email:    admin@finsphere.local
password: admin123
```
> Change this password immediately in production.

If you do not run the seed, the **first** user created via `POST /api/auth/register`
will automatically be promoted to `admin`.

## API surface

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | /api/auth/register | public | First user → admin |
| POST | /api/auth/login | public | Returns user + sets cookie |
| POST | /api/auth/logout | any | Clears cookie |
| GET  | /api/auth/session | any | Current user or `null` |
| GET/POST | /api/customers | user | Agents see only their assigned customers |
| GET/PUT/DELETE | /api/customers/:id | user / admin (DELETE) | |
| GET/POST | /api/accounts | user | Agents see only their assigned accounts |
| GET/PUT/DELETE | /api/accounts/:id | admin (mutations) | |
| GET/POST/DELETE | /api/groups | admin (mutations) | |
| GET/POST/DELETE | /api/account-types | admin (mutations) | |
| GET/POST/DELETE | /api/ledgers | admin (mutations) | |
| GET/POST | /api/transactions | user | Double-entry, balance updates |
| DELETE | /api/transactions/:id | admin | Reverses balances |
| GET/POST/PUT/DELETE | /api/agents | admin | Lists agents with cash holding |
| GET/POST | /api/handovers | admin | |
| GET/PUT | /api/settings | user / admin | Org name, currency, footer |
| GET | /api/reports/daybook | user | `?from=&to=` |
| GET | /api/reports/balance-book | user | |
| GET | /api/reports/ledger | user | `?account=&from=&to=` |
| GET | /api/reports/loans | user | |
| GET | /api/reports/pl | user | `?from=&to=` |
| GET | /api/reports/balance-sheet | admin | |

## Production
- Set `NODE_ENV=production`, strong `JWT_SECRET`, restrict `CORS_ORIGIN`.
- Run behind HTTPS / reverse proxy. Cookies are `secure` automatically in production.
- Use `npm start` (or pm2/systemd).

## Folder structure
```
src/
  config/        env, db, logger
  models/        User, Customer, Account, Transaction, ...
  middleware/    auth, error, validate, rateLimit
  routes/        Express routers per resource
  controllers/   route handlers
  utils/         txLogic, asyncHandler, ApiError
  validators/    zod schemas
  scripts/       seed.js
  app.js         Express app composition
  server.js      HTTP entrypoint
```
