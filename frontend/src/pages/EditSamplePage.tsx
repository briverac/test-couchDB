import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  deleteSample,
  fetchPatients,
  fetchSample,
  updateSample,
  type PatientProfile,
} from '../api'
import { SAMPLE_STATUS_VALUES, type SampleStatus } from '../constants/sample-status'
import { AlertBanner, BackLink, DangerZone, EmptyState, LoadingState, PageCard } from '../components'

export default function EditSamplePage() {
  const { id: idParam } = useParams<{ id: string }>()
  const id = idParam ? decodeURIComponent(idParam) : ''
  const navigate = useNavigate()

  const [patients, setPatients] = useState<PatientProfile[]>([])
  const [patientId, setPatientId] = useState('')
  const [status, setStatus] = useState<SampleStatus>('pending')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    ;(async () => {
      setError(null)
      setLoading(true)
      try {
        const [list, s] = await Promise.all([fetchPatients(), fetchSample(id)])
        if (cancelled) return
        const sorted = [...list].sort((a, b) =>
          a.fullName.localeCompare(b.fullName, 'en', { sensitivity: 'base' }),
        )
        setPatients(sorted)
        setPatientId(s.patientId || '')
        setStatus(
          SAMPLE_STATUS_VALUES.includes(s.status as SampleStatus)
            ? (s.status as SampleStatus)
            : 'pending',
        )
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Load failed')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return
    setSaving(true)
    setError(null)
    try {
      await updateSample(id, { patientId, status })
      navigate('/')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!id) return
    if (!window.confirm(`Delete sample ${id}? This removes the document from CouchDB.`)) return
    setDeleting(true)
    setError(null)
    try {
      await deleteSample(id)
      navigate('/')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  if (!id) {
    return <AlertBanner message="Missing id in the URL." />
  }

  const hasPatients = patients.length > 0

  return (
    <>
      <AlertBanner message={error} />

      <PageCard title="Edit sample" headerAside={<BackLink to="/">← Samples</BackLink>}>
        {loading ? (
          <LoadingState />
        ) : !hasPatients ? (
          <EmptyState>
            No patients yet. <Link to="/pacientes/nueva">Add a patient</Link> first.
          </EmptyState>
        ) : (
          <form className="form" onSubmit={handleSubmit}>
            <label>
              Sample id
              <input value={id} readOnly className="readonly" />
            </label>
            <label>
              Patient
              <select value={patientId} onChange={(e) => setPatientId(e.target.value)} required>
                <option value="" disabled>
                  Select patient
                </option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.id})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select value={status} onChange={(e) => setStatus(e.target.value as SampleStatus)} required>
                {SAMPLE_STATUS_VALUES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" disabled={saving || !patientId}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <DangerZone>
              <button
                type="button"
                className="button-link small danger"
                disabled={deleting}
                onClick={() => void handleDelete()}
              >
                {deleting ? 'Deleting…' : 'Delete sample'}
              </button>
            </DangerZone>
          </form>
        )}
      </PageCard>
    </>
  )
}
