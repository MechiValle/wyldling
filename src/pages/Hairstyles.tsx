import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Card } from '../components/Card';
import { CardGrid } from '../components/CardGrid';
import { CategoryTabs } from '../components/CategoryTabs';
import { HideCompletedToggle } from '../components/HideCompletedToggle';
import { OutfitDetailModal } from '../components/detail-modals/OutfitDetailModal';
import { getImageUrl, preloadImages } from '../lib/storage';
import {
  getUnlockedHairstyles,
  toggleHairstyleUnlocked,
} from '../lib/progress';
import { useHideCompleted } from '../hooks/useHideCompleted';
import type { Item } from '../types/Item';

type MaterialNeedRow = {
  hairstyle_item_id: number;
  material_item_id: number;
  quantity: number;
  items: { name: string; image_path: string | null } | null;
};

export function Hairstyles() {
  const [view, setView] = useState('Hairstyles');

  const [hairstyles, setHairstyles] = useState<Item[]>([]);
  const [allMaterials, setAllMaterials] = useState<MaterialNeedRow[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  const [selected, setSelected] = useState<Item | null>(null);
  const [unlockedIds, setUnlockedIds] = useState<number[]>([]);
  const { hideCompleted, toggle: toggleHideCompleted } = useHideCompleted(
    'wyldling-hide-completed-hairstyles',
  );

  useEffect(() => {
    setUnlockedIds(getUnlockedHairstyles());

    async function fetchHairstyles() {
      setPageLoading(true);

      const { data: hairstyleItems, error: hairstyleError } = await supabase
        .from('items')
        .select('*')
        .eq('category', 'hairstyle')
        .order('name');

      if (hairstyleError) {
        console.error(hairstyleError);
        setPageLoading(false);
        return;
      }

      const { data: materialsData, error: materialsError } = await supabase
        .from('hairstyle_materials')
        .select(
          'hairstyle_item_id, material_item_id, quantity, items!material_item_id(name, image_path)',
        );

      if (materialsError) {
        console.error(materialsError);
        setPageLoading(false);
        return;
      }

      await preloadImages(
        hairstyleItems.map((item) => getImageUrl(item.image_path)),
      );

      setHairstyles(hairstyleItems);
      setAllMaterials(materialsData as unknown as MaterialNeedRow[]);
      setPageLoading(false);
    }
    fetchHairstyles();
  }, []);

  function handleToggleUnlocked(id: number) {
    setUnlockedIds(toggleHairstyleUnlocked(id));
  }

  const visibleHairstyles = hairstyles.filter(
    (item) => !hideCompleted || !unlockedIds.includes(item.id),
  );

  const stillNeeded = (() => {
    const totals = new Map<
      number,
      { name: string; image_path: string | null; quantity: number }
    >();

    for (const row of allMaterials) {
      if (unlockedIds.includes(row.hairstyle_item_id)) continue;

      const existing = totals.get(row.material_item_id);
      if (existing) {
        existing.quantity += row.quantity;
      } else {
        totals.set(row.material_item_id, {
          name: row.items?.name ?? '',
          image_path: row.items?.image_path ?? null,
          quantity: row.quantity,
        });
      }
    }

    return Array.from(totals.entries())
      .map(([id, value]) => ({ id, ...value }))
      .sort((a, b) => a.name.localeCompare(b.name));
  })();

  return (
    <div>
      <h1 className='font-display text-3xl font-bold mb-4'>Hairstyles</h1>

      {pageLoading ? (
        <p className='text-center italic mt-10'>Loading...</p>
      ) : (
        <>
          <CategoryTabs
            options={['Hairstyles', 'Items still needed']}
            active={view}
            onChange={setView}
          />

          {view === 'Hairstyles' && (
            <>
              <HideCompletedToggle
                checked={hideCompleted}
                onChange={toggleHideCompleted}
                label='Hide already unlocked'
              />

              <CardGrid>
                {visibleHairstyles.map((item) => (
                  <Card
                    key={item.id}
                    name={item.name}
                    image={getImageUrl(item.image_path)}
                    category='material'
                    onClick={() => setSelected(item)}
                    checked={unlockedIds.includes(item.id)}
                    onToggleChecked={() => handleToggleUnlocked(item.id)}
                  />
                ))}
              </CardGrid>
            </>
          )}

          {view === 'Items still needed' && (
            <CardGrid>
              {stillNeeded.map((material) => (
                <Card
                  key={material.id}
                  name={material.name}
                  image={getImageUrl(material.image_path)}
                  category='material'
                  onClick={() => {}}
                  badge={material.quantity}
                />
              ))}
            </CardGrid>
          )}
        </>
      )}

      {selected && (
        <OutfitDetailModal
          outfit={selected}
          onClose={() => setSelected(null)}
          table='hairstyle_materials'
          foreignKeyColumn='hairstyle_item_id'
        />
      )}
    </div>
  );
}
