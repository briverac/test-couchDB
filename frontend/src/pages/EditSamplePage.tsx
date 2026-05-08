import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  deleteSample,
  fetchPatients,
  fetchSample,
  updateSample,
  type PatientProfile,
} from '../api'

export default function EditSamplePage() {
  const { id: idParam } = useParams<{ id: string }>()
  const id = idParam ? decodeURIComponent(idParam) : ''
  const navigate = useNavigate()

  const [patients, setPatients] = useState<PatientProfile[]>([])
  const [patientId, setPatientId] = useState('')
  const [status, setStatus] = useState('')
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
          a.fullName.localeCompare(b.fullName, 'es', { sensitivity: 'base' }),
        )
        setPatients(sorted)
        setPatientId(s.patientId || '')
        setStatus(s.status)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'No se pudo cargar')
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
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!id) return
    if (!window.confirm(`¿Eliminar la muestra ${id}?\nSe borrará el documento en CouchDB.`)) return
    setDeleting(true)
    setError(null)
    try {
      await deleteSample(id)
      navigate('/')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo eliminar')
    } finally {
      setDeleting(false)
    }
  }

  if (!id) {
    return (
      <p className="banner error" role="alert">
        Falta el id en la URL.
      </p>
    )
  }

  const hasPatients = patients.length > 0

  return (
    <>
      <p className="muted page-intro">
        Muestra <code>{id}</code>. Puedes reasignar a otro <strong>perfil</strong> o cambiar el estado; el servidor lee
        CouchDB y guarda con la revisión correcta.
      </p>

      {error && (
        <p className="banner error" role="alert">
          {error}
        </p>
      )}

      <section className="card">
        <div className="card-head">
          <h2>Editar muestra</h2>
          <Link to="/" className="ghost-link">
            ← Volver al listado
          </Link>
        </div>
        {loading ? (
          <p className="muted">Cargando…</p>
        ) : !hasPatients ? (
          <p className="muted">
            No hay pacientes. <Link to="/pacientes/nueva">Crear perfil</Link> antes de editar la muestra.
          </p>
        ) : (
          <form className="form" onSubmit={handleSubmit}>
            <label>
              ID muestra
              <input value={id} readOnly className="readonly" />
            </label>
            <label>
              Paciente (perfil)
              <select value={patientId} onChange={(e) => setPatientId(e.target.value)} required>
                <option value="" disabled>
                  — Elige perfil —
                </option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.id})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Estado
              <input value={status} onChange={(e) => setStatus(e.target.value)} required />
            </label>
            <button type="submit" disabled={saving || !patientId}>
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
            <p className="form-divider muted">Zona destructiva</p>
            <button
              type="button"
              className="button-link small danger"
              disabled={deleting}
              onClick={() => void handleDelete()}
            >
              {deleting ? 'Eliminando…' : 'Eliminar muestra'}
            </button>
          </form>
        )}
      </section>
    </>
  )
}
