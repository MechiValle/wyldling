import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Modal } from '../Modal'
import { FoundCheckbox } from '../FoundCheckbox'
import { getImageUrl } from '../../lib/storage'
import { getReachedHearts, toggleHeartReached, getGiftedFoods, toggleFoodGifted } from '../../lib/progress'
import { getHeartLevelName } from '../../lib/heartLevels'
import { FoodDetailModal } from './FoodDetailModal'

type CharacterItem = {
  id: number
  name: string
  romanceable: boolean
  image_path: string | null
}

type FavoriteFood = {
  item_id: number
  items: { name: string; image_path: string | null } | null
}

type HeartLevel = {
  id: number
  level: number
  unlock_description: string | null
}

type Props = {
  character: CharacterItem
  onClose: () => void
}

export function CharacterDetailModal({ character, onClose }: Props) {
  const [favorites, setFavorites] = useState<FavoriteFood[]>([])
  const [hearts, setHearts] = useState<HeartLevel[]>([])
  const [loading, setLoading] = useState(true)
  const [reachedIds, setReachedIds] = useState<number[]>([])
  const [giftedIds, setGiftedIds] = useState<number[]>([])
  const [selectedFavorite, setSelectedFavorite] = useState<{ id: number; name: string; image_path: string | null } | null>(null)

  useEffect(() => {
    setReachedIds(getReachedHearts())
    setGiftedIds(getGiftedFoods())
  }, [])

  useEffect(() => {
    let active = true
    setFavorites([])
    setHearts([])
    setLoading(true)

    async function fetchData() {
      const [favoritesResult, heartsResult] = await Promise.all([
        supabase
          .from('character_favorite_gifts')
          .select('item_id, items(name, image_path)')
          .eq('character_id', character.id),
        supabase
          .from('character_heart_levels')
          .select('id, level, unlock_description')
          .eq('character_id', character.id)
          .order('level'),
      ])

      if (!active) return

      if (favoritesResult.error) {
        console.error(favoritesResult.error)
      } else {
        setFavorites(favoritesResult.data as unknown as FavoriteFood[])
      }

      if (heartsResult.error) {
        console.error(heartsResult.error)
      } else {
        setHearts(heartsResult.data as HeartLevel[])
      }

      setLoading(false)
    }
    fetchData()

    return () => { active = false }
  }, [character.id])

  function handleToggleHeart(id: number) {
    setReachedIds(toggleHeartReached(id))
  }

  function handleToggleGifted(itemId: number) {
    setGiftedIds(toggleFoodGifted(itemId))
  }

  return (
    <>
      <Modal onClose={onClose}>
        <img
          src={getImageUrl(character.image_path)}
          alt={character.name}
          className="w-24 h-24 object-contain rounded-xl mx-auto mb-2"
        />
        <h2 className="font-display text-2xl font-bold text-center mb-1">{character.name}</h2>
        {character.romanceable && (
          <p className="text-xs text-center mb-4 mx-auto w-fit px-2 py-0.5 rounded-full border border-marigold-harvest">
            Romanceable
          </p>
        )}

        {loading ? (
          <p className="text-center text-sm italic mt-6 mb-6">Loading...</p>
        ) : (
          <>
            <h3 className="font-display font-semibold mb-2">Favorite foods</h3>
            <div className="flex flex-wrap items-stretch justify-center gap-3 mb-4">
              {favorites.map((f) => (
                <div key={f.item_id} className="flex flex-col items-center justify-between w-16 gap-1">
                  <button
                    onClick={() => setSelectedFavorite({ id: f.item_id, name: f.items?.name ?? '', image_path: f.items?.image_path ?? null })}
                    className="flex flex-col items-center w-full"
                  >
                    <img
                      src={getImageUrl(f.items?.image_path ?? null)}
                      alt={f.items?.name ?? ''}
                      className="w-12 h-12 object-contain rounded-lg"
                    />
                    <span className="text-xs text-center w-full break-words leading-tight">{f.items?.name}</span>
                  </button>
                  <FoundCheckbox
                    checked={giftedIds.includes(f.item_id)}
                    onChange={() => handleToggleGifted(f.item_id)}
                  />
                </div>
              ))}
            </div>

            <h3 className="font-display font-semibold mb-2">Relationship milestones</h3>
            <div className="flex flex-col gap-3">
              {hearts.map((h, index) => (
                <div
                  key={h.id}
                  className={`flex items-start gap-3 ${index > 0 ? 'pt-3 border-t border-sage-meadow/20' : ''}`}
                >
                  <div className="mt-0.5">
                    <FoundCheckbox
                      checked={reachedIds.includes(h.id)}
                      onChange={() => handleToggleHeart(h.id)}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{getHeartLevelName(h.level)}</p>
                    <p className="text-sm">{h.unlock_description}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Modal>

      {selectedFavorite && (
        <FoodDetailModal item={selectedFavorite} onClose={() => setSelectedFavorite(null)} />
      )}
    </>
  )
}