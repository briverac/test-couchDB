import { getRepos } from "../db/context.js";
import { couchStatus } from "../lib/couch-errors.js";
import { withSampleViewsRetry } from "../lib/couch-sample-views.js";
import { patientDocToProfile } from "../mappers/patients.mapper.js";
import type { PatientDoc, PatientProfile } from "../types/models.js";

export async function listPatientsSorted(): Promise<PatientProfile[]> {
  const { patientDb } = getRepos();
  const result = await patientDb.list({ include_docs: true });
  const patients = result.rows
    .map((row) => row.doc)
    .filter((doc) => Boolean(doc))
    .map((doc) => patientDocToProfile(doc as PatientDoc));
  patients.sort((a, b) => a.fullName.localeCompare(b.fullName, "es"));
  return patients;
}

export async function getPatientById(id: string): Promise<PatientProfile | null> {
  const { patientDb } = getRepos();
  try {
    const doc = await patientDb.get(id);
    return patientDocToProfile(doc);
  } catch (e) {
    if (couchStatus(e) === 404) return null;
    throw e;
  }
}

export async function patientExists(patientId: string): Promise<boolean> {
  return (await getPatientById(patientId)) != null;
}

async function sampleCountForPatient(patientId: string): Promise<number> {
  const { sampleDb } = getRepos();
  const raw = await withSampleViewsRetry(() =>
    sampleDb.view("sample_views", "samples_by_patient", { key: patientId }),
  );
  return raw.rows.length;
}

export class PatientHasSamplesError extends Error {
  readonly count: number;
  constructor(count: number) {
    super("has_samples");
    this.name = "PatientHasSamplesError";
    this.count = count;
  }
}

export async function deletePatient(id: string): Promise<void> {
  const n = await sampleCountForPatient(id);
  if (n > 0) throw new PatientHasSamplesError(n);
  const { patientDb } = getRepos();
  const doc = await patientDb.get(id);
  const rev = doc._rev;
  if (!rev) throw new Error("missing _rev");
  await patientDb.destroy(id, rev);
}

export async function createPatient(input: {
  customId?: string;
  fullName: string;
  birthDate?: string;
  notes?: string;
}): Promise<{ id: string; rev: string }> {
  const { patientDb } = getRepos();
  const { customId, fullName, birthDate, notes } = input;
  const baseFields = {
    fullName,
    ...(birthDate ? { birthDate } : {}),
    ...(notes ? { notes } : {}),
  };
  const doc = customId
    ? ({ _id: customId, ...baseFields } as PatientDoc)
    : ({ ...baseFields } as Omit<PatientDoc, "_id">);
  const saved = await patientDb.insert(doc as PatientDoc);
  return { id: saved.id, rev: saved.rev };
}

export async function updatePatient(
  id: string,
  body: Partial<Pick<PatientProfile, "fullName" | "birthDate" | "notes">>,
): Promise<{ id: string; rev: string }> {
  const { patientDb } = getRepos();
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  if (!fullName) {
    throw new ValidationError("fullName es obligatorio.");
  }
  const current = await patientDb.get(id);
  const next: PatientDoc = {
    _id: id,
    _rev: current._rev,
    fullName,
  };
  if (body.birthDate !== undefined) {
    const b = String(body.birthDate).trim();
    if (b) next.birthDate = b;
  } else if (current.birthDate) {
    next.birthDate = current.birthDate;
  }
  if (body.notes !== undefined) {
    const n = String(body.notes).trim();
    if (n) next.notes = n;
  } else if (current.notes) {
    next.notes = current.notes;
  }
  const saved = await patientDb.insert(next);
  return { id: saved.id, rev: saved.rev };
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
