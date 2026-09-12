import type { ReactNode } from 'react'

export function CardGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,160px))] justify-center gap-4">
      {children}
    </div>
  )
}