import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { deletePatient, fetchPatients, type PatientProfile } from '../api'

export default function PatientListPage() {
  const [patients, setPatients] = useState<PatientProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      setPatients(await fetchPatients())
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
    () =>
      [...patients].sort((a, b) =>
        a.fullName.localeCompare(b.fullName, 'es', { sensitivity: 'base' }),
      ),
    [patients],
  )

  async function handleDelete(patient: PatientProfile) {
    const msg =
      '¿Eliminar este perfil de paciente?\nSi tiene muestras enlazadas, el servidor rechazará el borrado.'
    if (!window.confirm(msg)) return
    setError(null)
    try {
      await deletePatient(patient.id)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo eliminar')
    }
  }

  return (
    <>
      <p className="muted page-intro">
        Perfiles de paciente: CouchDB asigna el <strong>UUID</strong> (<code>_id</code>). Las muestras enlazan con{' '}
        <code>patientId</code>.
      </p>

      {error && (
        <p className="banner error" role="alert">
          {error}
        </p>
      )}

      <section className="card">
        <div className="card-head">
          <h2>Pacientes</h2>
          <Link to="/pacientes/nueva" className="button-link">
            + Nuevo paciente
          </Link>
        </div>

        {loading ? (
          <p className="muted">Cargando…</p>
        ) : sorted.length === 0 ? (
          <p className="muted">
            No hay pacientes. Crea uno para poder asociar muestras.{' '}
            <Link to="/pacientes/nueva">Dar de alta paciente</Link>
          </p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">ID perfil</th>
                  <th scope="col">Nombre</th>
                  <th scope="col">Nac.</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <code>{p.id}</code>
                    </td>
                    <td>{p.fullName}</td>
                    <td>{p.birthDate ? <span className="muted">{p.birthDate}</span> : '—'}</td>
                    <td className="actions actions-stack">
                      <Link
                        to={`/pacientes/editar/${encodeURIComponent(p.id)}`}
                        className="button-link small"
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        className="button-link small danger"
                        onClick={() => void handleDelete(p)}
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
