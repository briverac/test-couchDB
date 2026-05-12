import { normalizeSampleStatus, type SampleStatus } from "../constants/sample-status.js";
import { isUserDataDoc } from "../db/couch-doc-filters.js";
import { getRepos } from "../db/context.js";
import { couchStatus } from "../lib/couch-errors.js";
import { patientExists } from "./patients.service.js";
import type { MedicalSample, SampleDocWrite, SampleStored } from "../types/models.js";

async function resolvePatientDisplayName(doc: SampleStored): Promise<{ patientId: string; patientName: string }> {
  const { patientDb } = getRepos();
  const rawId = doc.patientId != null ? String(doc.patientId) : "";
  if (rawId) {
    try {
      const p = await patientDb.get(rawId);
      return { patientId: rawId, patientName: p.fullName };
    } catch (e) {
      if (couchStatus(e) === 404) {
        return { patientId: rawId, patientName: "(patient profile not found)" };
      }
      throw e;
    }
  }
  const legacy = doc.patientName != null ? String(doc.patientName) : "";
  return { patientId: "", patientName: legacy ? `${legacy} (no profile)` : "" };
}

async function hydrateSample(doc: SampleStored): Promise<MedicalSample> {
  const { patientId, patientName } = await resolvePatientDisplayName(doc);
  const sample: MedicalSample = {
    id: doc._id,
    patientId,
    patientName,
    status: normalizeSampleStatus(doc.status),
  };
  if (doc._rev) sample.rev = doc._rev;
  return sample;
}

export async function listSamples(): Promise<MedicalSample[]> {
  const { sampleDb } = getRepos();
  const result = await sampleDb.list({ include_docs: true });
  return Promise.all(
    result.rows
      .map((row) => row.doc)
      .filter(isUserDataDoc)
      .map((doc) => hydrateSample(doc as SampleStored)),
  );
}

export async function getSampleById(id: string): Promise<MedicalSample | null> {
  const { sampleDb } = getRepos();
  try {
    const doc = await sampleDb.get(id);
    return hydrateSample(doc as SampleStored);
  } catch (e) {
    if (couchStatus(e) === 404) return null;
    throw e;
  }
}

export async function createSample(input: {
  customId?: string;
  patientId: string;
  status: SampleStatus;
}): Promise<{ id: string; rev: string }> {
  const { sampleDb } = getRepos();
  const pid = input.patientId.trim();
  if (!(await patientExists(pid))) {
    throw new UnknownPatientError();
  }
  const doc = input.customId
    ? ({ _id: input.customId, patientId: pid, status: input.status } satisfies SampleDocWrite)
    : ({ patientId: pid, status: input.status } as Omit<SampleDocWrite, "_id">);
  const saved = await sampleDb.insert(doc as SampleDocWrite);
  return { id: saved.id, rev: saved.rev };
}

export class UnknownPatientError extends Error {
  constructor() {
    super("unknown_patient");
    this.name = "UnknownPatientError";
  }
}

export async function updateSample(
  sampleId: string,
  input: { patientId: string; status: SampleStatus },
): Promise<{ id: string; rev: string }> {
  const { sampleDb } = getRepos();
  const pid = input.patientId.trim();
  if (!(await patientExists(pid))) {
    throw new UnknownPatientError();
  }
  const current = await sampleDb.get(sampleId);
  const doc: SampleDocWrite = {
    _id: sampleId,
    _rev: current._rev,
    patientId: pid,
    status: input.status,
  };
  const saved = await sampleDb.insert(doc);
  return { id: saved.id, rev: saved.rev };
}

export async function deleteSample(sampleId: string): Promise<void> {
  const { sampleDb } = getRepos();
  const doc = await sampleDb.get(sampleId);
  const rev = doc._rev;
  if (!rev) throw new Error("missing _rev");
  await sampleDb.destroy(sampleId, rev);
}
