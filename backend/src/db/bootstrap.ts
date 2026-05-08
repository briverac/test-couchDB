import type { DocumentGetResponse, DocumentScope, ServerScope } from "nano";
import { couchStatus } from "../lib/couch-errors.js";

export const SAMPLE_VIEWS_DD = "_design/sample_views";

const SAMPLE_VIEWS_BODY = {
  views: {
    count_by_patient: {
      map: `function (doc) {
        var pid = doc.patientId;
        if (typeof pid === "string" && pid.length > 0) emit(pid, 1);
      }`,
      reduce: "_sum",
    },
    samples_by_patient: {
      map: `function (doc) {
        var pid = doc.patientId;
        if (typeof pid === "string" && pid.length > 0) emit(pid, doc._id);
      }`,
    },
  },
  language: "javascript",
} as const;

export function designBare(id: string): string {
  return id.startsWith("_design/") ? id.slice("_design/".length) : id;
}

export async function ensureDb(couch: ServerScope, name: string): Promise<void> {
  try {
    await couch.db.create(name);
  } catch (e: unknown) {
    const err = e as { statusCode?: number };
    if (err.statusCode !== 412) throw e;
  }
}

export async function ensureSampleViews(db: DocumentScope<unknown>): Promise<void> {
  try {
    const current = (await db.get(SAMPLE_VIEWS_DD)) as DocumentGetResponse & {
      views?: Record<string, unknown>;
    };
    await db.insert({
      ...current,
      ...SAMPLE_VIEWS_BODY,
    });
  } catch (e) {
    if (couchStatus(e) !== 404) throw e;
    await db.insert({
      _id: SAMPLE_VIEWS_DD,
      ...SAMPLE_VIEWS_BODY,
    });
  }
}
