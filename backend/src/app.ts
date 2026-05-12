import express from "express";
import { patientsRouter } from "./routes/patients.routes.js";
import { reportsRouter } from "./routes/reports.routes.js";
import { samplesRouter } from "./routes/samples.routes.js";

/**
 * HTTP app factory (does not listen on a port).
 * Tests import `createApp()` without starting the server.
 */
export function createApp(): express.Application {
  const app = express();
  app.use(express.json());

  app.get("/", (_req, res) => {
    res.redirect(302, "/samples");
  });

  app.use("/patients", patientsRouter);
  app.use("/samples", samplesRouter);
  app.use("/reports", reportsRouter);

  return app;
}
