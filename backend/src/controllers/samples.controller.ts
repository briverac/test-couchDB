import type { Request, Response } from "express";
import { couchStatus, sendCouchError } from "../lib/couch-errors.js";
import { parseBodyOr400 } from "../lib/parse-json-body.js";
import {
  UnknownPatientError,
  createSample,
  deleteSample,
  getSampleById,
  listSamples,
  updateSample,
} from "../services/samples.service.js";
import { sampleCreateBodySchema, sampleUpdateBodySchema } from "../validation/request-schemas.js";

export async function list(_req: Request, res: Response): Promise<void> {
  try {
    const samples = await listSamples();
    res.json({ samples });
  } catch (e) {
    sendCouchError(res, e);
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const sample = await getSampleById(req.params.id);
    if (!sample) {
      res.status(404).json({ error: "not_found", message: "No sample found for that id." });
      return;
    }
    res.json({ sample });
  } catch (e) {
    sendCouchError(res, e);
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const parsed = parseBodyOr400(sampleCreateBodySchema, req.body, res);
    if (!parsed) return;
    const saved = await createSample({
      customId: parsed.id?.trim() || undefined,
      patientId: parsed.patientId,
      status: parsed.status,
    });
    res.status(201).json({ ok: true, id: saved.id, rev: saved.rev });
  } catch (e) {
    if (e instanceof UnknownPatientError) {
      res.status(400).json({
        error: "unknown_patient",
        message: "No patient profile for that patientId. Create the patient first.",
      });
      return;
    }
    if (couchStatus(e) === 409) {
      res.status(409).json({
        error: "conflict",
        message: "A sample with that id already exists. Use PUT /samples/:id with the current revision.",
      });
      return;
    }
    sendCouchError(res, e);
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    await deleteSample(req.params.id);
    res.status(204).send();
  } catch (e) {
    if (couchStatus(e) === 404) {
      res.status(404).json({ error: "not_found", message: "No sample found for that id." });
      return;
    }
    if (couchStatus(e) === 409) {
      res.status(409).json({
        error: "conflict",
        message: "Conflict while deleting sample. Reload and try again.",
      });
      return;
    }
    sendCouchError(res, e);
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const sid = req.params.id;
    const parsed = parseBodyOr400(sampleUpdateBodySchema, req.body, res);
    if (!parsed) return;
    const saved = await updateSample(sid, parsed);
    res.json({ ok: true, id: saved.id, rev: saved.rev });
  } catch (e) {
    if (e instanceof UnknownPatientError) {
      res.status(400).json({
        error: "unknown_patient",
        message: "No patient profile for that patientId.",
      });
      return;
    }
    if (couchStatus(e) === 404) {
      res.status(404).json({ error: "not_found", message: "No sample found for that id." });
      return;
    }
    if (couchStatus(e) === 409) {
      res.status(409).json({
        error: "conflict",
        message: "Stale revision: the document changed in CouchDB. Reload and try again.",
      });
      return;
    }
    sendCouchError(res, e);
  }
}
