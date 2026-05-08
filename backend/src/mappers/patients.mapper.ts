import type { PatientDoc, PatientProfile } from "../types/models.js";

export function patientDocToProfile(doc: PatientDoc): PatientProfile {
  const p: PatientProfile = {
    id: doc._id,
    fullName: String(doc.fullName ?? ""),
    birthDate: doc.birthDate ? String(doc.birthDate) : undefined,
    notes: doc.notes ? String(doc.notes) : undefined,
  };
  if (doc._rev) p.rev = doc._rev;
  return p;
}
