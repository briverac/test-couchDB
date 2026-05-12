import { describe, expect, it } from "vitest";
import type { PatientDoc } from "../types/models.js";
import type { SampleDocWrite } from "../types/models.js";
import { createInMemoryRepositories } from "./inMemoryRepos.js";

/**
 * In-memory mock matches Couch-style status codes for duplicates / stale rev.
 * API tests go through Express; here we assert the mock contract directly.
 */
describe("createInMemoryRepositories — 409 conflicts", () => {
  it("patient insert duplicate _id without _rev → 409", async () => {
    const { patientDb } = createInMemoryRepositories();
    await patientDb.insert({ _id: "custom-patient-1", fullName: "First" } as PatientDoc);
    await expect(
      patientDb.insert({ _id: "custom-patient-1", fullName: "Second" } as PatientDoc),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("patient insert with wrong _rev → 409", async () => {
    const { patientDb } = createInMemoryRepositories();
    await patientDb.insert({ _id: "p-rev", fullName: "A" } as PatientDoc);
    await expect(
      patientDb.insert({
        _id: "p-rev",
        _rev: "999-fake",
        fullName: "B",
      } as PatientDoc),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("patient destroy with wrong rev → 409", async () => {
    const { patientDb } = createInMemoryRepositories();
    const { rev } = await patientDb.insert({ _id: "p-del", fullName: "X" } as PatientDoc);
    expect(rev).toBeTruthy();
    await expect(patientDb.destroy("p-del", "wrong-rev")).rejects.toMatchObject({ statusCode: 409 });
  });

  it("sample insert duplicate _id without _rev → 409", async () => {
    const { sampleDb } = createInMemoryRepositories();
    await sampleDb.insert({
      _id: "custom-sample-1",
      patientId: "any",
      status: "pending",
    } as SampleDocWrite);
    await expect(
      sampleDb.insert({
        _id: "custom-sample-1",
        patientId: "any",
        status: "Done",
      } as SampleDocWrite),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("sample insert with stale _rev → 409", async () => {
    const { sampleDb } = createInMemoryRepositories();
    await sampleDb.insert({ _id: "s1", patientId: "p", status: "pending" } as SampleDocWrite);
    await expect(
      sampleDb.insert({
        _id: "s1",
        _rev: "0-fake",
        patientId: "p",
        status: "Done",
      } as SampleDocWrite),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("sample destroy with wrong rev → 409", async () => {
    const { sampleDb } = createInMemoryRepositories();
    await sampleDb.insert({ _id: "s-del", patientId: "p", status: "in Review" } as SampleDocWrite);
    await expect(sampleDb.destroy("s-del", "bad-rev")).rejects.toMatchObject({ statusCode: 409 });
  });
});
