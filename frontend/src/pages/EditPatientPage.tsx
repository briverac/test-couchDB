import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deletePatient, fetchPatient, updatePatient } from '../api'

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
      await updatePatient(id, {
        fullName: fullName.trim(),
        birthDate: birthDate.trim(),
        notes: notes.trim(),
      })
      navigate('/pacientes')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!id) return
    if (
      !window.confirm(
        '¿Eliminar este perfil? Si tiene muestras asociadas, el servidor rechazará el borrado.',
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

  return (
    <>
      <p className="muted page-intro">
        Editar perfil <code>{id}</code>. Los cambios se reflejan en las muestras que enlacen este <code>patientId</code>.
      </p>

      {error && (
        <p className="banner error" role="alert">
          {error}
        </p>
      )}

      <section className="card">
        <div className="card-head">
          <h2>Editar paciente</h2>
          <Link to="/pacientes" className="ghost-link">
            ← Volver al listado
          </Link>
        </div>
        {loading ? (
          <p className="muted">Cargando…</p>
        ) : (
          <form className="form" onSubmit={handleSubmit}>
            <label>
              ID perfil
              <input value={id} readOnly className="readonly" />
            </label>
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
            <button type="submit" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
            <p className="form-divider muted">Zona destructiva</p>
            <button
              type="button"
              className="button-link small danger"
              disabled={deleting}
              onClick={() => void handleDelete()}
            >
              {deleting ? 'Eliminando…' : 'Eliminar perfil'}
            </button>
          </form>
        )}
      </section>
    </>
  )
}
