import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Card } from '../components/Card'
import { CardGrid } from '../components/CardGrid'
import { Modal } from '../components/Modal'
import { FoundCheckbox } from '../components/FoundCheckbox'
import { getImageUrl, preloadImages } from '../lib/storage'
import { getReachedHearts, toggleHeartReached, getGiftedFoods, toggleFoodGifted } from '../lib/progress'
import { getHeartLevelName } from '../lib/heartLevels'

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

export function Characters() {
  const [searchParams] = useSearchParams()
  const openId = searchParams.get('open')

  const [characters, setCharacters] = useState<CharacterItem[]>([])
  const [pageLoading, setPageLoading] = useState(true)

  const [selected, setSelected] = useState<CharacterItem | null>(null)
  const [favorites, setFavorites] = useState<FavoriteFood[]>([])
  const [hearts, setHearts] = useState<HeartLevel[]>([])
  const [modalLoading, setModalLoading] = useState(false)
  const [reachedIds, setReachedIds] = useState<number[]>([])
  const [giftedIds, setGiftedIds] = useState<number[]>([])

  const [selectedFavorite, setSelectedFavorite] = useState<FavoriteFood | null>(null)
  const [favUnlockMethod, setFavUnlockMethod] = useState<string | null>(null)
  const [favUnlockDetails, setFavUnlockDetails] = useState<string | null>(null)
  const [favModalLoading, setFavModalLoading] = useState(false)

  useEffect(() => {
    setReachedIds(getReachedHearts())
    setGiftedIds(getGiftedFoods())

    async function fetchCharacters() {
      setPageLoading(true)

      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .order('name')

      if (error) {
        console.error(error)
        setPageLoading(false)
        return
      }

      await preloadImages(data.map((c) => getImageUrl(c.image_path)))

      setCharacters(data)
      setPageLoading(false)
    }
    fetchCharacters()
  }, [])

  async function openCharacter(character: CharacterItem) {
    setSelected(character)
    setFavorites([])
    setHearts([])
    setModalLoading(true)

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

    setModalLoading(false)
  }

  useEffect(() => {
    if (pageLoading || !openId) return
    const match = characters.find((c) => c.id === Number(openId))
    if (match) openCharacter(match)
  }, [pageLoading, characters, openId])

  async function openFavoriteFood(favorite: FavoriteFood) {
    setSelectedFavorite(favorite)
    setFavUnlockMethod(null)
    setFavUnlockDetails(null)
    setFavModalLoading(true)

    const { data, error } = await supabase
      .from('food_details')
      .select('unlock_method, unlock_details')
      .eq('item_id', favorite.item_id)
      .maybeSingle()

    if (error) {
      console.error(error)
    } else {
      setFavUnlockMethod(data?.unlock_method ?? null)
      setFavUnlockDetails(data?.unlock_details ?? null)
    }

    setFavModalLoading(false)
  }

  function handleToggleHeart(id: number) {
    const updated = toggleHeartReached(id)
    setReachedIds(updated)
  }

  function handleToggleGifted(itemId: number) {
    const updated = toggleFoodGifted(itemId)
    setGiftedIds(updated)
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-4">Characters</h1>

      {pageLoading ? (
        <p className="text-center italic mt-10">Loading...</p>
      ) : (
        <CardGrid>
          {characters.map((character) => (
            <Card
              key={character.id}
              name={character.name}
              image={getImageUrl(character.image_path)}
              category="character"
              onClick={() => openCharacter(character)}
            />
          ))}
        </CardGrid>
      )}

      {selected && (
        <Modal onClose={() => setSelected(null)}>
          <img
            src={getImageUrl(selected.image_path)}
            alt={selected.name}
            className="w-24 h-24 object-contain rounded-xl mx-auto mb-2"
          />
          <h2 className="font-display text-2xl font-bold text-center mb-1">{selected.name}</h2>
          {selected.romanceable && (
            <p className="text-xs text-center mb-4 mx-auto w-fit px-2 py-0.5 rounded-full border border-marigold-harvest">
              Romanceable
            </p>
          )}

          {modalLoading ? (
            <p className="text-center text-sm italic mt-6 mb-6">Loading...</p>
          ) : (
            <>
              <h3 className="font-display font-semibold mb-2">Favorite foods</h3>
              <div className="flex flex-wrap items-stretch justify-center gap-3 mb-4">
                {favorites.map((f) => (
                  <div key={f.item_id} className="flex flex-col items-center justify-between w-16 gap-1">
                    <button
                      onClick={() => openFavoriteFood(f)}
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
      )}

      {selectedFavorite && (
        <Modal onClose={() => setSelectedFavorite(null)}>
          <img
            src={getImageUrl(selectedFavorite.items?.image_path ?? null)}
            alt={selectedFavorite.items?.name ?? ''}
            className="w-24 h-24 object-contain rounded-xl mx-auto mb-2"
          />
          <h2 className="font-display text-2xl font-bold text-center mb-4">{selectedFavorite.items?.name}</h2>

          {favModalLoading ? (
            <p className="text-center text-sm italic mt-6 mb-6">Loading...</p>
          ) : (
            <>
              <h3 className="font-display font-semibold mb-2">How to obtain it</h3>
              <p className="text-sm">
                {favUnlockMethod ?? 'Unknown'}
                {favUnlockDetails ? ` — ${favUnlockDetails}` : ''}
              </p>
            </>
          )}
        </Modal>
      )}
    </div>
  )
}