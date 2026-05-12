import type { ReactNode } from 'react'

type DangerZoneProps = {
  label?: string
  children: ReactNode
}

export function DangerZone({ label = 'Danger zone', children }: DangerZoneProps) {
  return (
    <>
      <p className="form-divider muted">{label}</p>
      {children}
    </>
  )
}
