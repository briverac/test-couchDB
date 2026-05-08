import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createPatient } from '../api'

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
      setError(e instanceof Error ? e.message : 'Error al guardar')
    }
  }

  return (
    <>
      <p className="muted page-intro">
        CouchDB asigna solo un <strong>UUID</strong> como <code>_id</code> del perfil (no hay campo manual). Verás ese
        id en el listado para enlazar muestras.
      </p>

      {error && (
        <div className="banner error" role="alert">
          <p>{error}</p>
        </div>
      )}

      <section className="card">
        <div className="card-head">
          <h2>Nuevo paciente</h2>
          <Link to="/pacientes" className="ghost-link">
            ← Volver al listado
          </Link>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Nombre completo
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </label>
          <label>
            Fecha de nacimiento (opcional)
            <input
              placeholder="Ej. 1990-04-15"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </label>
          <label>
            Notas (opcional)
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="textarea"
            />
          </label>
          <button type="submit">Guardar perfil</button>
        </form>
      </section>
    </>
  )
}
