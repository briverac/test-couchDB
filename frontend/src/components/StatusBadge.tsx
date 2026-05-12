const VARIANT_CLASS: Record<string, string> = {
  pending: 'pill--pending',
  'in-review': 'pill--processing',
  done: 'pill--success',
}

type StatusBadgeProps = {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const key = status.trim().toLowerCase().replace(/\s+/g, '-')
  const extra = VARIANT_CLASS[key]
  return <span className={extra ? `pill ${extra}` : 'pill'}>{status}</span>
}
