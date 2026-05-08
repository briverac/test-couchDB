import type { Request, Response } from "express";
import { sendCouchError } from "../lib/couch-errors.js";
import {
  getSampleIdsForPatient,
  getSamplesByPatientReport,
} from "../services/reports.service.js";

export async function samplesByPatient(_req: Request, res: Response): Promise<void> {
  try {
    const payload = await getSamplesByPatientReport();
    res.json(payload);
  } catch (e) {
    sendCouchError(res, e);
  }
}

export async function sampleIdsByPatient(req: Request, res: Response): Promise<void> {
  try {
    const patientId = req.params.patientId;
    const sampleIds = await getSampleIdsForPatient(patientId);
    res.json({
      patientId,
      sampleIds,
      view: "sample_views/samples_by_patient",
    });
  } catch (e) {
    sendCouchError(res, e);
  }
}
