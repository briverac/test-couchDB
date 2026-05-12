import type { ReactNode } from 'react'

type RowActionsProps = {
  children: ReactNode
  /** List pages stack links/buttons; single control uses inline layout. */
  stack?: boolean
  /** Align the action group inside the cell (default matches right-aligned tables). */
  align?: 'end' | 'center'
  /** Narrower column when there are only one or two controls (e.g. patient list). */
  compact?: boolean
}

export function RowActions({ children, stack = true, align = 'end', compact = false }: RowActionsProps) {
  const cellClass = [
    'actions',
    'actions--row',
    !stack && 'actions--narrow',
    align === 'center' && 'actions--center',
    compact && 'actions--compact',
  ]
    .filter(Boolean)
    .join(' ')
  const groupClass = ['action-group', align === 'center' && 'action-group--center'].filter(Boolean).join(' ')
  return (
    <td className={cellClass}>
      <div className={groupClass}>{children}</div>
    </td>
  )
}
