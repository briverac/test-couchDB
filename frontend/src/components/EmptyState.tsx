import type { CSSProperties, ReactNode } from 'react'

type EmptyStateProps = {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export function EmptyState({ children, className, style }: EmptyStateProps) {
  const cls = ['muted', className].filter(Boolean).join(' ')
  return (
    <p className={cls} style={style}>
      {children}
    </p>
  )
}
