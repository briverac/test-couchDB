import { Router } from "express";
import { create, getById, list, remove, update } from "../controllers/patients.controller.js";

export const patientsRouter = Router();

patientsRouter.get("/", list);
patientsRouter.get("/:id", getById);
patientsRouter.post("/", create);
patientsRouter.delete("/:id", remove);
patientsRouter.put("/:id", update);
