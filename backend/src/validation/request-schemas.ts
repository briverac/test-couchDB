/**
 * Runtime JSON body contracts.
 * `.min(1)` after `.trim()` means required and non-whitespace; `.optional()` means the key may be absent.
 */
import { z } from "zod";
import { SAMPLE_STATUS_VALUES } from "../constants/sample-status.js";

/** POST /patients */
export const patientCreateBodySchema = z.object({
  id: z.string().trim().optional(),
  fullName: z.string().trim().min(1, "fullName is required."),
  birthDate: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

/** PUT /patients/:id — matches `updatePatient` (fullName required). */
export const patientUpdateBodySchema = z.object({
  fullName: z.string().trim().min(1, "fullName is required."),
  birthDate: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const sampleStatusField = z.enum(SAMPLE_STATUS_VALUES, {
  message: `status must be one of: ${SAMPLE_STATUS_VALUES.join(", ")}.`,
});

/** POST /samples */
export const sampleCreateBodySchema = z.object({
  id: z.string().trim().optional(),
  patientId: z.string().trim().min(1, "patientId is required."),
  status: sampleStatusField,
});

/** PUT /samples/:id */
export const sampleUpdateBodySchema = z.object({
  patientId: z.string().trim().min(1, "patientId is required."),
  status: sampleStatusField,
});
