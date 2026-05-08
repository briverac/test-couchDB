import type { Request, Response } from "express";
import { couchStatus, sendCouchError } from "../lib/couch-errors.js";
import type { MedicalSample } from "../types/models.js";
import {
  UnknownPatientError,
  createSample,
  deleteSample,
  getSampleById,
  listSamples,
  updateSample,
} from "../services/samples.service.js";

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
      res.status(404).json({ error: "not_found", message: "No existe una muestra con ese id." });
      return;
    }
    res.json({ sample });
  } catch (e) {
    sendCouchError(res, e);
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const { id: bodyId, patientId, status } = req.body as Partial<MedicalSample>;
    const customId = typeof bodyId === "string" ? bodyId.trim() : "";
    if (typeof patientId !== "string" || typeof status !== "string") {
      res.status(400).json({ error: "Se requiere patientId y status (strings). El id es opcional." });
      return;
    }
    const saved = await createSample({
      customId: customId || undefined,
      patientId,
      status,
    });
    res.status(201).json({ ok: true, id: saved.id, rev: saved.rev });
  } catch (e) {
    if (e instanceof UnknownPatientError) {
      res.status(400).json({
        error: "unknown_patient",
        message: "No existe un perfil de paciente con ese patientId. Crea primero el paciente.",
      });
      return;
    }
    if (couchStatus(e) === 409) {
      res.status(409).json({
        error: "conflict",
        message: "Ya existe una muestra con ese id. Usa PUT /samples/:id para actualizarla (con la revisión actual).",
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
      res.status(404).json({ error: "not_found", message: "No existe una muestra con ese id." });
      return;
    }
    if (couchStatus(e) === 409) {
      res.status(409).json({
        error: "conflict",
        message: "Conflicto al borrar la muestra. Recarga y reintenta.",
      });
      return;
    }
    sendCouchError(res, e);
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const sid = req.params.id;
    const { patientId, status } = req.body as Partial<Pick<MedicalSample, "patientId" | "status">>;
    if (typeof patientId !== "string" || typeof status !== "string") {
      res.status(400).json({ error: "patientId y status son obligatorios." });
      return;
    }
    const saved = await updateSample(sid, { patientId, status });
    res.json({ ok: true, id: saved.id, rev: saved.rev });
  } catch (e) {
    if (e instanceof UnknownPatientError) {
      res.status(400).json({
        error: "unknown_patient",
        message: "No existe un perfil de paciente con ese patientId.",
      });
      return;
    }
    if (couchStatus(e) === 404) {
      res.status(404).json({ error: "not_found", message: "No existe una muestra con ese id." });
      return;
    }
    if (couchStatus(e) === 409) {
      res.status(409).json({
        error: "conflict",
        message:
          "Revisión desactualizada: el documento cambió en CouchDB (otra escritura ganó). Vuelve a leer y reintenta.",
      });
      return;
    }
    sendCouchError(res, e);
  }
}
