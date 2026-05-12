import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchSample, type SampleStatus } from '../api'
import { AlertBanner, BackLink, IdDisplay, LoadingState, PageCard, StatusBadge } from '../components'

export default function ViewSamplePage() {
  const { id: idParam } = useParams<{ id: string }>()
  const id = idParam ? decodeURIComponent(idParam) : ''

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [patientId, setPatientId] = useState('')
  const [patientName, setPatientName] = useState('')
  const [status, setStatus] = useState<SampleStatus>('pending')
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
        if (!cancelled) setError(e instanceof Error ? e.message : 'Load failed')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  if (!id) {
    return <AlertBanner message="Missing id in the URL." />
  }

  return (
    <>
      <AlertBanner message={error} />

      <PageCard
        title="Sample"
        headerAside={
          <div className="card-actions-inline">
            <BackLink to="/">← Samples</BackLink>
            <Link to={`/editar/${encodeURIComponent(id)}`} className="button-link small">
              Edit
            </Link>
          </div>
        }
      >
        {loading ? (
          <LoadingState />
        ) : error ? null : (
          <dl className="read-only-dl">
            <dt>Sample id</dt>
            <dd>
              <IdDisplay value={id} />
            </dd>
            <dt>Patient id</dt>
            <dd>{patientId ? <IdDisplay value={patientId} /> : <span className="muted">—</span>}</dd>
            <dt>Patient name</dt>
            <dd>{patientName || <span className="muted">—</span>}</dd>
            <dt>Status</dt>
            <dd>
              <StatusBadge status={status} />
            </dd>
            {rev ? (
              <>
                <dt>
                  Rev <span className="muted rev-hint">internal</span>
                </dt>
                <dd>
                  <IdDisplay value={rev} />
                </dd>
              </>
            ) : null}
          </dl>
        )}
      </PageCard>
    </>
  )
}
