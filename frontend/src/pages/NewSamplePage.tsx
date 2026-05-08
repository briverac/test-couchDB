import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createSample, fetchPatients, type PatientProfile } from '../api'

export default function NewSamplePage() {
  const navigate = useNavigate()
  const [patients, setPatients] = useState<PatientProfile[]>([])
  const [patientsLoaded, setPatientsLoaded] = useState(false)
  const [patientId, setPatientId] = useState('')
  const [status, setStatus] = useState('pending')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const list = await fetchPatients()
        if (cancelled) return
        const sorted = [...list].sort((a, b) =>
          a.fullName.localeCompare(b.fullName, 'es', { sensitivity: 'base' }),
        )
        setPatients(sorted)
        if (sorted.length > 0 && !patientId) {
          setPatientId(sorted[0].id)
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'No se pudieron cargar pacientes')
      } finally {
        if (!cancelled) setPatientsLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- inicializar solo al montar
  }, [])

  const hasPatients = patients.length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await createSample({ patientId, status })
      navigate('/')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    }
  }

  return (
    <>
      <p className="muted page-intro">
        Elige el <strong>perfil</strong> (<code>patientId</code>). El <code>_id</code> de la muestra lo genera CouchDB (
        <strong>UUID</strong> automático).
      </p>

      {error && (
        <div className="banner error" role="alert">
          <p>{error}</p>
        </div>
      )}

      <section className="card">
        <div className="card-head">
          <h2>Nueva muestra</h2>
          <Link to="/" className="ghost-link">
            ← Volver a muestras
          </Link>
        </div>
        {!patientsLoaded ? (
          <p className="muted">Cargando pacientes…</p>
        ) : (
          <form className="form" onSubmit={handleSubmit}>
            <label>
              Paciente (perfil)
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                required
                disabled={!hasPatients}
              >
                {!hasPatients ? <option value="">— Sin pacientes registrados —</option> : null}
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.id})
                  </option>
                ))}
              </select>
            </label>
            {!hasPatients ? (
              <p className="muted form-hint">
                Crea primero un perfil en <Link to="/pacientes/nueva">Nuevo paciente</Link>.
              </p>
            ) : null}
            <label>
              Estado
              <input value={status} onChange={(e) => setStatus(e.target.value)} required />
            </label>
            <button type="submit" disabled={!hasPatients}>
              Crear muestra
            </button>
          </form>
        )}
      </section>
    </>
  )
}
