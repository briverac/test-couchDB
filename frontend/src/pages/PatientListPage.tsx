import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { deletePatient, fetchPatients, type PatientProfile } from '../api'
import {
  AlertBanner,
  EmptyState,
  IdDisplay,
  LoadingState,
  PageCard,
  RefreshButton,
  RowActions,
  TableWrap,
} from '../components'

export default function PatientListPage() {
  const [patients, setPatients] = useState<PatientProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      setPatients(await fetchPatients())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed')
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
        a.fullName.localeCompare(b.fullName, 'en', { sensitivity: 'base' }),
      ),
    [patients],
  )

  async function handleDelete(patient: PatientProfile) {
    const msg =
      'Delete this patient?\nIf samples are linked, the server will reject the delete.'
    if (!window.confirm(msg)) return
    setError(null)
    try {
      await deletePatient(patient.id)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  return (
    <>
      <AlertBanner message={error} />

      <PageCard
        title="Patients"
        headerAside={
          <Link to="/pacientes/nueva" className="button-link">
            + New patient
          </Link>
        }
        footer={<RefreshButton onClick={() => void load()} />}
      >
        {loading ? (
          <LoadingState />
        ) : sorted.length === 0 ? (
          <EmptyState>
            No patients yet. <Link to="/pacientes/nueva">Add one</Link> to link samples.
          </EmptyState>
        ) : (
          <TableWrap>
            <table className="data-table data-table--patients">
              <colgroup>
                <col className="patient-col-id" />
                <col className="patient-col-name" />
                <col className="patient-col-dob" />
                <col className="patient-col-actions" />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">Id</th>
                  <th scope="col">Name</th>
                  <th scope="col">DOB</th>
                  <th scope="col" className="th-actions">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((p) => (
                  <tr key={p.id}>
                    <td className="col-patient-id">
                      <IdDisplay value={p.id} truncate={false} />
                    </td>
                    <td className="col-patient-name">{p.fullName}</td>
                    <td className="col-dob">{p.birthDate ? p.birthDate : <span className="muted">—</span>}</td>
                    <RowActions align="center" compact>
                      <Link
                        to={`/pacientes/editar/${encodeURIComponent(p.id)}`}
                        className="button-link small"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="button-link small danger"
                        onClick={() => void handleDelete(p)}
                      >
                        Delete
                      </button>
                    </RowActions>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </PageCard>
    </>
  )
}
