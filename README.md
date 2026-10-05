# Ravand — Persian-first portfolio template

A reusable, Persian-first (RTL) portfolio and blog with a React UI, FastAPI API, PostgreSQL storage, an editable admin panel, file uploads, and a Persian rich-text blog editor. The included Docker Compose setup starts the complete production-style stack.

## Run with Docker Compose

1. Copy `.env.example` to `.env` and set strong values for `POSTGRES_PASSWORD`, `ADMIN_PASSWORD`, and `JWT_SECRET`. For example, generate URL-safe random values with `openssl rand -hex 24` and `openssl rand -hex 32`.
2. Start the app:

   ```bash
   docker compose up --build -d
   ```

3. Open [http://localhost:8080](http://localhost:8080). The admin panel is at [http://localhost:8080/admin](http://localhost:8080/admin).
4. Sign in with `ADMIN_USERNAME` and `ADMIN_PASSWORD` from `.env` (defaults are `admin` / `change-me-now` only when no `.env` is supplied).

The API is available at `/api`; interactive API documentation is at [http://localhost:8080/api/docs](http://localhost:8080/api/docs). PostgreSQL data and uploaded files are stored in named Docker volumes. Back them up before removing the volumes. The initial profile and three Persian blog posts are seeded on the first start.

> **Production:** always change the example credentials and secret before deployment. Admin credentials are only seeded when the database is first created; changing `ADMIN_PASSWORD` after that does not reset the existing password. Use `docker compose down` to stop the stack. `docker compose down -v` also deletes the database and uploaded files.

## Configure the API URL

The frontend reads `API_URL` at container start, so it can be changed without rebuilding the React bundle. The default `/api` uses the included Nginx reverse proxy and is the recommended Compose setup. For a separately hosted API, set `API_URL=https://api.example.com/api` and configure that API's `CORS_ORIGINS` to include the website origin. When using Vite locally, `VITE_API_URL` can be set at build time; by default the dev server proxies `/api` and `/uploads` to `http://localhost:8000` (override with `API_PROXY_TARGET`).

## Local development

Start PostgreSQL (or set `DATABASE_URL` to your own PostgreSQL instance), then:

```bash
cd backend
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL='postgresql+psycopg://portfolio:password@localhost:5432/portfolio'
export ADMIN_USERNAME=admin ADMIN_PASSWORD='change-me-now' JWT_SECRET='local-development-secret'
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

In another terminal (Node.js 22 or newer):

```bash
cd frontend
npm install
npm run dev
```

Vite serves the app at `http://localhost:5173` and proxies API and upload requests to the local FastAPI server.

## Included features

- Responsive Persian-first portfolio landing page: profile, contact links, education, experience, skills, editable highlights, and a portfolio file slider.
- Configurable blog title and description, public post listing and post pages, draft/published states, categories, excerpts, reading time, and optional cover art.
- RTL admin dashboard for editing all landing-page sections and blog settings, managing file-slider items, and creating, editing, publishing, unpublishing, and deleting posts.
- Admin password changes from the dashboard, with a 12-character minimum for new passwords.
- Persian-oriented rich-text editing toolbar with headings, emphasis, lists, quotations, text alignment, links, undo, and redo. Post HTML is sanitized before storage and again before display.
- Authenticated admin API, hashed admin passwords, expiring signed access tokens, upload validation, and persistent PostgreSQL/upload volumes.
- Runtime-configurable API base URL and same-origin Nginx proxy for Compose deployments.

Uploaded assets accept PDF, common image formats, office documents, text/CSV, and ZIP files (maximum 25 MB each).
