import { createContext, useContext, useState, type ReactNode } from 'react'
import { getGiftedFoods, toggleFoodGifted } from '../lib/progress'

type GiftedFoodsContextType = {
  giftedIds: number[]
  toggleGifted: (itemId: number) => void
  refresh: () => void
}

const GiftedFoodsContext = createContext<GiftedFoodsContextType | undefined>(undefined)

export function GiftedFoodsProvider({ children }: { children: ReactNode }) {
  const [giftedIds, setGiftedIds] = useState<number[]>(() => getGiftedFoods())

  function toggleGifted(itemId: number) {
    setGiftedIds(toggleFoodGifted(itemId))
  }

  function refresh() {
    setGiftedIds(getGiftedFoods())
  }

  return (
    <GiftedFoodsContext.Provider value={{ giftedIds, toggleGifted, refresh }}>
      {children}
    </GiftedFoodsContext.Provider>
  )
}

export function useGiftedFoods() {
  const context = useContext(GiftedFoodsContext)
  if (!context) throw new Error('useGiftedFoods must be used within a GiftedFoodsProvider')
  return context
}