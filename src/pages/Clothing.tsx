import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Card } from '../components/Card';
import { CardGrid } from '../components/CardGrid';
import { CategoryTabs } from '../components/CategoryTabs';
import { OutfitDetailModal } from '../components/detail-modals/OutfitDetailModal';
import { getImageUrl, preloadImages } from '../lib/storage';
import { getCraftedOutfits, toggleOutfitCrafted } from '../lib/progress';
import type { Item } from '../types/Item';

type OutfitWithCategory = Item & { categoryName: string | null };

type MaterialNeedRow = {
  outfit_item_id: number;
  material_item_id: number;
  quantity: number;
  items: { name: string; image_path: string | null } | null;
};

export function Clothing() {
  const [view, setView] = useState('Outfits');

  const [outfits, setOutfits] = useState<OutfitWithCategory[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [allMaterials, setAllMaterials] = useState<MaterialNeedRow[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  const [selected, setSelected] = useState<Item | null>(null);
  const [craftedIds, setCraftedIds] = useState<number[]>([]);

  useEffect(() => {
    setCraftedIds(getCraftedOutfits());

    async function fetchClothing() {
      setPageLoading(true);

      const { data: outfitItems, error: outfitError } = await supabase
        .from('items')
        .select('*')
        .eq('category', 'outfit')
        .order('name');

      if (outfitError) {
        console.error(outfitError);
        setPageLoading(false);
        return;
      }

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('clothing_categories')
        .select('id, name')
        .order('id');

      if (categoriesError) {
        console.error(categoriesError);
        setPageLoading(false);
        return;
      }

      const { data: detailsRows, error: detailsError } = await supabase
        .from('outfit_details')
        .select('item_id, clothing_categories(name)');

      if (detailsError) {
        console.error(detailsError);
        setPageLoading(false);
        return;
      }

      const { data: materialsData, error: materialsError } = await supabase
        .from('outfit_materials')
        .select(
          'outfit_item_id, material_item_id, quantity, items!material_item_id(name, image_path)',
        );

      if (materialsError) {
        console.error(materialsError);
        setPageLoading(false);
        return;
      }

      const categoryByItem = new Map<number, string>();
      for (const row of detailsRows as unknown as {
        item_id: number;
        clothing_categories: { name: string } | null;
      }[]) {
        if (row.clothing_categories?.name) {
          categoryByItem.set(row.item_id, row.clothing_categories.name);
        }
      }

      const outfitsWithCategory: OutfitWithCategory[] = outfitItems.map(
        (item) => ({
          ...item,
          categoryName: categoryByItem.get(item.id) ?? null,
        }),
      );

      await preloadImages(
        outfitsWithCategory.map((item) => getImageUrl(item.image_path)),
      );

      setOutfits(outfitsWithCategory);
      setCategoryOptions([
        'All',
        ...(categoriesData as { id: number; name: string }[]).map(
          (c) => c.name,
        ),
      ]);
      setAllMaterials(materialsData as unknown as MaterialNeedRow[]);
      setPageLoading(false);
    }
    fetchClothing();
  }, []);

  function handleToggleCrafted(id: number) {
    setCraftedIds(toggleOutfitCrafted(id));
  }

  const visibleOutfits =
    activeCategory === 'All'
      ? outfits
      : outfits.filter((item) => item.categoryName === activeCategory);

  const stillNeeded = (() => {
    const totals = new Map<
      number,
      { name: string; image_path: string | null; quantity: number }
    >();

    for (const row of allMaterials) {
      if (craftedIds.includes(row.outfit_item_id)) continue;

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
      <h1 className='font-display text-3xl font-bold mb-4'>Clothing</h1>

      {pageLoading ? (
        <p className='text-center italic mt-10'>Loading...</p>
      ) : (
        <>
          <CategoryTabs
            options={['Outfits', 'Items still needed']}
            active={view}
            onChange={setView}
          />

          {view === 'Outfits' && (
            <>
              <CategoryTabs
                options={categoryOptions}
                active={activeCategory}
                onChange={setActiveCategory}
              />

              <CardGrid>
                {visibleOutfits.map((item) => (
                  <Card
                    key={item.id}
                    name={item.name}
                    image={getImageUrl(item.image_path)}
                    category='outfit'
                    imageAspect='portrait'
                    onClick={() => setSelected(item)}
                    checked={craftedIds.includes(item.id)}
                    onToggleChecked={() => handleToggleCrafted(item.id)}
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
        />
      )}
      <p className='text-xs opacity-50 text-center mt-8'>
        Clothing data provided by reddit user grngrl6
      </p>
    </div>
  );
}
