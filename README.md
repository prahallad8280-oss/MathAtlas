# MathAtlas

MathAtlas is a full-stack Mathematical Blog + CSIR NET Question Bank platform built with:

- React + Vite frontend
- Express.js REST API
- PostgreSQL
- Prisma ORM
- KaTeX-powered math rendering
- Client-side PDF export for question/concept/counterexample pages

## What It Includes

- Public browsing without login
- Question bank with subject and year regrouping from one canonical dataset
- Detailed solutions hidden by default and shown on demand
- Theorem / definition / result pages
- Counterexample pages linked to related concepts
- Wiki-style internal links using `[[Title]]`
- Global search across questions, solutions, concepts, and counterexamples
- Responsive dashboard layout
- Admin / author studio with role-aware CRUD

## Project Structure

```text
apps/
  api/   Express + Prisma + PostgreSQL backend
  web/   React + Vite frontend
```

## Environment Setup

Create these files before running the app:

1. Root optional environment file: `.env`
2. API environment file: `apps/api/.env`
3. Web environment file: `apps/web/.env`

You can copy from:

- [apps/api/.env.example](/D:/MathAtlas/apps/api/.env.example)
- [apps/web/.env.example](/D:/MathAtlas/apps/web/.env.example)
- [.env.example](/D:/MathAtlas/.env.example)

`apps/api/.env` is the important one for Prisma migrations and seeding.

## Install

```bash
npm install
npm run prisma:generate
```

## Database Setup

### Option A: Start PostgreSQL with Docker Compose

If you have Docker Desktop installed, start the database with:

```bash
npm run db:up
```

This uses [docker-compose.yml](/D:/MathAtlas/docker-compose.yml) and starts PostgreSQL on `localhost:5432` with:

- user: `postgres`
- password: `postgres`
- database: `mathatlas`

Your `apps/api/.env` should match:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mathatlas"
```

You can inspect logs with:

```bash
npm run db:logs
```

Stop it with:

```bash
npm run db:down
```

### Option B: Use Your Existing PostgreSQL

Make sure PostgreSQL is running and `DATABASE_URL` points to a valid database, then run:

```bash
npm run prisma:migrate
npm run prisma:seed
```

Seeded demo users:

- Admin: `admin@mathatlas.dev` / `Admin@123`
- Author: `author@mathatlas.dev` / `Author@123`

## Development

Recommended full local startup flow:

```bash
npm run db:up
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Run both frontend and backend together:

```bash
npm run dev
```

Or separately:

```bash
npm run dev:api
npm run dev:web
```

## Production Build

```bash
npm run build
```

Backend entry: `apps/api/dist/server.js`

Frontend build output: `apps/web/dist`

## Cloudflare Pages

Cloudflare Pages should be used for the React frontend only in the current architecture.

MathAtlas still uses an Express.js backend with Prisma and PostgreSQL, so the API should be deployed separately on a Node-friendly platform such as Render, Railway, Fly.io, or a VPS. Then point the frontend to that API with `VITE_API_URL`.

Recommended Cloudflare Pages settings for this monorepo:

- Root directory: repository root
- Build command: `npm run build:web`
- Build output directory: `apps/web/dist`

Set this environment variable in Cloudflare Pages:

```env
VITE_API_URL=https://your-api-domain.example.com/api
```

The file [apps/web/public/_redirects](/D:/MathAtlas/apps/web/public/_redirects) is included so React Router routes resolve correctly on Cloudflare Pages.

## Cloudflare Workers Builds

If you connected this repository as a Cloudflare Worker build instead of a Pages project, the repository now includes [wrangler.jsonc](/D:/MathAtlas/wrangler.jsonc) at the root so `npx wrangler deploy` can deploy the built frontend from `apps/web/dist`.

Recommended Worker build settings:

- Root directory: repository root
- Build command: `npm run build:web`
- Deploy command: `npx wrangler deploy`

If your Worker should use a different name than `mathatlas`, update the `name` field in [wrangler.jsonc](/D:/MathAtlas/wrangler.jsonc).

## Key Routes

Frontend pages:

- `/questions`
- `/subjects`
- `/years`
- `/concepts`
- `/counterexamples`
- `/search`
- `/studio`

REST API:

- `GET /api/questions`
- `GET /api/questions/:slug`
- `POST /api/questions`
- `PUT /api/questions/:id`
- `DELETE /api/questions/:id`
- `GET /api/concepts`
- `GET /api/concepts/:slug`
- `GET /api/counterexamples`
- `GET /api/counterexamples/:slug`
- `GET /api/search?q=...`
- `POST /api/auth/login`

## Notes

- Write mathematical content in Markdown with LaTeX, for example `$T : X \\to Y$`.
- Internal knowledge links are written as `[[Closed Graph Theorem]]`.
- Counterexamples can be linked to related concepts from the studio.
- PDF export is available on each detail page.
