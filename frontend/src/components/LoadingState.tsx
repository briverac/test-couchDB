import { EmptyState } from './EmptyState'

export function LoadingState({ text = 'Loading…' }: { text?: string }) {
  return <EmptyState>{text}</EmptyState>
}
