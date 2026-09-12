import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Card } from '../components/Card'
import { CardGrid } from '../components/CardGrid'
import { Modal } from '../components/Modal'
import { CategoryTabs } from '../components/CategoryTabs'
import { getImageUrl, preloadImages } from '../lib/storage'
import { formatTime } from '../lib/formatTime'

type ShopItem = {
  id: number
  name: string
  owner_character_id: number
  characters: { name: string; image_path: string | null } | null
}

type ShopHour = {
  id: number
  shop_id: number
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

export function Shops() {
  const [searchParams] = useSearchParams()
  const openId = searchParams.get('open')

  const [view, setView] = useState('Shops')
  const [shops, setShops] = useState<ShopItem[]>([])
  const [allHours, setAllHours] = useState<ShopHour[]>([])
  const [pageLoading, setPageLoading] = useState(true)

  const [selected, setSelected] = useState<ShopItem | null>(null)
  const [modalHours, setModalHours] = useState<ShopHour[]>([])
  const [modalLoading, setModalLoading] = useState(false)

  useEffect(() => {
    async function fetchShops() {
      setPageLoading(true)

      const { data: shopsData, error: shopsError } = await supabase
        .from('shops')
        .select('*, characters(name, image_path)')
        .order('name')

      if (shopsError) {
        console.error(shopsError)
        setPageLoading(false)
        return
      }

      const { data: hoursData, error: hoursError } = await supabase
        .from('shop_hours')
        .select('*')

      if (hoursError) {
        console.error(hoursError)
        setPageLoading(false)
        return
      }

      const shopData = shopsData as unknown as ShopItem[]
      await preloadImages(shopData.map((s) => getImageUrl(s.characters?.image_path ?? null)))

      setShops(shopData)
      setAllHours(hoursData as ShopHour[])
      setPageLoading(false)
    }
    fetchShops()
  }, [])

  function openShop(shop: ShopItem) {
    setSelected(shop)
    setModalLoading(true)

    const shopHours = allHours
      .filter((h) => h.shop_id === shop.id)
      .sort((a, b) => DAYS.findIndex((d) => d.full === a.day_of_week) - DAYS.findIndex((d) => d.full === b.day_of_week))

    setModalHours(shopHours)
    setModalLoading(false)
  }

  useEffect(() => {
    if (pageLoading || !openId) return
    const match = shops.find((s) => s.id === Number(openId))
    if (match) openShop(match)
  }, [pageLoading, shops, openId])

  function isOpenOn(shopId: number, dayFull: string): boolean {
    return allHours.some((h) => h.shop_id === shopId && h.day_of_week === dayFull)
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-4">Shops</h1>

      {pageLoading ? (
        <p className="text-center italic mt-10">Loading...</p>
      ) : (
        <>
          <CategoryTabs options={['Shops', 'Schedule']} active={view} onChange={setView} />

          {view === 'Shops' && (
            <CardGrid>
              {shops.map((shop) => (
                <Card
                  key={shop.id}
                  name={shop.name}
                  image={getImageUrl(shop.characters?.image_path ?? null)}
                  category="shop"
                  onClick={() => openShop(shop)}
                />
              ))}
            </CardGrid>
          )}

          {view === 'Schedule' && (
            <div className="overflow-x-auto">
              <div className="inline-grid grid-cols-[220px_repeat(7,48px)] gap-y-2 min-w-full">
                <div className="sticky left-0 bg-oat-linen dark:bg-twilight-plum" />
                {DAYS.map((day) => (
                  <div key={day.short} className="text-center font-display text-sm font-semibold pb-2">
                    {day.short}
                  </div>
                ))}

                {shops.map((shop) => (
                  <div key={shop.id} className="contents">
                    <div className="sticky left-0 bg-oat-linen dark:bg-twilight-plum text-sm font-body flex items-center pr-3 leading-tight">
                      {shop.name}
                    </div>
                    {DAYS.map((day) => (
                      <div key={day.short} className="flex items-center justify-center py-0.5">
                        <div
                          className={`w-9 h-5 rounded ${
                            isOpenOn(shop.id, day.full)
                              ? 'bg-sage-meadow'
                              : 'bg-bramble-ink/30 dark:bg-black/40'
                          }`}
                        />
                      </div>
                    ))}
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
            src={getImageUrl(selected.characters?.image_path ?? null)}
            alt={selected.characters?.name ?? ''}
            className="w-24 h-24 object-contain rounded-xl mx-auto mb-2"
          />
          <h2 className="font-display text-2xl font-bold text-center mb-1">{selected.name}</h2>
          {selected.characters?.name && (
            <p className="text-sm text-center mb-4">
              <span className="font-semibold">Owner:</span> {selected.characters.name}
            </p>
          )}

          {modalLoading ? (
            <p className="text-center text-sm italic mt-6 mb-6">Loading...</p>
          ) : (
            <>
              <h3 className="font-display font-semibold mb-2">Weekly hours</h3>
              <div className="flex flex-col gap-1">
                {DAYS.map((day) => {
                  const dayHours = modalHours.find((h) => h.day_of_week === day.full)
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
      )}
    </div>
  )
}