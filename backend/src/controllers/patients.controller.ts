import type { Request, Response } from "express";
import { couchStatus, sendCouchError } from "../lib/couch-errors.js";
import { parseBodyOr400 } from "../lib/parse-json-body.js";
import { patientCreateBodySchema, patientUpdateBodySchema } from "../validation/request-schemas.js";
import {
  PatientHasSamplesError,
  ValidationError,
  createPatient,
  deletePatient,
  getPatientById,
  listPatientsSorted,
  updatePatient,
} from "../services/patients.service.js";

export async function list(_req: Request, res: Response): Promise<void> {
  try {
    const patients = await listPatientsSorted();
    res.json({ patients });
  } catch (e) {
    sendCouchError(res, e);
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const patient = await getPatientById(req.params.id);
    if (!patient) {
      res.status(404).json({ error: "not_found", message: "No patient found for that id." });
      return;
    }
    res.json({ patient });
  } catch (e) {
    sendCouchError(res, e);
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const parsed = parseBodyOr400(patientCreateBodySchema, req.body, res);
    if (!parsed) return;
    const saved = await createPatient({
      customId: parsed.id?.trim() || undefined,
      fullName: parsed.fullName,
      birthDate: parsed.birthDate,
      notes: parsed.notes,
    });
    res.status(201).json({ ok: true, id: saved.id, rev: saved.rev });
  } catch (e) {
    if (couchStatus(e) === 409) {
      res.status(409).json({
        error: "conflict",
        message: "A patient with that id already exists. Use PUT /patients/:id to update.",
      });
      return;
    }
    sendCouchError(res, e);
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    await deletePatient(req.params.id);
    res.status(204).send();
  } catch (e) {
    if (e instanceof PatientHasSamplesError) {
      res.status(409).json({
        error: "has_samples",
        count: e.count,
        message: `This patient has ${e.count} sample(s). Delete or reassign them before deleting the patient.`,
      });
      return;
    }
    if (couchStatus(e) === 404) {
      res.status(404).json({ error: "not_found", message: "No patient found for that id." });
      return;
    }
    if (couchStatus(e) === 409) {
      res.status(409).json({
        error: "conflict",
        message: "Stale revision while deleting. Reload and try again.",
      });
      return;
    }
    sendCouchError(res, e);
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id;
    const parsed = parseBodyOr400(patientUpdateBodySchema, req.body, res);
    if (!parsed) return;
    const saved = await updatePatient(id, parsed);
    res.json({ ok: true, id: saved.id, rev: saved.rev });
  } catch (e) {
    if (e instanceof ValidationError) {
      res.status(400).json({ error: e.message });
      return;
    }
    if (couchStatus(e) === 404) {
      res.status(404).json({ error: "not_found", message: "No patient found for that id." });
      return;
    }
    if (couchStatus(e) === 409) {
      res.status(409).json({
        error: "conflict",
        message: "Stale revision on patient profile. Reload and try again.",
      });
      return;
    }
    sendCouchError(res, e);
  }
}
