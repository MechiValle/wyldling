import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Modal } from '../Modal'
import { getImageUrl } from '../../lib/storage'
import type { Item } from '../../types/Item'

type AvailabilityRow = {
  id: number
  locations: { name: string } | null
  bait_types: { name: string } | null
  weather_types: { name: string } | null
  day_periods: { name: string } | null
}

type Props = {
  item: Item
  onClose: () => void
}

export function FishDetailModal({ item, onClose }: Props) {
  const [availability, setAvailability] = useState<AvailabilityRow[]>([])
  const [shape, setShape] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setAvailability([])
    setShape(null)
    setLoading(true)

    async function fetchData() {
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

      if (!active) return

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

      setLoading(false)
    }
    fetchData()

    return () => { active = false }
  }, [item.id])

  const fixedLocation = availability[0]?.locations?.name ?? null

  return (
    <Modal onClose={onClose}>
      <img
        src={getImageUrl(item.image_path)}
        alt={item.name}
        className="w-24 h-24 object-contain rounded-xl mx-auto mb-2"
      />
      <h2 className="font-display text-2xl font-bold text-center mb-1">{item.name}</h2>

      {loading ? (
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
  )
}