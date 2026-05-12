/** Allowed sample status values; keep in sync with backend `constants/sample-status.ts`. */
export const SAMPLE_STATUS_VALUES = ['pending', 'in Review', 'Done'] as const

export type SampleStatus = (typeof SAMPLE_STATUS_VALUES)[number]
