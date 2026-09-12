import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Card } from '../components/Card';
import { CardGrid } from '../components/CardGrid';
import { CategoryTabs } from '../components/CategoryTabs';
import { ShopDetailModal } from '../components/detail-modals/ShopDetailModal';
import { getImageUrl, preloadImages } from '../lib/storage';

type ShopItem = {
  id: number;
  name: string;
  owner_character_id: number;
  characters: { name: string; image_path: string | null } | null;
};

type ShopHour = {
  id: number;
  shop_id: number;
  day_of_week: string;
};

const DAYS = [
  { full: 'Monday', short: 'Mon' },
  { full: 'Tuesday', short: 'Tue' },
  { full: 'Wednesday', short: 'Wed' },
  { full: 'Thursday', short: 'Thu' },
  { full: 'Friday', short: 'Fri' },
  { full: 'Saturday', short: 'Sat' },
  { full: 'Sunday', short: 'Sun' },
];

export function Shops() {
  const [view, setView] = useState('Shops');
  const [shops, setShops] = useState<ShopItem[]>([]);
  const [allHours, setAllHours] = useState<ShopHour[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [selected, setSelected] = useState<ShopItem | null>(null);

  useEffect(() => {
    async function fetchShops() {
      setPageLoading(true);

      const { data: shopsData, error: shopsError } = await supabase
        .from('shops')
        .select('*, characters(name, image_path)')
        .order('name');

      if (shopsError) {
        console.error(shopsError);
        setPageLoading(false);
        return;
      }

      const { data: hoursData, error: hoursError } = await supabase
        .from('shop_hours')
        .select('id, shop_id, day_of_week');

      if (hoursError) {
        console.error(hoursError);
        setPageLoading(false);
        return;
      }

      const shopData = shopsData as unknown as ShopItem[];
      await preloadImages(
        shopData.map((s) => getImageUrl(s.characters?.image_path ?? null)),
      );

      setShops(shopData);
      setAllHours(hoursData as ShopHour[]);
      setPageLoading(false);
    }
    fetchShops();
  }, []);

  function isOpenOn(shopId: number, dayFull: string): boolean {
    return allHours.some(
      (h) => h.shop_id === shopId && h.day_of_week === dayFull,
    );
  }

  return (
    <div>
      <h1 className='font-display text-3xl font-bold mb-4'>Shops</h1>

      {pageLoading ? (
        <p className='text-center italic mt-10'>Loading...</p>
      ) : (
        <>
          <CategoryTabs
            options={['Shops', 'Schedule']}
            active={view}
            onChange={setView}
          />

          {view === 'Shops' && (
            <CardGrid>
              {shops.map((shop) => (
                <Card
                  key={shop.id}
                  name={shop.name}
                  image={getImageUrl(shop.characters?.image_path ?? null)}
                  category='shop'
                  onClick={() => setSelected(shop)}
                />
              ))}
            </CardGrid>
          )}

          {view === 'Schedule' && (
            <div className='overflow-x-auto flex justify-center'>
              <div className='inline-grid grid-cols-[220px_repeat(7,48px)] gap-y-2'>
                <div className='sticky left-0 bg-oat-linen dark:bg-twilight-plum' />
                {DAYS.map((day) => (
                  <div
                    key={day.short}
                    className='text-center font-display text-sm font-semibold pb-2'
                  >
                    {day.short}
                  </div>
                ))}

                {shops.map((shop) => (
                  <div key={shop.id} className='contents'>
                    <div className='sticky left-0 bg-oat-linen dark:bg-twilight-plum text-sm font-body flex items-center pr-3 leading-tight'>
                      {shop.name}
                    </div>
                    {DAYS.map((day) => (
                      <div
                        key={day.short}
                        className='flex items-center justify-center py-0.5'
                      >
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
        <ShopDetailModal shop={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
