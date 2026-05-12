import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchSampleIdsForPatient,
  fetchSamplesByPatientReport,
  type SamplesByPatientStat,
} from '../api'
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
      setError(e instanceof Error ? e.message : 'Failed to load report')
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
      setError(e instanceof Error ? e.message : 'Failed to load sample ids')
      setExpanded(null)
    } finally {
      setIdsLoading(null)
    }
  }

  return (
    <>
      {note ? (
        <EmptyState>
          <em>{note}</em>
        </EmptyState>
      ) : null}

      <AlertBanner message={error} />

      <PageCard
        title="Samples by patient"
        headerAside={<RefreshButton onClick={() => void load()} />}
      >
        {loading ? (
          <LoadingState />
        ) : error ? (
          <EmptyState>
            Could not run the CouchDB view. Check that the API is up and the <code>medical_samples</code> database
            exists, then hit Refresh.
          </EmptyState>
        ) : stats.length === 0 ? (
          <EmptyState>No rows for this view yet (no samples with <code>patientId</code>).</EmptyState>
        ) : (
          <TableWrap>
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Patient</th>
                  <th scope="col">Patient id</th>
                  <th scope="col">Count</th>
                  <th scope="col">Detail</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((row) => (
                  <tr key={row.patientId}>
                    <td>{row.patientName}</td>
                    <td>
                      <IdDisplay value={row.patientId} />
                    </td>
                    <td>
                      <span className="pill">{row.count}</span>
                    </td>
                    <RowActions stack={false}>
                      <button
                        type="button"
                        className="button-link small"
                        onClick={() => toggleIds(row.patientId)}
                        disabled={idsLoading === row.patientId}
                      >
                        {expanded === row.patientId ? 'Hide ids' : 'Show ids'}
                      </button>
                    </RowActions>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
        {expanded && idsByPatient[expanded] ? (
          <div className="detail-panel">
            <EmptyState>
              Sample ids for <IdDisplay value={expanded} /> · view <code>sample_views/samples_by_patient</code>
            </EmptyState>
            <ul className="sample-id-list">
              {idsByPatient[expanded].map((sid) => (
                <li key={sid} className="sample-id-row">
                  <span className="sample-id-primary">
                    <IdDisplay value={sid} />
                  </span>
                  <Link
                    to={`/muestra/${encodeURIComponent(sid)}`}
                    className="button-link small"
                  >
                    Open
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </PageCard>
      {!loading && viewName ? (
        <EmptyState style={{ fontSize: '0.82rem', marginTop: '0.5rem' }}>
          View: <code>{viewName}</code>
        </EmptyState>
      ) : null}
    </>
  )
}
