import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Card } from '../components/Card'
import { CardGrid } from '../components/CardGrid'
import { Modal } from '../components/Modal'
import { CategoryTabs } from '../components/CategoryTabs'
import { getImageUrl, preloadImages } from '../lib/storage'
import type { Item } from '../types/Item'

type BreedingRow = {
  id: number
  item_id: number
  color: string
  produce: string
  seasons: { name: string } | null
}

const SEASON_ORDER = ['Spring', 'Summer', 'Fall', 'Winter']

export function Animals() {
  const [searchParams] = useSearchParams()
  const openId = searchParams.get('open')

  const [view, setView] = useState('Animals')
  const [animals, setAnimals] = useState<Item[]>([])
  const [allBreeding, setAllBreeding] = useState<BreedingRow[]>([])
  const [pageLoading, setPageLoading] = useState(true)

  const [selected, setSelected] = useState<Item | null>(null)
  const [modalRows, setModalRows] = useState<BreedingRow[]>([])
  const [modalLoading, setModalLoading] = useState(false)

  useEffect(() => {
    async function fetchAnimals() {
      setPageLoading(true)

      const { data: animalItems, error: animalError } = await supabase
        .from('items')
        .select('*')
        .eq('category', 'animal')
        .order('name')

      if (animalError) {
        console.error(animalError)
        setPageLoading(false)
        return
      }

      const { data: breedingData, error: breedingError } = await supabase
        .from('animal_breeding')
        .select('id, item_id, color, produce, seasons(name)')

      if (breedingError) {
        console.error(breedingError)
        setPageLoading(false)
        return
      }

      await preloadImages(animalItems.map((a) => getImageUrl(a.image_path)))

      setAnimals(animalItems)
      setAllBreeding(breedingData as unknown as BreedingRow[])
      setPageLoading(false)
    }
    fetchAnimals()
  }, [])

  function openAnimal(animal: Item) {
    setSelected(animal)
    setModalLoading(true)

    const rows = allBreeding
      .filter((r) => r.item_id === animal.id)
      .sort((a, b) => SEASON_ORDER.indexOf(a.seasons?.name ?? '') - SEASON_ORDER.indexOf(b.seasons?.name ?? ''))

    setModalRows(rows)
    setModalLoading(false)
  }

  useEffect(() => {
    if (pageLoading || !openId) return
    const match = animals.find((a) => a.id === Number(openId))
    if (match) openAnimal(match)
  }, [pageLoading, animals, openId])

  function getCell(animalId: number, seasonName: string): BreedingRow | undefined {
    return allBreeding.find((r) => r.item_id === animalId && r.seasons?.name === seasonName)
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-4">Animals</h1>

      {pageLoading ? (
        <p className="text-center italic mt-10">Loading...</p>
      ) : (
        <>
          <CategoryTabs options={['Animals', 'Breeding Chart']} active={view} onChange={setView} />

          {view === 'Animals' && (
            <CardGrid>
              {animals.map((animal) => (
                <Card
                  key={animal.id}
                  name={animal.name}
                  image={getImageUrl(animal.image_path)}
                  category="animal"
                  onClick={() => openAnimal(animal)}
                />
              ))}
            </CardGrid>
          )}

          {view === 'Breeding Chart' && (
            <div className="overflow-x-auto">
              <div className="inline-grid grid-cols-[140px_repeat(4,120px)] gap-y-2 min-w-full">
                <div className="sticky left-0 bg-oat-linen dark:bg-twilight-plum" />
                {SEASON_ORDER.map((season) => (
                  <div key={season} className="text-center font-display text-sm font-semibold pb-2">
                    {season}
                  </div>
                ))}

                {animals.map((animal) => (
                  <div key={animal.id} className="contents">
                    <div className="sticky left-0 bg-oat-linen dark:bg-twilight-plum text-sm font-body flex items-center pr-3">
                      {animal.name}
                    </div>
                    {SEASON_ORDER.map((season) => {
                      const cell = getCell(animal.id, season)
                      return (
                        <div key={season} className="flex items-center justify-center py-1">
                          <span className="text-sm text-center border-2 border-dusky-lavender rounded-lg px-2 py-1 w-28">
                            {cell?.color ?? '—'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {selected && (
        <Modal onClose={() => setSelected(null)}>
          <img
            src={getImageUrl(selected.image_path)}
            alt={selected.name}
            className="w-24 h-24 object-contain rounded-xl mx-auto mb-2"
          />
          <h2 className="font-display text-2xl font-bold text-center mb-4">{selected.name}</h2>

          {modalLoading ? (
            <p className="text-center text-sm italic mt-6 mb-6">Loading...</p>
          ) : (
            <div className="flex flex-col gap-3">
              {modalRows.map((row, index) => (
                <div key={row.id} className={index > 0 ? 'pt-3 border-t border-sage-meadow/20' : ''}>
                  <p className="text-sm"><span className="font-semibold">Season:</span> {row.seasons?.name}</p>
                  <p className="text-sm"><span className="font-semibold">Color:</span> {row.color}</p>
                  <p className="text-sm"><span className="font-semibold">Produce:</span> {row.produce}</p>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}