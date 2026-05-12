type RefreshButtonProps = {
  onClick: () => void
  label?: string
}

export function RefreshButton({ onClick, label = 'Refresh' }: RefreshButtonProps) {
  return (
    <button type="button" className="ghost" onClick={onClick}>
      {label}
    </button>
  )
}
