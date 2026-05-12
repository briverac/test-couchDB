import type { ReactNode } from 'react'

type PageCardProps = {
  title: string
  /** Right side of the card header (links, actions, refresh). */
  headerAside?: ReactNode
  children: ReactNode
  /** e.g. bottom “Refresh” on list pages */
  footer?: ReactNode
}

export function PageCard({ title, headerAside, children, footer }: PageCardProps) {
  return (
    <section className="card">
      <div className="card-head">
        <h2>{title}</h2>
        {headerAside ?? null}
      </div>
      {children}
      {footer != null ? footer : null}
    </section>
  )
}
