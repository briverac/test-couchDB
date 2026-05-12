import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

type BackLinkProps = {
  to: string
  children: ReactNode
}

export function BackLink({ to, children }: BackLinkProps) {
  return (
    <Link to={to} className="ghost-link">
      {children}
    </Link>
  )
}
