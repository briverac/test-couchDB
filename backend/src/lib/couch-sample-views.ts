import type { DocumentScope } from "nano";
import { ensureSampleViews } from "../db/bootstrap.js";
import { getRepos } from "../db/context.js";
import { couchStatus } from "./couch-errors.js";

/** If `_design/sample_views` is missing, first view query 404s; ensure design doc then retry once. */
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
