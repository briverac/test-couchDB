import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteSample, fetchSamples, type MedicalSample } from '../api'

export default function SampleListPage() {
  const [samples, setSamples] = useState<MedicalSample[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      setSamples(await fetchSamples())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const sorted = useMemo(
    () => [...samples].sort((a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true })),
    [samples],
  )

  async function handleDelete(sample: MedicalSample) {
    if (
      !window.confirm(
        `¿Eliminar la muestra ${sample.id}?\nEsta acción no se puede deshacer desde la UI (queda borrada en CouchDB).`,
      )
    ) {
      return
    }
    setError(null)
    try {
      await deleteSample(sample.id)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo eliminar')
    }
  }

  return (
    <>
      <p className="muted page-intro">
        Cada muestra tiene un <strong>ID</strong> único (UUID de CouchDB) y enlaza un <strong>perfil</strong> (
        <code>patientId</code>). Gestiona pacientes en <Link to="/pacientes">Pacientes</Link>.
      </p>

      {error && (
        <p className="banner error" role="alert">
          {error}
        </p>
      )}

      <section className="card">
        <div className="card-head">
          <h2>Muestras</h2>
          <div className="card-actions-inline">
            <Link to="/pacientes" className="button-link secondary">
              Perfiles paciente
            </Link>
            <Link to="/nueva" className="button-link">
              + Nueva muestra
            </Link>
          </div>
        </div>
        {loading ? (
          <p className="muted">Cargando…</p>
        ) : sorted.length === 0 ? (
          <p className="muted">
            No hay muestras. Necesitas al menos un{' '}
            <Link to="/pacientes/nueva">paciente dado de alta</Link> antes de crear muestras.
          </p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">ID muestra</th>
                  <th scope="col">Paciente</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <code>{s.id}</code>
                    </td>
                    <td>
                      {s.patientId ? (
                        <>
                          <div>{s.patientName}</div>
                          <div className="muted subline">
                            <code>{s.patientId}</code>
                          </div>
                        </>
                      ) : (
                        <span className="muted">{s.patientName || '—'}</span>
                      )}
                    </td>
                    <td>
                      <span className="pill">{s.status}</span>
                    </td>
                    <td className="actions actions-stack">
                      <Link to={`/muestra/${encodeURIComponent(s.id)}`} className="button-link small">
                        Ver
                      </Link>
                      <Link to={`/editar/${encodeURIComponent(s.id)}`} className="button-link small secondary">
                        Editar
                      </Link>
                      <button
                        type="button"
                        className="button-link small danger"
                        onClick={() => void handleDelete(s)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <button type="button" className="ghost" onClick={() => load()}>
          Actualizar lista
        </button>
      </section>
    </>
  )
}
