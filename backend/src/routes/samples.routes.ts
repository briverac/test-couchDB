import { Router } from "express";
import { create, getById, list, remove, update } from "../controllers/samples.controller.js";

export const samplesRouter = Router();

samplesRouter.get("/", list);
samplesRouter.post("/", create);
samplesRouter.get("/:id", getById);
samplesRouter.delete("/:id", remove);
samplesRouter.put("/:id", update);
