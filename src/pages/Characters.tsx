import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Card } from '../components/Card';
import { CardGrid } from '../components/CardGrid';
import { CategoryTabs } from '../components/CategoryTabs';
import { CharacterDetailModal } from '../components/detail-modals/CharacterDetailModal';
import { FoodDetailModal } from '../components/detail-modals/FoodDetailModal';
import { FoundCheckbox } from '../components/FoundCheckbox';
import { getImageUrl, preloadImages } from '../lib/storage';
import { useGiftedFoods } from '../context/GiftedFoodsContext';

type CharacterItem = {
  id: number;
  name: string;
  romanceable: boolean;
  image_path: string | null;
};

type FavoriteFood = {
  item_id: number;
  items: { name: string; image_path: string | null } | null;
};

export function Characters() {
  const [view, setView] = useState('Characters');

  const [characters, setCharacters] = useState<CharacterItem[]>([]);
  const [favoritesByCharacter, setFavoritesByCharacter] = useState<
    Map<number, FavoriteFood[]>
  >(new Map());
  const [pageLoading, setPageLoading] = useState(true);
  const [selected, setSelected] = useState<CharacterItem | null>(null);

  const { giftedIds, toggleGifted } = useGiftedFoods();
  const [selectedFavorite, setSelectedFavorite] = useState<{
    id: number;
    name: string;
    image_path: string | null;
  } | null>(null);

  useEffect(() => {
    async function fetchCharacters() {
      setPageLoading(true);

      const { data: charactersData, error: charactersError } = await supabase
        .from('characters')
        .select('*')
        .order('name');

      if (charactersError) {
        console.error(charactersError);
        setPageLoading(false);
        return;
      }

      const { data: favoritesData, error: favoritesError } = await supabase
        .from('character_favorite_gifts')
        .select('character_id, item_id, items(name, image_path)');

      if (favoritesError) {
        console.error(favoritesError);
        setPageLoading(false);
        return;
      }

      const grouped = new Map<number, FavoriteFood[]>();
      for (const row of favoritesData as unknown as {
        character_id: number;
        item_id: number;
        items: { name: string; image_path: string | null } | null;
      }[]) {
        if (!grouped.has(row.character_id)) {
          grouped.set(row.character_id, []);
        }
        grouped
          .get(row.character_id)!
          .push({ item_id: row.item_id, items: row.items });
      }

      await preloadImages(charactersData.map((c) => getImageUrl(c.image_path)));

      setCharacters(charactersData);
      setFavoritesByCharacter(grouped);
      setPageLoading(false);
    }
    fetchCharacters();
  }, []);

  return (
    <div>
      <h1 className='font-display text-3xl font-bold mb-4'>Characters</h1>

      {pageLoading ? (
        <p className='text-center italic mt-10'>Loading...</p>
      ) : (
        <>
          <CategoryTabs
            options={['Characters', 'Favorite gifts']}
            active={view}
            onChange={setView}
          />

          {view === 'Characters' && (
            <CardGrid>
              {characters.map((character) => (
                <Card
                  key={character.id}
                  name={character.name}
                  image={getImageUrl(character.image_path)}
                  category='character'
                  onClick={() => setSelected(character)}
                />
              ))}
            </CardGrid>
          )}

          {view === 'Favorite gifts' && (
            <div className='flex flex-col gap-3 items-center'>
              {characters.map((character) => (
                <div
                  key={character.id}
                  className='flex items-center gap-4 flex-wrap p-3 rounded-xl border-2 border-sage-meadow w-[640px] max-w-full'
                >
                  <div className='flex items-center gap-2 flex-shrink-0 w-32'>
                    <img
                      src={getImageUrl(character.image_path)}
                      alt={character.name}
                      className='w-12 h-12 object-contain rounded-lg'
                    />
                    <span className='font-display font-semibold text-sm'>
                      {character.name}
                    </span>
                  </div>

                  <div className='flex flex-wrap items-stretch gap-3'>
                    {(favoritesByCharacter.get(character.id) ?? []).map((f) => (
                      <div
                        key={f.item_id}
                        className='flex flex-col items-center justify-between w-20 gap-1'
                      >
                        <button
                          onClick={() =>
                            setSelectedFavorite({
                              id: f.item_id,
                              name: f.items?.name ?? '',
                              image_path: f.items?.image_path ?? null,
                            })
                          }
                          className='flex flex-col items-center w-full'
                        >
                          <img
                            src={getImageUrl(f.items?.image_path ?? null)}
                            alt={f.items?.name ?? ''}
                            className='w-10 h-10 object-contain rounded-lg'
                          />
                          <span className='text-xs text-center w-full break-words leading-tight'>
                            {f.items?.name}
                          </span>
                        </button>
                        <FoundCheckbox
                          checked={giftedIds.includes(f.item_id)}
                          onChange={() => toggleGifted(f.item_id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {selected && (
        <CharacterDetailModal
          character={selected}
          onClose={() => setSelected(null)}
        />
      )}

      {selectedFavorite && (
        <FoodDetailModal
          item={selectedFavorite}
          onClose={() => setSelectedFavorite(null)}
        />
      )}
    </div>
  );
}
