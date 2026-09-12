import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Modal } from '../Modal'
import { getImageUrl } from '../../lib/storage'
import { formatTime } from '../../lib/formatTime'

type ShopItem = {
  id: number
  name: string
  characters: { name: string; image_path: string | null } | null
}

type ShopHour = {
  id: number
  day_of_week: string
  open_time: string
  close_time: string
}

const DAYS = [
  { full: 'Monday', short: 'Mon' },
  { full: 'Tuesday', short: 'Tue' },
  { full: 'Wednesday', short: 'Wed' },
  { full: 'Thursday', short: 'Thu' },
  { full: 'Friday', short: 'Fri' },
  { full: 'Saturday', short: 'Sat' },
  { full: 'Sunday', short: 'Sun' },
]

type Props = {
  shop: ShopItem
  onClose: () => void
}

export function ShopDetailModal({ shop, onClose }: Props) {
  const [hours, setHours] = useState<ShopHour[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setHours([])
    setLoading(true)

    async function fetchData() {
      const { data, error } = await supabase
        .from('shop_hours')
        .select('*')
        .eq('shop_id', shop.id)

      if (!active) return

      if (error) {
        console.error(error)
      } else {
        const sorted = [...data].sort(
          (a, b) => DAYS.findIndex((d) => d.full === a.day_of_week) - DAYS.findIndex((d) => d.full === b.day_of_week)
        )
        setHours(sorted)
      }
      setLoading(false)
    }
    fetchData()

    return () => { active = false }
  }, [shop.id])

  return (
    <Modal onClose={onClose}>
      <img
        src={getImageUrl(shop.characters?.image_path ?? null)}
        alt={shop.characters?.name ?? ''}
        className="w-24 h-24 object-contain rounded-xl mx-auto mb-2"
      />
      <h2 className="font-display text-2xl font-bold text-center mb-1">{shop.name}</h2>
      {shop.characters?.name && (
        <p className="text-sm text-center mb-4">
          <span className="font-semibold">Owner:</span> {shop.characters.name}
        </p>
      )}

      {loading ? (
        <p className="text-center text-sm italic mt-6 mb-6">Loading...</p>
      ) : (
        <>
          <h3 className="font-display font-semibold mb-2">Weekly hours</h3>
          <div className="flex flex-col gap-1">
            {DAYS.map((day) => {
              const dayHours = hours.find((h) => h.day_of_week === day.full)
              return (
                <div key={day.full} className="flex justify-between text-sm py-1 border-b border-sage-meadow/20">
                  <span className="font-semibold">{day.full}</span>
                  <span>
                    {dayHours
                      ? `${formatTime(dayHours.open_time)} – ${formatTime(dayHours.close_time)}`
                      : 'Closed'}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </Modal>
  )
}