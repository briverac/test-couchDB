/** Inline error from API or validation; renders nothing when `message` is empty. */
export function AlertBanner({ message }: { message: string | null | undefined }) {
  if (!message) return null
  return (
    <p className="banner error" role="alert">
      {message}
    </p>
  )
}
