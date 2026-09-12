import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Card } from '../components/Card'
import { CardGrid } from '../components/CardGrid'
import { Modal } from '../components/Modal'
import { CategoryTabs } from '../components/CategoryTabs'
import { getImageUrl, preloadImages } from '../lib/storage'
import { getCaughtFish, toggleFishCaught } from '../lib/progress'
import type { Item } from '../types/Item'

type AvailabilityRow = {
  id: number
  locations: { name: string } | null
  bait_types: { name: string } | null
  weather_types: { name: string } | null
  day_periods: { name: string } | null
}

type FishWithLocations = Item & { locationNames: string[] }

export function Fish() {
  const [searchParams] = useSearchParams()
  const openId = searchParams.get('open')

  const [fish, setFish] = useState<FishWithLocations[]>([])
  const [locationOptions, setLocationOptions] = useState<string[]>(['All'])
  const [activeLocation, setActiveLocation] = useState('All')
  const [pageLoading, setPageLoading] = useState(true)

  const [selected, setSelected] = useState<Item | null>(null)
  const [availability, setAvailability] = useState<AvailabilityRow[]>([])
  const [shape, setShape] = useState<string | null>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [caughtIds, setCaughtIds] = useState<number[]>([])

  useEffect(() => {
    setCaughtIds(getCaughtFish())

    async function fetchFish() {
      setPageLoading(true)

      const { data: fishItems, error: fishError } = await supabase
        .from('items')
        .select('*')
        .eq('category', 'fish')
        .order('name')

      if (fishError) {
        console.error(fishError)
        setPageLoading(false)
        return
      }

      const { data: availabilityRows, error: availError } = await supabase
        .from('fish_availability')
        .select('fish_item_id, locations(name)')

      if (availError) {
        console.error(availError)
        setPageLoading(false)
        return
      }

      const locationsByFish = new Map<number, Set<string>>()
      const allLocations = new Set<string>()

      for (const row of availabilityRows as unknown as { fish_item_id: number; locations: { name: string } | null }[]) {
        const locationName = row.locations?.name
        if (!locationName) continue
        allLocations.add(locationName)
        if (!locationsByFish.has(row.fish_item_id)) {
          locationsByFish.set(row.fish_item_id, new Set())
        }
        locationsByFish.get(row.fish_item_id)!.add(locationName)
      }

      const fishWithLocations: FishWithLocations[] = fishItems.map((item) => ({
        ...item,
        locationNames: Array.from(locationsByFish.get(item.id) ?? []),
      }))

      await preloadImages(fishWithLocations.map((item) => getImageUrl(item.image_path)))

      setFish(fishWithLocations)
      setLocationOptions(['All', ...Array.from(allLocations).sort()])
      setPageLoading(false)
    }
    fetchFish()
  }, [])

  async function openFish(item: Item) {
    setSelected(item)
    setAvailability([])
    setShape(null)
    setModalLoading(true)

    const [availabilityResult, shapeResult] = await Promise.all([
      supabase
        .from('fish_availability')
        .select('id, locations(name), bait_types(name), weather_types(name), day_periods(name)')
        .eq('fish_item_id', item.id),
      supabase
        .from('fish_details')
        .select('fish_shapes(name)')
        .eq('item_id', item.id)
        .maybeSingle(),
    ])

    if (availabilityResult.error) {
      console.error(availabilityResult.error)
    } else {
      setAvailability(availabilityResult.data as unknown as AvailabilityRow[])
    }

    if (shapeResult.error) {
      console.error(shapeResult.error)
    } else {
      const shapeData = shapeResult.data as unknown as { fish_shapes: { name: string } | null } | null
      setShape(shapeData?.fish_shapes?.name ?? null)
    }

    setModalLoading(false)
  }

  useEffect(() => {
    if (pageLoading || !openId) return
    const match = fish.find((f) => f.id === Number(openId))
    if (match) openFish(match)
  }, [pageLoading, fish, openId])

  function handleToggleCaught(id: number) {
    const updated = toggleFishCaught(id)
    setCaughtIds(updated)
  }

  const visibleFish =
    activeLocation === 'All'
      ? fish
      : fish.filter((item) => item.locationNames.includes(activeLocation))

  const fixedLocation = availability[0]?.locations?.name ?? null

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-4">Fish</h1>

      {pageLoading ? (
        <p className="text-center italic mt-10">Loading...</p>
      ) : (
        <>
          <CategoryTabs options={locationOptions} active={activeLocation} onChange={setActiveLocation} />

          <CardGrid>
            {visibleFish.map((item) => (
              <Card
                key={item.id}
                name={item.name}
                image={getImageUrl(item.image_path)}
                category="fish"
                onClick={() => openFish(item)}
                checked={caughtIds.includes(item.id)}
                onToggleChecked={() => handleToggleCaught(item.id)}
              />
            ))}
          </CardGrid>
        </>
      )}

      {selected && (
        <Modal onClose={() => setSelected(null)}>
          <img
            src={getImageUrl(selected.image_path)}
            alt={selected.name}
            className="w-24 h-24 object-contain rounded-xl mx-auto mb-2"
          />
          <h2 className="font-display text-2xl font-bold text-center mb-1">{selected.name}</h2>

          {modalLoading ? (
            <p className="text-center text-sm italic mt-6 mb-6">Loading...</p>
          ) : (
            <>
              <div className="text-sm text-center mb-4 flex flex-col gap-1">
                {shape && <p><span className="font-semibold">Shape:</span> {shape}</p>}
                {fixedLocation && <p><span className="font-semibold">Where:</span> {fixedLocation}</p>}
              </div>

              <h3 className="font-display font-semibold mb-2">Ways to catch it</h3>
              <div className="flex flex-col gap-3">
                {availability.map((row, index) => (
                  <div key={row.id} className={index > 0 ? 'pt-3 border-t border-sage-meadow/20' : ''}>
                    <p className="text-sm"><span className="font-semibold">Bait:</span> {row.bait_types?.name ?? 'Any'}</p>
                    {row.weather_types?.name && (
                      <p className="text-sm"><span className="font-semibold">Weather:</span> {row.weather_types.name}</p>
                    )}
                    {row.day_periods?.name && (
                      <p className="text-sm"><span className="font-semibold">Time:</span> {row.day_periods.name}</p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  )
}