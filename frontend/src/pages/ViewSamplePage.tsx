import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchSample } from '../api'

export default function ViewSamplePage() {
  const { id: idParam } = useParams<{ id: string }>()
  const id = idParam ? decodeURIComponent(idParam) : ''

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [patientId, setPatientId] = useState('')
  const [patientName, setPatientName] = useState('')
  const [status, setStatus] = useState('')
  const [rev, setRev] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    ;(async () => {
      setError(null)
      setLoading(true)
      try {
        const s = await fetchSample(id)
        if (cancelled) return
        setPatientId(s.patientId)
        setPatientName(s.patientName)
        setStatus(s.status)
        setRev(s.rev)
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
        Solo lectura (<code>GET /samples/:id</code>). Los cambios se hacen en <strong>Editar</strong>.
      </p>
      <section className="card">
        <div className="card-head">
          <h2>Muestra</h2>
          <div className="card-actions-inline">
            <Link to="/" className="ghost-link">
              ← Listado
            </Link>
            <Link to={`/editar/${encodeURIComponent(id)}`} className="button-link small">
              Editar
            </Link>
          </div>
        </div>

        {error && (
          <p className="banner error" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p className="muted">Cargando…</p>
        ) : error ? null : (
          <dl className="read-only-dl">
            <dt>ID muestra (_id CouchDB)</dt>
            <dd>
              <code>{id}</code>
            </dd>
            <dt>PatientId (perfil)</dt>
            <dd>{patientId ? <code>{patientId}</code> : <span className="muted">—</span>}</dd>
            <dt>Nombre mostrado (perfil)</dt>
            <dd>{patientName || <span className="muted">—</span>}</dd>
            <dt>Estado</dt>
            <dd>
              <span className="pill">{status}</span>
            </dd>
            {rev ? (
              <>
                <dt>
                  Rev (CouchDB) <span className="muted rev-hint">referencia interna</span>
                </dt>
                <dd>
                  <code className="small-rev">{rev}</code>
                </dd>
              </>
            ) : null}
          </dl>
        )}
      </section>
    </>
  )
}
