import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Card } from '../components/Card';
import { CardGrid } from '../components/CardGrid';
import { CategoryTabs } from '../components/CategoryTabs';
import { FishDetailModal } from '../components/detail-modals/FishDetailModal';
import { getImageUrl, preloadImages } from '../lib/storage';
import { getCaughtFish, toggleFishCaught } from '../lib/progress';
import type { Item } from '../types/Item';
import { useHideCompleted } from '../hooks/useHideCompleted';
import { HideCompletedToggle } from '../components/HideCompletedToggle';

type FishWithLocations = Item & { locationNames: string[] };

export function Fish() {
  const [fish, setFish] = useState<FishWithLocations[]>([]);
  const [locationOptions, setLocationOptions] = useState<string[]>(['All']);
  const [activeLocation, setActiveLocation] = useState('All');
  const [pageLoading, setPageLoading] = useState(true);
  const [selected, setSelected] = useState<Item | null>(null);
  const [caughtIds, setCaughtIds] = useState<number[]>([]);
  const { hideCompleted, toggle: toggleHideCompleted } = useHideCompleted(
    'wyldling-hide-completed-fish',
  );

  useEffect(() => {
    setCaughtIds(getCaughtFish());

    async function fetchFish() {
      setPageLoading(true);

      const { data: fishItems, error: fishError } = await supabase
        .from('items')
        .select('*')
        .eq('category', 'fish')
        .order('name');

      if (fishError) {
        console.error(fishError);
        setPageLoading(false);
        return;
      }

      const { data: availabilityRows, error: availError } = await supabase
        .from('fish_availability')
        .select('fish_item_id, locations(name)');

      if (availError) {
        console.error(availError);
        setPageLoading(false);
        return;
      }

      const locationsByFish = new Map<number, Set<string>>();
      const allLocations = new Set<string>();

      for (const row of availabilityRows as unknown as {
        fish_item_id: number;
        locations: { name: string } | null;
      }[]) {
        const locationName = row.locations?.name;
        if (!locationName) continue;
        allLocations.add(locationName);
        if (!locationsByFish.has(row.fish_item_id)) {
          locationsByFish.set(row.fish_item_id, new Set());
        }
        locationsByFish.get(row.fish_item_id)!.add(locationName);
      }

      const fishWithLocations: FishWithLocations[] = fishItems.map((item) => ({
        ...item,
        locationNames: Array.from(locationsByFish.get(item.id) ?? []),
      }));

      await preloadImages(
        fishWithLocations.map((item) => getImageUrl(item.image_path)),
      );

      setFish(fishWithLocations);
      setLocationOptions(['All', ...Array.from(allLocations).sort()]);
      setPageLoading(false);
    }
    fetchFish();
  }, []);

  function handleToggleCaught(id: number) {
    setCaughtIds(toggleFishCaught(id));
  }

  const visibleFish = fish
    .filter(
      (item) =>
        activeLocation === 'All' || item.locationNames.includes(activeLocation),
    )
    .filter((item) => !hideCompleted || !caughtIds.includes(item.id));

  return (
    <div>
      <h1 className='font-display text-3xl font-bold mb-4'>Fish</h1>

      {pageLoading ? (
        <p className='text-center italic mt-10'>Loading...</p>
      ) : (
        <>
          <CategoryTabs
            options={locationOptions}
            active={activeLocation}
            onChange={setActiveLocation}
          />

          <HideCompletedToggle
            checked={hideCompleted}
            onChange={toggleHideCompleted}
            label='Hide already caught'
          />

          <CardGrid>
            {visibleFish.map((item) => (
              <Card
                key={item.id}
                name={item.name}
                image={getImageUrl(item.image_path)}
                category='fish'
                onClick={() => setSelected(item)}
                checked={caughtIds.includes(item.id)}
                onToggleChecked={() => handleToggleCaught(item.id)}
              />
            ))}
          </CardGrid>
        </>
      )}

      {selected && (
        <FishDetailModal item={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
