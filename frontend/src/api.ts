/** En desarrollo, Vite reenvía `/api` → Express (véase `vite.config.ts`). */

const BASE = '/api'

async function readError(res: Response): Promise<string> {
  const text = await res.text()
  try {
    const body = JSON.parse(text) as { message?: string; error?: string; reason?: string }
    if (body.message) return body.message
    if (body.reason) return body.reason
    if (body.error) return body.error
  } catch {
    /* cuerpo no JSON */
  }
  return text || res.statusText
}

export type PatientProfile = {
  id: string
  fullName: string
  birthDate?: string
  notes?: string
  rev?: string
}

export async function fetchPatients(): Promise<PatientProfile[]> {
  const res = await fetch(`${BASE}/patients`)
  if (!res.ok) throw new Error(await readError(res))
  const data = (await res.json()) as { patients: PatientProfile[] }
  return data.patients
}

export async function fetchPatient(id: string): Promise<PatientProfile> {
  const res = await fetch(`${BASE}/patients/${encodeURIComponent(id)}`)
  if (!res.ok) throw new Error(await readError(res))
  const data = (await res.json()) as { patient: PatientProfile }
  return data.patient
}

export type CreatePatientInput = Pick<PatientProfile, 'fullName'> &
  Partial<Pick<PatientProfile, 'id' | 'birthDate' | 'notes'>>

/** Si omites `id`, CouchDB asigna un UUID al `_id`. */
export async function createPatient(body: CreatePatientInput): Promise<{ id: string }> {
  const res = await fetch(`${BASE}/patients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: body.fullName,
      ...(body.id != null && String(body.id).trim() ? { id: String(body.id).trim() } : {}),
      ...(body.birthDate != null && String(body.birthDate).trim() ? { birthDate: body.birthDate } : {}),
      ...(body.notes != null && String(body.notes).trim() ? { notes: body.notes } : {}),
    }),
  })
  if (!res.ok) throw new Error(await readError(res))
  const data = (await res.json()) as { id: string }
  return { id: data.id }
}

export async function updatePatient(
  id: string,
  body: Pick<PatientProfile, 'fullName' | 'birthDate' | 'notes'>,
): Promise<void> {
  const res = await fetch(`${BASE}/patients/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await readError(res))
}

export async function deletePatient(id: string): Promise<void> {
  const res = await fetch(`${BASE}/patients/${encodeURIComponent(id)}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(await readError(res))
}

export type MedicalSample = {
  id: string
  patientId: string
  patientName: string
  status: string
  rev?: string
}

export async function fetchSamples(): Promise<MedicalSample[]> {
  const res = await fetch(`${BASE}/samples`)
  if (!res.ok) throw new Error(await readError(res))
  const data = (await res.json()) as { samples: MedicalSample[] }
  return data.samples
}

export async function fetchSample(id: string): Promise<MedicalSample> {
  const res = await fetch(`${BASE}/samples/${encodeURIComponent(id)}`)
  if (!res.ok) throw new Error(await readError(res))
  const data = (await res.json()) as { sample: MedicalSample }
  return data.sample
}

export type CreateSampleInput = Pick<MedicalSample, 'patientId' | 'status'> &
  Partial<Pick<MedicalSample, 'id'>>

/** Si omites `id`, CouchDB asigna un UUID al `_id`. */
export async function createSample(body: CreateSampleInput): Promise<{ id: string }> {
  const res = await fetch(`${BASE}/samples`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patientId: body.patientId,
      status: body.status,
      ...(body.id != null && String(body.id).trim() ? { id: String(body.id).trim() } : {}),
    }),
  })
  if (!res.ok) throw new Error(await readError(res))
  const data = (await res.json()) as { id: string }
  return { id: data.id }
}

export async function updateSample(
  id: string,
  body: Pick<MedicalSample, 'patientId' | 'status'>,
): Promise<void> {
  const res = await fetch(`${BASE}/samples/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await readError(res))
}

export async function deleteSample(id: string): Promise<void> {
  const res = await fetch(`${BASE}/samples/${encodeURIComponent(id)}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(await readError(res))
}

export type SamplesByPatientStat = {
  patientId: string
  patientName: string
  count: number
}

/** Agregado CouchDB (MapReduce `count_by_patient`), nombres enriquecidos por la API. */
export async function fetchSamplesByPatientReport(): Promise<{
  stats: SamplesByPatientStat[]
  view: string
  note?: string
}> {
  const res = await fetch(`${BASE}/reports/samples-by-patient`)
  if (!res.ok) throw new Error(await readError(res))
  return res.json() as Promise<{
    stats: SamplesByPatientStat[]
    view: string
    note?: string
  }>
}

/** Filas de la vista `samples_by_patient` para un `patientId`. */
export async function fetchSampleIdsForPatient(patientId: string): Promise<string[]> {
  const res = await fetch(
    `${BASE}/reports/samples-by-patient/${encodeURIComponent(patientId)}`,
  )
  if (!res.ok) throw new Error(await readError(res))
  const data = (await res.json()) as { sampleIds: string[] }
  return data.sampleIds
}
