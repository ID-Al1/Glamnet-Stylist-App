# GlamNet

A talent marketplace for the South African beauty and fashion industry. Three distinct user roles — Client (direct bookings), Artist/Stylist (earn, manage availability), Brand (post campaigns, review applicants).

## Run & Operate

- **Run button** — starts both the API server (port 3000) and the web app (port 8080) in parallel
- `pnpm --filter @workspace/api-server run dev` — API server only (requires `PORT` + `DATABASE_URL`)
- `pnpm --filter @workspace/mockup-sandbox run dev` — web mockup only (mock data, no backend needed)
- `pnpm --filter @workspace/db run push` — push Drizzle schema changes to Postgres (dev only)
- `pnpm run typecheck` — full typecheck across all packages

## Required Secrets (Replit Secrets tab)

| Key | Description |
|-----|-------------|
| `DATABASE_URL` | PostgreSQL connection string — use the Replit Postgres database URL |
| `JWT_SECRET` | Secret for signing JWT tokens (any long random string) |

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- **API:** Express 5, port 8082 (external: 3000)
- **Web app:** Vite 7 + React 19 + Tailwind CSS 4, port 8080
- **DB:** PostgreSQL 16 + Drizzle ORM
- **Auth:** JWT (bcryptjs + jsonwebtoken)

## Where things live

| Path | Purpose |
|------|---------|
| `artifacts/api-server/src/` | Express API server |
| `artifacts/api-server/src/routes/` | All API route handlers |
| `artifacts/mockup-sandbox/src/` | React web UI (mock data) |
| `artifacts/mockup-sandbox/src/glamnet/data.ts` | Shared mock artist/job data |
| `lib/db/src/schema/` | Drizzle ORM table definitions |
| `lib/db/src/index.ts` | DB connection + schema re-exports |

## API Routes

All routes under `/api`:

- **Auth:** `POST /auth/signup`, `POST /auth/signin`, `GET /auth/me`, `PATCH /auth/me/availability`, `PATCH /auth/me/profile`
- **Jobs/Castings:** `GET /jobs`, `GET /jobs/mine`, `POST /jobs`, `POST /jobs/:id/apply`, `PATCH /jobs/:id/applications/:appId/status`
- **Talent:** `GET /talent`, `GET /talent/:id`
- **Bookings:** `POST /bookings`, `GET /bookings`, `PATCH /bookings/:id/status`
- **Messages:** `GET /messages/threads`, `POST /messages/threads`, `GET /messages/threads/:id/messages`, `POST /messages/threads/:id/messages`
- **Teams:** `GET /teams`, `GET /teams/mine`, `POST /teams`, `GET /teams/:id`, `POST /teams/:id/join`, `DELETE /teams/:id/leave`
- **Ratings:** `POST /ratings`, `GET /ratings/talent/:talentId`
- **Notifications:** `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`

## Architecture decisions

- **Three user roles, one DB:** `users.role` column (`client | stylist | brand`) gates tab visibility and API access. No separate tables per role.
- **Client→Artist is direct booking; Brand→Artist is job board:** Clients book (like an appointment), brands post campaigns and artists apply. Never mix these flows.
- **Mockup sandbox is independent:** `artifacts/mockup-sandbox/` runs on mock data with no backend. Good for UI iteration without touching the API.
- **pnpm workspaces:** `@workspace/db` is the shared DB package consumed by `@workspace/api-server`. Import paths use workspace aliases.
- **JWT in Authorization header:** `requireAuth` middleware reads `Bearer <token>`. No cookie-based sessions.

## DB Schema

Tables: `users`, `jobs`, `applications`, `conversations`, `messages`, `notifications`, `bookings`, `ratings`, `teams`, `team_members`, `portfolios`, `contracts`, `payments`, `referrals`, `subscriptions`, `verification`

## Design Tokens

| Token | Value | Use |
|-------|-------|-----|
| accent | `#B8765C` | Rose-gold CTA buttons (use sparingly) |
| sage | `#7C8B6F` | Success / available states |
| canvas | `#FAF7F4` | App background |
| charcoal | `#1C1A19` | Body text |
| taupe | `#E8E1DA` | Card borders, separators |

Headlines: Playfair Display (serif). Body: Inter (sans-serif).

## Gotchas

- `DATABASE_URL` must be set as a Replit Secret before the API server will start.
- `lib/db` has no build step — `tsc --noEmit` on the workspace root always shows ~9 `TS6305` errors from this package. These are pre-existing and expected; all other TS errors should be zero.
- The mockup sandbox (`artifacts/mockup-sandbox/`) auto-enables `@replit/vite-plugin-cartographer` when `REPL_ID` is set (i.e. when running inside Replit). This is intentional.
- pnpm `minimumReleaseAge: 1440` is active — any newly published npm package will be blocked for 24 h. Only `@replit/*` packages are excluded from this delay.
