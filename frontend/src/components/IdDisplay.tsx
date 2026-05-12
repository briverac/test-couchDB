type IdDisplayProps = {
  value: string
  /** Set false for short human-readable ids you always want to show in full. */
  truncate?: boolean
}

/** Only shorten long hex-like ids; keep enough head/tail to tell rows apart. */
const PREFIX = 14
const SUFFIX = 10
const MIN_LEN = 32

function shouldTruncate(value: string, truncate: boolean): boolean {
  if (!truncate || value.length < MIN_LEN) return false
  const compact = value.replace(/-/g, '')
  if (compact.length < MIN_LEN) return false
  return /^[\da-f]+$/i.test(compact)
}

export function IdDisplay({ value, truncate = true }: IdDisplayProps) {
  const shortened = shouldTruncate(value, truncate)
  const shown = shortened ? `${value.slice(0, PREFIX)}…${value.slice(-SUFFIX)}` : value
  return (
    <code className="id-chip" title={shortened ? value : undefined}>
      {shown}
    </code>
  )
}
