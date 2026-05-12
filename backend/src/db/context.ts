import nano from "nano";
import type { DocumentScope } from "nano";
import { config } from "../config.js";
import type { PatientDoc } from "../types/models.js";
import type { SampleDocWrite } from "../types/models.js";
import { designBare, ensureDb, ensureSampleViews, SAMPLE_VIEWS_DD } from "./bootstrap.js";

export type Repositories = {
  couch: nano.ServerScope;
  patientDb: nano.DocumentScope<PatientDoc>;
  sampleDb: nano.DocumentScope<SampleDocWrite>;
};

let repos: Repositories | null = null;

/** In-memory Couch substitute (tests only). Must stay `null` in production. */
let testRepos: Repositories | null = null;

export function setTestRepositories(override: Repositories | null): void {
  testRepos = override;
}

export async function connectRepositories(): Promise<Repositories> {
  if (testRepos) return testRepos;
  const couch = nano(config.couchUrl);
  await ensureDb(couch, config.samplesDb);
  await ensureDb(couch, config.patientsDb);
  const patientDb = couch.db.use<PatientDoc>(config.patientsDb);
  const sampleDb = couch.db.use<SampleDocWrite>(config.samplesDb);
  await ensureSampleViews(sampleDb as DocumentScope<unknown>);
  repos = { couch, patientDb, sampleDb };
  return repos;
}

export function getRepos(): Repositories {
  if (testRepos) return testRepos;
  if (!repos) throw new Error("Repositories not initialized — call connectRepositories() first.");
  return repos;
}

export function bootstrapLogHint(): string {
  return `${config.samplesDb}, ${config.patientsDb} (+ views ${designBare(SAMPLE_VIEWS_DD)})`;
}
