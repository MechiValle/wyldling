import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Modal } from '../Modal'
import { getImageUrl } from '../../lib/storage'
import type { Item } from '../../types/Item'

type MaterialRow = {
  material_item_id: number
  quantity: number
  items: { name: string; image_path: string | null } | null
}

type Props = {
  outfit: Item
  onClose: () => void
  table?: 'outfit_materials' | 'hairstyle_materials'
  foreignKeyColumn?: 'outfit_item_id' | 'hairstyle_item_id'
}

export function OutfitDetailModal({
  outfit,
  onClose,
  table = 'outfit_materials',
  foreignKeyColumn = 'outfit_item_id',
}: Props) {
  const [materials, setMaterials] = useState<MaterialRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setMaterials([])
    setLoading(true)

    async function fetchData() {
      const { data, error } = await supabase
        .from(table)
        .select('material_item_id, quantity, items!material_item_id(name, image_path)')
        .eq(foreignKeyColumn, outfit.id)

      if (!active) return

      if (error) {
        console.error(error)
      } else {
        setMaterials(data as unknown as MaterialRow[])
      }
      setLoading(false)
    }
    fetchData()

    return () => { active = false }
  }, [outfit.id, table, foreignKeyColumn])

  return (
    <Modal onClose={onClose}>
      <img
        src={getImageUrl(outfit.image_path)}
        alt={outfit.name}
        className="w-24 h-40 object-contain rounded-xl mx-auto mb-2"
      />
      <h2 className="font-display text-2xl font-bold text-center mb-4">{outfit.name}</h2>

      {loading ? (
        <p className="text-center text-sm italic mt-6 mb-6">Loading...</p>
      ) : (
        <>
          <h3 className="font-display font-semibold mb-2">Materials needed</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {materials.map((m) => (
              <div key={m.material_item_id} className="flex flex-col items-center w-16">
                <img
                  src={getImageUrl(m.items?.image_path ?? null)}
                  alt={m.items?.name ?? ''}
                  className="w-12 h-12 object-contain rounded-lg"
                />
                <span className="text-xs text-center w-full break-words leading-tight">{m.items?.name}</span>
                <span className="text-xs font-semibold text-marigold-harvest">×{m.quantity}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </Modal>
  )
}