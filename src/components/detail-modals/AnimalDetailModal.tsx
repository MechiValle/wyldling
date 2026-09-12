import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Modal } from '../Modal'
import { getImageUrl } from '../../lib/storage'
import type { Item } from '../../types/Item'

type BreedingRow = {
  id: number
  color: string
  produce: string
  seasons: { name: string } | null
}

const SEASON_ORDER = ['Spring', 'Summer', 'Fall', 'Winter']

type Props = {
  animal: Item
  onClose: () => void
}

export function AnimalDetailModal({ animal, onClose }: Props) {
  const [rows, setRows] = useState<BreedingRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setRows([])
    setLoading(true)

    async function fetchData() {
      const { data, error } = await supabase
        .from('animal_breeding')
        .select('id, color, produce, seasons(name)')
        .eq('item_id', animal.id)

      if (!active) return

      if (error) {
        console.error(error)
      } else {
        const sorted = (data as unknown as BreedingRow[]).sort(
          (a, b) => SEASON_ORDER.indexOf(a.seasons?.name ?? '') - SEASON_ORDER.indexOf(b.seasons?.name ?? '')
        )
        setRows(sorted)
      }
      setLoading(false)
    }
    fetchData()

    return () => { active = false }
  }, [animal.id])

  return (
    <Modal onClose={onClose}>
      <img
        src={getImageUrl(animal.image_path)}
        alt={animal.name}
        className="w-24 h-24 object-contain rounded-xl mx-auto mb-2"
      />
      <h2 className="font-display text-2xl font-bold text-center mb-4">{animal.name}</h2>

      {loading ? (
        <p className="text-center text-sm italic mt-6 mb-6">Loading...</p>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((row, index) => (
            <div key={row.id} className={index > 0 ? 'pt-3 border-t border-sage-meadow/20' : ''}>
              <p className="text-sm"><span className="font-semibold">Season:</span> {row.seasons?.name}</p>
              <p className="text-sm"><span className="font-semibold">Color:</span> {row.color}</p>
              <p className="text-sm"><span className="font-semibold">Produce:</span> {row.produce}</p>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}