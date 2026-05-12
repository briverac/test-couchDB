import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { deletePatient, fetchPatient, updatePatient } from '../api'
import { AlertBanner, BackLink, DangerZone, LoadingState, PageCard } from '../components'

export default function EditPatientPage() {
  const { id: idParam } = useParams<{ id: string }>()
  const id = idParam ? decodeURIComponent(idParam) : ''
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [notes, setNotes] = useState('')
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
        const p = await fetchPatient(id)
        if (cancelled) return
        setFullName(p.fullName)
        setBirthDate(p.birthDate ?? '')
        setNotes(p.notes ?? '')
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
      await updatePatient(id, {
        fullName: fullName.trim(),
        birthDate: birthDate.trim(),
        notes: notes.trim(),
      })
      navigate('/pacientes')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!id) return
    if (
      !window.confirm(
        'Delete this patient? If samples are linked, the server will reject the delete.',
      )
    ) {
      return
    }
    setDeleting(true)
    setError(null)
    try {
      await deletePatient(id)
      navigate('/pacientes')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  if (!id) {
    return <AlertBanner message="Missing id in the URL." />
  }

  return (
    <>
      <AlertBanner message={error} />

      <PageCard title="Edit patient" headerAside={<BackLink to="/pacientes">← Patients</BackLink>}>
        {loading ? (
          <LoadingState />
        ) : (
          <form className="form" onSubmit={handleSubmit}>
            <label>
              Patient id
              <input value={id} readOnly className="readonly" />
            </label>
            <label>
              Full name
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </label>
            <label>
              Date of birth (optional)
              <input
                placeholder="e.g. 1990-04-15"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </label>
            <label>
              Notes (optional)
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="textarea"
              />
            </label>
            <button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <DangerZone>
              <button
                type="button"
                className="button-link small danger"
                disabled={deleting}
                onClick={() => void handleDelete()}
              >
                {deleting ? 'Deleting…' : 'Delete patient'}
              </button>
            </DangerZone>
          </form>
        )}
      </PageCard>
    </>
  )
}
