import type { DocumentScope } from "nano";
import { ensureSampleViews } from "../db/bootstrap.js";
import { getRepos } from "../db/context.js";
import { couchStatus } from "./couch-errors.js";

/** Tras volumen Couch nuevo o sin `_design/sample_views`, la primera query devuelve 404; re-aseguramos y reintentamos. */
export async function withSampleViewsRetry<T>(query: () => Promise<T>): Promise<T> {
  try {
    return await query();
  } catch (e) {
    if (couchStatus(e) !== 404) throw e;
    const { sampleDb } = getRepos();
    await ensureSampleViews(sampleDb as DocumentScope<unknown>);
    return await query();
  }
}
