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

const FOOD_STORAGE_KEY = 'wyldling-found-recipes'

export function getFoundRecipes(): number[] {
  const stored = localStorage.getItem(FOOD_STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

export function isRecipeFound(id: number): boolean {
  return getFoundRecipes().includes(id)
}

export function toggleRecipeFound(id: number): number[] {
  const current = getFoundRecipes()
  const updated = current.includes(id)
    ? current.filter((x) => x !== id)
    : [...current, id]
  localStorage.setItem(FOOD_STORAGE_KEY, JSON.stringify(updated))
  return updated
}

export function resetFoundRecipes(): void {
  localStorage.removeItem(FOOD_STORAGE_KEY)
}

const HEART_STORAGE_KEY = 'wyldling-reached-hearts'

export function getReachedHearts(): number[] {
  const stored = localStorage.getItem(HEART_STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

export function isHeartReached(id: number): boolean {
  return getReachedHearts().includes(id)
}

export function toggleHeartReached(id: number): number[] {
  const current = getReachedHearts()
  const updated = current.includes(id)
    ? current.filter((x) => x !== id)
    : [...current, id]
  localStorage.setItem(HEART_STORAGE_KEY, JSON.stringify(updated))
  return updated
}

export function resetReachedHearts(): void {
  localStorage.removeItem(HEART_STORAGE_KEY)
}

const GIFTED_STORAGE_KEY = 'wyldling-gifted-foods'

export function getGiftedFoods(): number[] {
  const stored = localStorage.getItem(GIFTED_STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

export function toggleFoodGifted(itemId: number): number[] {
  const current = getGiftedFoods()
  const updated = current.includes(itemId)
    ? current.filter((x) => x !== itemId)
    : [...current, itemId]
  localStorage.setItem(GIFTED_STORAGE_KEY, JSON.stringify(updated))
  return updated
}

export function resetGiftedFoods(): void {
  localStorage.removeItem(GIFTED_STORAGE_KEY)
}