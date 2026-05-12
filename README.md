# test-couchDB

Small full-stack demo: **React + TypeScript** UI, **Node (Express) + TypeScript** API, and **Apache CouchDB** for document storage. It models **patient profiles** and **medical samples** linked to patients, with a read-only **report** backed by a CouchDB view.

## Stack

| Layer | Technology |
|--------|------------|
| UI | React 19, TypeScript, Vite, React Router |
| API | Express 4, Zod (request bodies), `nano` (CouchDB) |
| Data | CouchDB 3.x, two databases + one design document with map/reduce views |
| Tests | Vitest, supertest, in-memory Couch-style repositories |

## Prerequisites

- **Node.js** (LTS recommended) and npm  
- **Docker** (optional, for running CouchDB locally)

## Quick start

1. **CouchDB** — from the repo root:

   ```bash
   docker compose up -d
   ```

   Default in `backend/src/config.ts` assumes `http://admin:password@127.0.0.1:5984` and databases `medical_samples` and `patient_profiles` (overridable via env, see below).

2. **Install dependencies** (npm workspaces: `backend` + `frontend`):

   ```bash
   npm install
   ```

3. **Run API + web** together:

   ```bash
   npm run dev
   ```

   - API: `http://localhost:3000`  
   - UI: `http://localhost:5173` — the Vite dev server proxies **`/api`** to the API and strips the `/api` prefix.

   Or run workspaces separately: `npm run dev:api` and `npm run dev:ui`.

4. **Production builds**

   ```bash
   npm run build
   ```

## Environment variables (backend)

| Variable | Default | Purpose |
|----------|---------|---------|
| `COUCH_URL` | `http://admin:password@127.0.0.1:5984` | CouchDB base URL (with credentials if required) |
| `SAMPLES_DB` | `medical_samples` | Database name for sample documents |
| `PATIENTS_DB` | `patient_profiles` | Database name for patient documents |
| `PORT` | `3000` | HTTP port for the Express app |

On startup the API ensures the databases exist and installs/updates the **sample views** design document used by reports.

## HTTP API (high level)

Base URL in dev when using the UI: **`/api`** (proxied to Express without `/api`).

| Method | Path | Description |
|--------|------|-------------|
| `GET` / `POST` | `/patients`, `/patients/:id` | List, create, get one, update, delete patients |
| `GET` / `POST` / `PUT` / `DELETE` | `/samples`, `/samples/:id` | List, create, get one, update, delete samples |
| `GET` | `/reports/samples-by-patient` | Aggregated sample counts per patient (CouchDB view) |
| `GET` | `/reports/samples-by-patient/:patientId` | Sample document ids for a patient (view query) |

Request bodies for creates/updates are validated with **Zod**; invalid payloads return **400** with `validation_error`. Sample **`status`** is restricted to: `pending`, `in Review`, `Done`.

More detail: `backend/docs/schemas-validation.md`.

## Tests

```bash
npm test
```

Runs **Vitest** in the backend workspace (API tests against `createApp()` with in-memory repositories, plus small Couch-style conflict tests).

## Repository layout

```
test-couchDB/
├── package.json          # workspaces + dev script (api + web)
├── docker-compose.yml    # CouchDB only
├── backend/
│   ├── src/
│   │   ├── controllers/  # HTTP handlers
│   │   ├── services/     # domain + nano access
│   │   ├── routes/
│   │   ├── validation/   # Zod schemas
│   │   ├── db/           # Couch connection, bootstrap / views
│   │   └── ...
│   └── docs/
└── frontend/
    └── src/              # pages, components, API client
```

## License

Private project (`"private": true` in `package.json`).
