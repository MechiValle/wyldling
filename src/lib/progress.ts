const STORAGE_KEY = 'wyldling-caught-fish'

export function getCaughtFish(): number[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

export function isFishCaught(id: number): boolean {
  return getCaughtFish().includes(id)
}

export function toggleFishCaught(id: number): number[] {
  const current = getCaughtFish()
  const updated = current.includes(id)
    ? current.filter((x) => x !== id)
    : [...current, id]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}

export function resetCaughtFish(): void {
  localStorage.removeItem(STORAGE_KEY)
}