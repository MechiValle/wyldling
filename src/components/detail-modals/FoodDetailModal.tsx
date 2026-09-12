import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Modal } from '../Modal'
import { getImageUrl } from '../../lib/storage'

type FoodItem = {
  id: number
  name: string
  image_path: string | null
}

type Props = {
  item: FoodItem
  onClose: () => void
}

export function FoodDetailModal({ item, onClose }: Props) {
  const [categoryName, setCategoryName] = useState<string | null>(null)
  const [unlockMethod, setUnlockMethod] = useState<string | null>(null)
  const [unlockDetails, setUnlockDetails] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setCategoryName(null)
    setUnlockMethod(null)
    setUnlockDetails(null)
    setLoading(true)

    async function fetchData() {
      const { data, error } = await supabase
        .from('food_details')
        .select('unlock_method, unlock_details, food_categories(name)')
        .eq('item_id', item.id)
        .maybeSingle()

      if (!active) return

      if (error) {
        console.error(error)
      } else {
        setUnlockMethod(data?.unlock_method ?? null)
        setUnlockDetails(data?.unlock_details ?? null)
        const cat = (data as unknown as { food_categories: { name: string } | null } | null)?.food_categories?.name
        setCategoryName(cat ?? null)
      }
      setLoading(false)
    }
    fetchData()

    return () => { active = false }
  }, [item.id])

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
          {categoryName && (
            <p className="text-sm text-center mb-4">
              <span className="font-semibold">Category:</span> {categoryName}
            </p>
          )}

          <h3 className="font-display font-semibold mb-2">How to obtain it</h3>
          <p className="text-sm">
            {unlockMethod ?? 'Unknown'}
            {unlockDetails ? ` — ${unlockDetails}` : ''}
          </p>
        </>
      )}
    </Modal>
  )
}