import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { setTestRepositories } from "../db/context.js";
import { couchStatus } from "../lib/couch-errors.js";
import { createPatient, updatePatient } from "./patients.service.js";
import { createInMemoryRepositories } from "../test/inMemoryRepos.js";

/**
 * The in-memory mock interleaves at `await get` like real Couch: two parallel updates
 * read the same `_rev`; the second `insert` gets 409 (HTTP supertest often serializes requests).
 */
describe("updatePatient — 409 stale revision (mock)", () => {
  beforeEach(() => {
    setTestRepositories(createInMemoryRepositories());
  });

  afterEach(() => {
    setTestRepositories(null);
  });

  it("two concurrent updatePatient calls → exactly one fails with 409", async () => {
    const { id } = await createPatient({ fullName: "Concurrent" });
    const body = { fullName: "Winner", birthDate: "", notes: "" };
    const settled = await Promise.allSettled([
      updatePatient(id, body),
      updatePatient(id, { ...body, fullName: "Other name" }),
    ]);
    const fulfilled = settled.filter((s) => s.status === "fulfilled");
    const rejected = settled.filter((s) => s.status === "rejected");
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    const err = (rejected[0] as PromiseRejectedResult).reason;
    expect(couchStatus(err)).toBe(409);
  });
});
