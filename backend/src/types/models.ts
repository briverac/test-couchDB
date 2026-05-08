/** Perfil persistido en CouchDB (`patient_profiles`). */
export type PatientDoc = {
  _id: string;
  _rev?: string;
  fullName: string;
  birthDate?: string;
  notes?: string;
};

/** Perfil expuesto por la API REST. */
export type PatientProfile = {
  id: string;
  fullName: string;
  birthDate?: string;
  notes?: string;
  rev?: string;
};

/** Muestra para la API (nombre de paciente resuelto cuando aplica). */
export type MedicalSample = {
  id: string;
  patientId: string;
  patientName: string;
  status: string;
  rev?: string;
};

/** Documento de muestra como puede estar en CouchDB (actual o legacy). */
export type SampleStored = {
  _id: string;
  _rev?: string;
  status: unknown;
  patientId?: unknown;
  patientName?: unknown;
};

/** Payload de escritura en `medical_samples` (puede omitir _id para UUID automático). */
export type SampleDocWrite = {
  _id: string;
  _rev?: string;
  patientId: string;
  status: string;
};
