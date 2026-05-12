import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createSample, fetchPatients, type PatientProfile } from '../api'
import { SAMPLE_STATUS_VALUES, type SampleStatus } from '../constants/sample-status'
import { AlertBanner, BackLink, LoadingState, PageCard } from '../components'

export default function NewSamplePage() {
  const navigate = useNavigate()
  const [patients, setPatients] = useState<PatientProfile[]>([])
  const [patientsLoaded, setPatientsLoaded] = useState(false)
  const [patientId, setPatientId] = useState('')
  const [status, setStatus] = useState<SampleStatus>('pending')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const list = await fetchPatients()
        if (cancelled) return
        const sorted = [...list].sort((a, b) =>
          a.fullName.localeCompare(b.fullName, 'en', { sensitivity: 'base' }),
        )
        setPatients(sorted)
        if (sorted.length > 0 && !patientId) {
          setPatientId(sorted[0].id)
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load patients')
      } finally {
        if (!cancelled) setPatientsLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only
  }, [])

  const hasPatients = patients.length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await createSample({ patientId, status })
      navigate('/')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    }
  }

  return (
    <>
      <AlertBanner message={error} />

      <PageCard title="New sample" headerAside={<BackLink to="/">← Samples</BackLink>}>
        {!patientsLoaded ? (
          <LoadingState />
        ) : (
          <form className="form" onSubmit={handleSubmit}>
            <label>
              Patient
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                required
                disabled={!hasPatients}
              >
                {!hasPatients ? <option value="">No patients yet</option> : null}
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.id})
                  </option>
                ))}
              </select>
            </label>
            {!hasPatients ? (
              <p className="muted form-hint">
                <Link to="/pacientes/nueva">Add a patient</Link> first.
              </p>
            ) : null}
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
            <button type="submit" disabled={!hasPatients}>
              Save
            </button>
          </form>
        )}
      </PageCard>
    </>
  )
}
