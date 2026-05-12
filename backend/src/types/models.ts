import type { SampleStatus } from "../constants/sample-status.js";

/**
 * TS-only contracts; they do not validate `req.body` at runtime.
 * See `backend/docs/schemas-validation.md` (Zod vs these types).
 */
/** Patient document stored in CouchDB (`patient_profiles`). */
export type PatientDoc = {
  _id: string;
  _rev?: string;
  fullName: string;
  birthDate?: string;
  notes?: string;
};

/** Patient profile returned by the REST API. */
export type PatientProfile = {
  id: string;
  fullName: string;
  birthDate?: string;
  notes?: string;
  rev?: string;
};

/** Sample row for the API (patient name resolved when linked). */
export type MedicalSample = {
  id: string;
  patientId: string;
  patientName: string;
  status: SampleStatus;
  rev?: string;
};

/** Sample document shape as stored in CouchDB (current or legacy fields). */
export type SampleStored = {
  _id: string;
  _rev?: string;
  status: unknown;
  patientId?: unknown;
  patientName?: unknown;
};

/** Write payload for `medical_samples` (omit `_id` for server-assigned UUID). */
export type SampleDocWrite = {
  _id: string;
  _rev?: string;
  patientId: string;
  status: SampleStatus;
};
