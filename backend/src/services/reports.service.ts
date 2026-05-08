import { getRepos } from "../db/context.js";
import { couchStatus } from "../lib/couch-errors.js";
import { withSampleViewsRetry } from "../lib/couch-sample-views.js";

export async function getSamplesByPatientReport(): Promise<{
  stats: { patientId: string; patientName: string; count: number }[];
  view: string;
  note: string;
}> {
  const { sampleDb, patientDb } = getRepos();
  const raw = await withSampleViewsRetry(() =>
    sampleDb.view("sample_views", "count_by_patient", { group: true }),
  );
  const stats = await Promise.all(
    raw.rows.map(async (row) => {
      const patientId = typeof row.key === "string" ? row.key : JSON.stringify(row.key);
      const count = typeof row.value === "number" ? row.value : Number(row.value);
      let patientName = "(perfil no encontrado)";
      try {
        const p = await patientDb.get(patientId);
        patientName = p.fullName;
      } catch (e) {
        if (couchStatus(e) !== 404) throw e;
      }
      return { patientId, patientName, count };
    }),
  );
  stats.sort((a, b) => a.patientName.localeCompare(b.patientName, "es", { sensitivity: "base" }));
  return {
    stats,
    view: "sample_views/count_by_patient",
    note: "conteo en CouchDB por MapReduce; nombre de paciente enriquecido en Node",
  };
}

export async function getSampleIdsForPatient(patientId: string): Promise<string[]> {
  const { sampleDb } = getRepos();
  const raw = await withSampleViewsRetry(() =>
    sampleDb.view("sample_views", "samples_by_patient", { key: patientId }),
  );
  return raw.rows.map((row) => String(row.value));
}
