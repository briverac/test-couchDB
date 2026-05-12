/** Allowed `status` on sample documents; keep in sync with frontend `sample-status.ts`. */
export const SAMPLE_STATUS_VALUES = ["pending", "in Review", "Done"] as const;

export type SampleStatus = (typeof SAMPLE_STATUS_VALUES)[number];

export function isSampleStatus(s: string): s is SampleStatus {
  return (SAMPLE_STATUS_VALUES as readonly string[]).includes(s);
}

/** Coerce API output to `SampleStatus`: exact enum match, otherwise `pending`. */
export function normalizeSampleStatus(raw: unknown): SampleStatus {
  const s = String(raw ?? "").trim();
  return isSampleStatus(s) ? s : "pending";
}
