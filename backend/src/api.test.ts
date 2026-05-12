import { afterEach, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "./app.js";
import { setTestRepositories } from "./db/context.js";
import { createInMemoryRepositories } from "./test/inMemoryRepos.js";

describe("API", () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    setTestRepositories(createInMemoryRepositories());
    app = createApp();
  });

  afterEach(() => {
    setTestRepositories(null);
  });

  it("POST /patients duplicate custom id → 409 conflict (in-memory Couch)", async () => {
    const agent = request(app);
    const customId = "patient-dup-409";
    await agent.post("/patients").send({ id: customId, fullName: "First" }).expect(201);
    const res = await agent.post("/patients").send({ id: customId, fullName: "Second" }).expect(409);
    expect((res.body as { error?: string }).error).toBe("conflict");
  });

  it("POST /samples duplicate custom id → 409 conflict (in-memory Couch)", async () => {
    const agent = request(app);
    const p = await agent.post("/patients").send({ fullName: "Sample dup parent" }).expect(201);
    const patientId = (p.body as { id: string }).id;
    const sid = "sample-dup-409";
    await agent.post("/samples").send({ id: sid, patientId, status: "pending" }).expect(201);
    const res = await agent.post("/samples").send({ id: sid, patientId, status: "Done" }).expect(409);
    expect((res.body as { error?: string }).error).toBe("conflict");
  });

  it("POST /samples invalid status → 400 validation_error (Zod)", async () => {
    const agent = request(app);
    const p = await agent.post("/patients").send({ fullName: "Status enum" }).expect(201);
    const patientId = (p.body as { id: string }).id;
    const res = await agent.post("/samples").send({ patientId, status: "shipped" }).expect(400);
    expect((res.body as { error?: string }).error).toBe("validation_error");
  });

  it("POST /patients missing fullName → 400 validation_error (Zod)", async () => {
    const agent = request(app);
    const res = await agent.post("/patients").send({}).expect(400);
    expect((res.body as { error?: string }).error).toBe("validation_error");
  });

  it("DELETE /samples/:id removes document; GET returns 404", async () => {
    const agent = request(app);
    const p = await agent.post("/patients").send({ fullName: "Ada Lovelace" }).expect(201);
    const patientId = (p.body as { id: string }).id;
    const s = await agent.post("/samples").send({ patientId, status: "pending" }).expect(201);
    const sid = (s.body as { id: string }).id;
    await agent.delete(`/samples/${encodeURIComponent(sid)}`).expect(204);
    await agent.get(`/samples/${encodeURIComponent(sid)}`).expect(404);
  });

  it("DELETE /patients/:id succeeds when patient has no samples", async () => {
    const agent = request(app);
    const p = await agent.post("/patients").send({ fullName: "Grace Hopper" }).expect(201);
    const id = (p.body as { id: string }).id;
    await agent.delete(`/patients/${encodeURIComponent(id)}`).expect(204);
    await agent.get(`/patients/${encodeURIComponent(id)}`).expect(404);
  });

  it("DELETE /patients/:id returns 409 when linked samples exist", async () => {
    const agent = request(app);
    const p = await agent.post("/patients").send({ fullName: "Margaret Hamilton" }).expect(201);
    const patientId = (p.body as { id: string }).id;
    await agent.post("/samples").send({ patientId, status: "in Review" }).expect(201);
    const res = await agent.delete(`/patients/${encodeURIComponent(patientId)}`).expect(409);
    expect((res.body as { error?: string }).error).toBe("has_samples");
    expect(Number((res.body as { count?: number }).count)).toBeGreaterThan(0);
  });
});
