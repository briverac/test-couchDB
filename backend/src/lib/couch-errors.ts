import type { Response } from "express";

/** Código HTTP que nano/CouchDB suele poner en errores. */
export function couchStatus(e: unknown): number | undefined {
  if (typeof e !== "object" || e === null) return undefined;
  const code = (e as { statusCode?: number }).statusCode;
  return typeof code === "number" ? code : undefined;
}

/** Respuesta JSON genérica ante fallos de Couch que no manejamos caso a caso. */
export function sendCouchError(res: Response, e: unknown): void {
  const status = couchStatus(e);
  const reason =
    typeof e === "object" && e !== null && "reason" in e && typeof (e as { reason: unknown }).reason === "string"
      ? (e as { reason: string }).reason
      : undefined;
  if (status === 409) {
    res.status(409).json({ error: "conflict", reason: reason ?? "Document update conflict." });
    return;
  }
  if (status === 404) {
    res.status(404).json({ error: "not_found", reason: reason ?? "Not found." });
    return;
  }
  console.error(e);
  res.status(500).json({ error: "internal_error" });
}
