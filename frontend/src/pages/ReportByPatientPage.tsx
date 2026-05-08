import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchSampleIdsForPatient,
  fetchSamplesByPatientReport,
  type SamplesByPatientStat,
} from '../api'

export default function ReportByPatientPage() {
  const [stats, setStats] = useState<SamplesByPatientStat[]>([])
  const [viewName, setViewName] = useState('')
  const [note, setNote] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [idsByPatient, setIdsByPatient] = useState<Record<string, string[]>>({})
  const [idsLoading, setIdsLoading] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const data = await fetchSamplesByPatientReport()
      setStats(data.stats)
      setViewName(data.view)
      setNote(data.note)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar el reporte')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function toggleIds(patientId: string) {
    if (expanded === patientId) {
      setExpanded(null)
      return
    }
    setExpanded(patientId)
    if (idsByPatient[patientId]) return
    setIdsLoading(patientId)
    setError(null)
    try {
      const ids = await fetchSampleIdsForPatient(patientId)
      setIdsByPatient((prev) => ({ ...prev, [patientId]: ids }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar ids de muestras')
      setExpanded(null)
    } finally {
      setIdsLoading(null)
    }
  }

  return (
    <>
      <p className="muted page-intro">
        Este resumen usa una <strong>vista MapReduce</strong> en CouchDB (
        <code>{viewName || 'sample_views/count_by_patient'}</code>): el <strong>conteo por paciente</strong> se calcula
        en el motor con <code>emit(patientId, 1)</code> y reduce <code>_sum</code>. Solo cuenta muestras que tengan el
        campo <code>patientId</code>. La API añade el nombre del perfil desde la BD de pacientes.
      </p>
      {note ? (
        <p className="muted page-intro">
          <em>{note}</em>
        </p>
      ) : null}

      {error && (
        <p className="banner error" role="alert">
          {error}
        </p>
      )}

      <section className="card">
        <div className="card-head">
          <h2>Muestras por paciente (vista)</h2>
          <button type="button" className="ghost" onClick={() => load()}>
            Recalcular
          </button>
        </div>
        {loading ? (
          <p className="muted">Cargando…</p>
        ) : error ? (
          <p className="muted">
            No se pudo leer la vista en CouchDB. Comprueba que la API esté en marcha y que la base{' '}
            <code>medical_samples</code> exista; si acabas de crear el contenedor, pulsa <strong>Recalcular</strong> tras
            arrancar el backend.
          </p>
        ) : stats.length === 0 ? (
          <p className="muted">
            No hay muestras con <code>patientId</code> indexadas por la vista (o aún no hay datos).
          </p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Paciente</th>
                  <th scope="col">ID perfil</th>
                  <th scope="col">Muestras</th>
                  <th scope="col">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((row) => (
                  <tr key={row.patientId}>
                    <td>{row.patientName}</td>
                    <td>
                      <code>{row.patientId}</code>
                    </td>
                    <td>
                      <span className="pill">{row.count}</span>
                    </td>
                    <td className="actions">
                      <button
                        type="button"
                        className="button-link small"
                        onClick={() => toggleIds(row.patientId)}
                        disabled={idsLoading === row.patientId}
                      >
                        {expanded === row.patientId ? 'Ocultar ids' : 'Ver ids'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {expanded && idsByPatient[expanded] ? (
          <div className="detail-panel">
            <p className="muted">
              Muestras (<code>sample_views/samples_by_patient</code>) para{' '}
              <code>{expanded}</code>. <strong>Ver muestra</strong> abre solo lectura; desde ahí puedes pasar a editar si
              hace falta.
            </p>
            <ul className="sample-id-list">
              {idsByPatient[expanded].map((sid) => (
                <li key={sid} className="sample-id-row">
                  <code className="sample-id-code" title={sid}>
                    {sid}
                  </code>
                  <Link
                    to={`/muestra/${encodeURIComponent(sid)}`}
                    className="button-link small"
                  >
                    Ver muestra
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </>
  )
}
