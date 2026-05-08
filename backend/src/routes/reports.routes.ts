import { Router } from "express";
import { sampleIdsByPatient, samplesByPatient } from "../controllers/reports.controller.js";

export const reportsRouter = Router();

reportsRouter.get("/samples-by-patient", samplesByPatient);
reportsRouter.get("/samples-by-patient/:patientId", sampleIdsByPatient);
