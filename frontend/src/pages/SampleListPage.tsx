import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteSample, fetchSamples, type MedicalSample } from '../api'
import {
  AlertBanner,
  EmptyState,
  IdDisplay,
  LoadingState,
  PageCard,
  RefreshButton,
  RowActions,
  StatusBadge,
  TableWrap,
} from '../components'

export default function SampleListPage() {
  const [samples, setSamples] = useState<MedicalSample[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      setSamples(await fetchSamples())
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
    () => [...samples].sort((a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true })),
    [samples],
  )

  async function handleDelete(sample: MedicalSample) {
    if (
      !window.confirm(
        `Delete sample ${sample.id}? This cannot be undone from the UI (document is removed in CouchDB).`,
      )
    ) {
      return
    }
    setError(null)
    try {
      await deleteSample(sample.id)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  return (
    <>
      <AlertBanner message={error} />

      <PageCard
        title="Samples"
        headerAside={
          <Link to="/nueva" className="button-link">
            + New sample
          </Link>
        }
        footer={<RefreshButton onClick={() => void load()} />}
      >
        {loading ? (
          <LoadingState />
        ) : sorted.length === 0 ? (
          <EmptyState>
            No samples yet. Add a <Link to="/pacientes/nueva">patient</Link> first, then create a sample.
          </EmptyState>
        ) : (
          <TableWrap>
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Sample id</th>
                  <th scope="col">Patient</th>
                  <th scope="col" className="th-status">
                    Status
                  </th>
                  <th scope="col" className="th-actions">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <IdDisplay value={s.id} />
                    </td>
                    <td className="patient-cell">
                      {s.patientId ? (
                        <>
                          <span className="patient-name">{s.patientName}</span>
                          <span className="patient-id-sep">{' · '}</span>
                          <span className="patient-id-inline muted">
                            <IdDisplay value={s.patientId} />
                          </span>
                        </>
                      ) : (
                        <span className="muted">{s.patientName || '—'}</span>
                      )}
                    </td>
                    <td className="td-status">
                      <StatusBadge status={s.status} />
                    </td>
                    <RowActions align="center">
                      <Link to={`/muestra/${encodeURIComponent(s.id)}`} className="button-link small">
                        View
                      </Link>
                      <Link to={`/editar/${encodeURIComponent(s.id)}`} className="button-link small secondary">
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="button-link small danger"
                        onClick={() => void handleDelete(s)}
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
