/** Variables de entorno centralizadas (en prod vendrían de dotenv / secrets). */

export const config = {
  couchUrl: process.env.COUCH_URL ?? "http://admin:password@127.0.0.1:5984",
  samplesDb: process.env.SAMPLES_DB ?? "medical_samples",
  patientsDb: process.env.PATIENTS_DB ?? "patient_profiles",
  port: Number(process.env.PORT) || 3000,
} as const;
