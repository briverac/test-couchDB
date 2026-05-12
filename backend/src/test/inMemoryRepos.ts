import { randomUUID } from "node:crypto";
import type nano from "nano";
import type { Repositories } from "../db/context.js";
import type { PatientDoc } from "../types/models.js";
import type { SampleDocWrite } from "../types/models.js";

function couchErr(statusCode: number, reason?: string): Error & { statusCode: number; reason?: string } {
  const e = new Error(reason ?? `${statusCode}`) as Error & { statusCode: number; reason?: string };
  e.statusCode = statusCode;
  e.reason = reason;
  return e;
}

/** Tiny in-memory Couch — enough for API tests without network. */
export function createInMemoryRepositories(): Repositories {
  const patients = new Map<string, PatientDoc & { _rev: string }>();
  const samples = new Map<string, SampleDocWrite & { _rev: string }>();
  let seq = 1;
  const nextRev = () => `${seq++}-mock`;

  const patientDb = {
    async list(opts: { include_docs?: boolean }) {
      const rows = [...patients.values()].map((doc) => ({
        id: doc._id,
        key: doc._id,
        value: undefined,
        doc: opts.include_docs ? doc : undefined,
      }));
      return { total_rows: rows.length, offset: 0, rows };
    },
    async get(id: string) {
      const d = patients.get(id);
      if (!d) throw couchErr(404, "missing");
      return d;
    },
    async insert(doc: PatientDoc) {
      const id = doc._id ?? randomUUID();
      const cur = patients.get(id);
      if (doc._rev) {
        if (!cur || cur._rev !== doc._rev) throw couchErr(409);
        const merged: PatientDoc & { _rev: string } = { ...doc, _id: id, _rev: nextRev() };
        patients.set(id, merged);
        return { ok: true, id, rev: merged._rev };
      }
      if (cur) throw couchErr(409, "duplicate");
      const merged: PatientDoc & { _rev: string } = { ...doc, _id: id, fullName: doc.fullName, _rev: nextRev() };
      patients.set(id, merged);
      return { ok: true, id: merged._id, rev: merged._rev };
    },
    async destroy(id: string, rev: string) {
      const cur = patients.get(id);
      if (!cur) throw couchErr(404);
      if (cur._rev !== rev) throw couchErr(409);
      patients.delete(id);
      return { ok: true, id, rev };
    },
  };

  const sampleDb = {
    async list(opts: { include_docs?: boolean }) {
      const rows = [...samples.values()].map((doc) => ({
        id: doc._id,
        key: doc._id,
        value: undefined,
        doc: opts.include_docs ? doc : undefined,
      }));
      return { total_rows: rows.length, offset: 0, rows };
    },
    async get(id: string) {
      const d = samples.get(id);
      if (!d) throw couchErr(404);
      return d;
    },
    async insert(doc: SampleDocWrite) {
      const id = doc._id ?? randomUUID();
      const cur = samples.get(id);
      if (doc._rev) {
        if (!cur || cur._rev !== doc._rev) throw couchErr(409);
        const merged: SampleDocWrite & { _rev: string } = {
          _id: id,
          patientId: doc.patientId,
          status: doc.status,
          _rev: nextRev(),
        };
        samples.set(id, merged);
        return { ok: true, id, rev: merged._rev };
      }
      if (cur) throw couchErr(409);
      const merged: SampleDocWrite & { _rev: string } = {
        _id: id,
        patientId: doc.patientId,
        status: doc.status,
        _rev: nextRev(),
      };
      samples.set(id, merged);
      return { ok: true, id: merged._id, rev: merged._rev };
    },
    async destroy(id: string, rev: string) {
      const cur = samples.get(id);
      if (!cur) throw couchErr(404);
      if (cur._rev !== rev) throw couchErr(409);
      samples.delete(id);
      return { ok: true, id, rev };
    },
    async view(_ddoc: string, viewName: string, opts: { key?: string }) {
      if (viewName !== "samples_by_patient") {
        return { total_rows: 0, offset: 0, rows: [] };
      }
      const key = opts.key;
      const rows =
        key == null
          ? [...samples.values()]
              .filter((s) => s.patientId)
              .map((s) => ({ id: `${s.patientId}_${s._id}`, key: s.patientId, value: s._id }))
          : [...samples.values()]
              .filter((s) => s.patientId === key)
              .map((s) => ({ id: `${key}_${s._id}`, key, value: s._id }));
      return { total_rows: rows.length, offset: 0, rows };
    },
  };

  const couch = { db: { use: () => ({}) } } as unknown as nano.ServerScope;

  return {
    couch,
    patientDb: patientDb as unknown as Repositories["patientDb"],
    sampleDb: sampleDb as unknown as Repositories["sampleDb"],
  };
}
