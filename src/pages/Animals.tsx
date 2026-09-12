import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Card } from '../components/Card';
import { CardGrid } from '../components/CardGrid';
import { CategoryTabs } from '../components/CategoryTabs';
import { AnimalDetailModal } from '../components/detail-modals/AnimalDetailModal';
import { getImageUrl, preloadImages } from '../lib/storage';
import type { Item } from '../types/Item';

type BreedingRow = {
  id: number;
  item_id: number;
  color: string;
  seasons: { name: string } | null;
};

const SEASON_ORDER = ['Spring', 'Summer', 'Fall', 'Winter'];

export function Animals() {
  const [view, setView] = useState('Animals');
  const [animals, setAnimals] = useState<Item[]>([]);
  const [allBreeding, setAllBreeding] = useState<BreedingRow[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [selected, setSelected] = useState<Item | null>(null);

  useEffect(() => {
    async function fetchAnimals() {
      setPageLoading(true);

      const { data: animalItems, error: animalError } = await supabase
        .from('items')
        .select('*')
        .eq('category', 'animal')
        .order('name');

      if (animalError) {
        console.error(animalError);
        setPageLoading(false);
        return;
      }

      const { data: breedingData, error: breedingError } = await supabase
        .from('animal_breeding')
        .select('id, item_id, color, seasons(name)');

      if (breedingError) {
        console.error(breedingError);
        setPageLoading(false);
        return;
      }

      await preloadImages(animalItems.map((a) => getImageUrl(a.image_path)));

      setAnimals(animalItems);
      setAllBreeding(breedingData as unknown as BreedingRow[]);
      setPageLoading(false);
    }
    fetchAnimals();
  }, []);

  function getCell(
    animalId: number,
    seasonName: string,
  ): BreedingRow | undefined {
    return allBreeding.find(
      (r) => r.item_id === animalId && r.seasons?.name === seasonName,
    );
  }

  return (
    <div>
      <h1 className='font-display text-3xl font-bold mb-4'>Animals</h1>

      {pageLoading ? (
        <p className='text-center italic mt-10'>Loading...</p>
      ) : (
        <>
          <CategoryTabs
            options={['Animals', 'Breeding Chart']}
            active={view}
            onChange={setView}
          />

          {view === 'Animals' && (
            <CardGrid>
              {animals.map((animal) => (
                <Card
                  key={animal.id}
                  name={animal.name}
                  image={getImageUrl(animal.image_path)}
                  category='animal'
                  onClick={() => setSelected(animal)}
                />
              ))}
            </CardGrid>
          )}

          {view === 'Breeding Chart' && (
            <div className='overflow-x-auto flex justify-center'>
              <div className='inline-grid grid-cols-[140px_repeat(4,120px)] gap-y-2'>
                <div className='sticky left-0 bg-oat-linen dark:bg-twilight-plum' />
                {SEASON_ORDER.map((season) => (
                  <div
                    key={season}
                    className='text-center font-display text-sm font-semibold pb-2'
                  >
                    {season}
                  </div>
                ))}

                {animals.map((animal) => (
                  <div key={animal.id} className='contents'>
                    <div className='sticky left-0 bg-oat-linen dark:bg-twilight-plum text-sm font-body flex items-center pr-3'>
                      {animal.name}
                    </div>
                    {SEASON_ORDER.map((season) => {
                      const cell = getCell(animal.id, season);
                      return (
                        <div
                          key={season}
                          className='flex items-center justify-center py-1'
                        >
                          <span className='text-sm text-center border-2 border-dusky-lavender rounded-lg px-2 py-1 w-28'>
                            {cell?.color ?? '—'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {selected && (
        <AnimalDetailModal
          animal={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
