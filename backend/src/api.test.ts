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

  it("DELETE /samples/:id elimina y GET devuelve 404", async () => {
    const agent = request(app);
    const p = await agent.post("/patients").send({ fullName: "Ada Lovelace" }).expect(201);
    const patientId = (p.body as { id: string }).id;
    const s = await agent.post("/samples").send({ patientId, status: "pendiente" }).expect(201);
    const sid = (s.body as { id: string }).id;
    await agent.delete(`/samples/${encodeURIComponent(sid)}`).expect(204);
    await agent.get(`/samples/${encodeURIComponent(sid)}`).expect(404);
  });

  it("DELETE /patients/:id elimina cuando no hay muestras", async () => {
    const agent = request(app);
    const p = await agent.post("/patients").send({ fullName: "Grace Hopper" }).expect(201);
    const id = (p.body as { id: string }).id;
    await agent.delete(`/patients/${encodeURIComponent(id)}`).expect(204);
    await agent.get(`/patients/${encodeURIComponent(id)}`).expect(404);
  });

  it("DELETE /patients/:id responde 409 si quedan muestras enlazadas", async () => {
    const agent = request(app);
    const p = await agent.post("/patients").send({ fullName: "Margaret Hamilton" }).expect(201);
    const patientId = (p.body as { id: string }).id;
    await agent.post("/samples").send({ patientId, status: "x" }).expect(201);
    const res = await agent.delete(`/patients/${encodeURIComponent(patientId)}`).expect(409);
    expect((res.body as { error?: string }).error).toBe("has_samples");
    expect(Number((res.body as { count?: number }).count)).toBeGreaterThan(0);
  });
});
