import type { Request, Response } from "express";
import { couchStatus, sendCouchError } from "../lib/couch-errors.js";
import type { PatientProfile } from "../types/models.js";
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
      res.status(404).json({ error: "not_found", message: "No existe un paciente con ese id." });
      return;
    }
    res.json({ patient });
  } catch (e) {
    sendCouchError(res, e);
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body as Partial<PatientProfile>;
    const customIdRaw = typeof body.id === "string" ? body.id.trim() : "";
    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
    const birthDate = typeof body.birthDate === "string" ? body.birthDate.trim() : undefined;
    const notes = typeof body.notes === "string" ? body.notes.trim() : undefined;
    if (!fullName) {
      res.status(400).json({ error: "Se requiere fullName." });
      return;
    }
    const saved = await createPatient({
      customId: customIdRaw || undefined,
      fullName,
      birthDate,
      notes,
    });
    res.status(201).json({ ok: true, id: saved.id, rev: saved.rev });
  } catch (e) {
    if (couchStatus(e) === 409) {
      res.status(409).json({
        error: "conflict",
        message: "Ya existe un paciente con ese id. Usa PUT /patients/:id para actualizarlo.",
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
        message: `Hay ${e.count} muestra(s) con este paciente. Elimínalas primero o cambia su patientId.`,
      });
      return;
    }
    if (couchStatus(e) === 404) {
      res.status(404).json({ error: "not_found", message: "No existe un paciente con ese id." });
      return;
    }
    if (couchStatus(e) === 409) {
      res.status(409).json({
        error: "conflict",
        message: "Revisión desactualizada al borrar. Recarga y reintenta.",
      });
      return;
    }
    sendCouchError(res, e);
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id;
    const body = req.body as Partial<Pick<PatientProfile, "fullName" | "birthDate" | "notes">>;
    const saved = await updatePatient(id, body);
    res.json({ ok: true, id: saved.id, rev: saved.rev });
  } catch (e) {
    if (e instanceof ValidationError) {
      res.status(400).json({ error: e.message });
      return;
    }
    if (couchStatus(e) === 404) {
      res.status(404).json({ error: "not_found", message: "No existe un paciente con ese id." });
      return;
    }
    if (couchStatus(e) === 409) {
      res.status(409).json({
        error: "conflict",
        message: "Revisión desactualizada en el perfil del paciente. Recarga y reintenta.",
      });
      return;
    }
    sendCouchError(res, e);
  }
}
