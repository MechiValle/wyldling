import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Card } from '../components/Card'
import { CardGrid } from '../components/CardGrid'
import { CharacterDetailModal } from '../components/detail-modals/CharacterDetailModal'
import { getImageUrl, preloadImages } from '../lib/storage'

type CharacterItem = {
  id: number
  name: string
  romanceable: boolean
  image_path: string | null
}

export function Characters() {
  const [characters, setCharacters] = useState<CharacterItem[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [selected, setSelected] = useState<CharacterItem | null>(null)

  useEffect(() => {
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
              onClick={() => setSelected(character)}
            />
          ))}
        </CardGrid>
      )}

      {selected && <CharacterDetailModal character={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}