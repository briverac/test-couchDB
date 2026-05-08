import express from "express";
import { patientsRouter } from "./routes/patients.routes.js";
import { reportsRouter } from "./routes/reports.routes.js";
import { samplesRouter } from "./routes/samples.routes.js";

/**
 * Fábrica de la app HTTP (sin escuchar puerto).
 * Así los tests pueden importar `createApp()` sin arrancar el servidor.
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
