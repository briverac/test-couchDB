# TypeScript types (`types/models.ts`) vs runtime validation schemas

## TS types (what you have in `models.ts`)

- Describe data shapes for the **compiler** and IDE.
- They do **not** validate `req.body` at runtime: a client can send anything over HTTP.
- If the client omits `fullName` or sends wrong types, **TypeScript alone does not stop it** — validate before (or when) you enter the service layer.

## Runtime validation schemas (implemented here with **Zod**)

- Executable definitions (**Zod**, Joi, JSON Schema, etc.) that **parse/check** the body or query and return explicit **400** responses when the contract fails.
- Typical pattern: in the **controller** or Express **middleware** after `express.json()`, before the service.
- **`src/validation/request-schemas.ts`** — `z.object({ ... })`: **`.min(1)` after `.trim()`** = required and not whitespace-only; **`.optional()`** = the field may be absent from the JSON.
- Sample **`status`** (create/update sample) is a **closed enum**: `pending`, `in Review`, `Done` (exact strings).
- **`src/lib/parse-json-body.ts`** — `safeParse`; on failure → **400** `{ error: "validation_error", message, issues }`.
- **Controllers** call `parseBodyOr400(schema, req.body, res)` and only call the service when `parsed` is defined.

Equivalent patterns elsewhere: **per-route middleware**, or **OpenAPI → generated validators**.

## Why keep both?

- **Types (`models.ts`):** ergonomics for authors and internal TS contracts.
- **Schema:** contract against **real malformed HTTP requests** — important for teams and for any client that is not only your SPA.

## Other styles

- **REST** without an explicit schema: the contract sometimes lives only in docs or tribal knowledge; OpenAPI can document it.
- **GraphQL:** schemas live in SDL on the server; errors often use **`errors`** in the body with HTTP **200**.
- **CouchDB** also has **logical** product schemas (`patientId`, `status`) but Couch does not automatically validate document shape on `insert`; the **app** enforces it.
