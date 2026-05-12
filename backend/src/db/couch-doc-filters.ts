/** `_all_docs` / `db.list({ include_docs })` also returns `_design/` (and sometimes `_local/`) rows. */
export function isUserDataDoc(doc: unknown): doc is { _id: string } {
  if (!doc || typeof doc !== "object" || !("_id" in doc)) return false;
  const id = (doc as { _id: unknown })._id;
  if (typeof id !== "string") return false;
  if (id.startsWith("_design/")) return false;
  if (id.startsWith("_local/")) return false;
  return true;
}
