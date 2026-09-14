import { useState } from 'react'

export function useHideCompleted(storageKey: string) {
  const [hideCompleted, setHideCompleted] = useState<boolean>(() => {
    return localStorage.getItem(storageKey) === 'true'
  })

  function toggle() {
    setHideCompleted((prev) => {
      const next = !prev
      localStorage.setItem(storageKey, String(next))
      return next
    })
  }

  return { hideCompleted, toggle }
}