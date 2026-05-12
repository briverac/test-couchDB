import type { ReactNode } from 'react'

/** Scroll wrapper used around `<table className="data-table">`. */
export function TableWrap({ children }: { children: ReactNode }) {
  return <div className="table-wrap">{children}</div>
}
