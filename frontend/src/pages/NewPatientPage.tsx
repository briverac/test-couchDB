import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPatient } from '../api'
import { AlertBanner, BackLink, PageCard } from '../components'

export default function NewPatientPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await createPatient({
        fullName: fullName.trim(),
        birthDate: birthDate.trim() || undefined,
        notes: notes.trim() || undefined,
      })
      navigate('/pacientes')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    }
  }

  return (
    <>
      <AlertBanner message={error} />

      <PageCard
        title="New patient"
        headerAside={<BackLink to="/pacientes">← Patients</BackLink>}
      >
        <form className="form" onSubmit={handleSubmit}>
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
          <button type="submit">Save</button>
        </form>
      </PageCard>
    </>
  )
}
