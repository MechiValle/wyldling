import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getImageUrl } from '../lib/storage';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { typeTagStyles } from '../lib/typeTagColors';
import { FishDetailModal } from '../components/detail-modals/FishDetailModal';
import { FoodDetailModal } from '../components/detail-modals/FoodDetailModal';
import { CharacterDetailModal } from '../components/detail-modals/CharacterDetailModal';
import { ShopDetailModal } from '../components/detail-modals/ShopDetailModal';
import { AnimalDetailModal } from '../components/detail-modals/AnimalDetailModal';
import { OutfitDetailModal } from '../components/detail-modals/OutfitDetailModal';

type ResultType = 'fish' | 'food' | 'character' | 'shop' | 'animal' | 'outfit';

type SearchResult = {
  id: number;
  name: string;
  image: string;
  type: ResultType;
  raw: any;
};

export function Search() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<SearchResult | null>(null);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }

    async function runSearch() {
      setLoading(true);

      const [itemsResult, charactersResult, shopsResult] = await Promise.all([
        supabase
          .from('items')
          .select('id, name, image_path, category')
          .ilike('name', `%${trimmed}%`)
          .in('category', ['fish', 'food', 'animal', 'outfit']),
        supabase
          .from('characters')
          .select('id, name, image_path, romanceable')
          .ilike('name', `%${trimmed}%`),
        supabase
          .from('shops')
          .select('id, name, characters(name, image_path)')
          .ilike('name', `%${trimmed}%`),
      ]);

      const itemResults: SearchResult[] = (itemsResult.data ?? []).map((i) => ({
        id: i.id,
        name: i.name,
        image: getImageUrl(i.image_path),
        type: i.category as ResultType,
        raw: i,
      }));

      const characterResults: SearchResult[] = (
        charactersResult.data ?? []
      ).map((c) => ({
        id: c.id,
        name: c.name,
        image: getImageUrl(c.image_path),
        type: 'character',
        raw: c,
      }));

      const shopRows = (shopsResult.data ?? []) as unknown as {
        id: number;
        name: string;
        characters: { name: string; image_path: string | null } | null;
      }[];

      const shopResults: SearchResult[] = shopRows.map((s) => ({
        id: s.id,
        name: s.name,
        image: getImageUrl(s.characters?.image_path ?? null),
        type: 'shop',
        raw: s,
      }));

      setResults([...itemResults, ...characterResults, ...shopResults]);
      setLoading(false);
    }

    runSearch();
  }, [debouncedQuery]);

  return (
    <div>
      <h1 className='font-display text-3xl font-bold mb-4'>Search</h1>

      <div className='relative w-full max-w-md mb-4'>
        <input
          type='text'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Search fish, food, characters, shops...'
          className='w-full border-2 border-sage-meadow rounded-lg px-3 py-2 pr-9 bg-transparent font-body'
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            aria-label='Clear search'
            className='absolute right-2 top-1/2 -translate-y-1/2 text-lg opacity-60 hover:opacity-100'
          >
            ✕
          </button>
        )}
      </div>

      {loading && <p className='text-sm italic'>Searching...</p>}

      {!loading && debouncedQuery.trim() && results.length === 0 && (
        <p className='text-sm italic'>No results found.</p>
      )}

      <div className='flex flex-col gap-2 max-w-md'>
        {results.map((result) => (
          <button
            key={`${result.type}-${result.id}`}
            onClick={() => setSelected(result)}
            className='flex items-center gap-3 p-2 rounded-lg border border-sage-meadow/30 hover:border-sage-meadow text-left'
          >
            <img
              src={result.image}
              alt={result.name}
              className='w-10 h-10 object-contain rounded-md flex-shrink-0'
            />
            <span className='font-body flex-1'>{result.name}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border capitalize ${typeTagStyles[result.type]}`}
            >
              {result.type}
            </span>
          </button>
        ))}
      </div>

      {selected?.type === 'fish' && (
        <FishDetailModal
          item={selected.raw}
          onClose={() => setSelected(null)}
        />
      )}
      {selected?.type === 'food' && (
        <FoodDetailModal
          item={selected.raw}
          onClose={() => setSelected(null)}
        />
      )}
      {selected?.type === 'animal' && (
        <AnimalDetailModal
          animal={selected.raw}
          onClose={() => setSelected(null)}
        />
      )}
      {selected?.type === 'character' && (
        <CharacterDetailModal
          character={selected.raw}
          onClose={() => setSelected(null)}
        />
      )}
      {selected?.type === 'shop' && (
        <ShopDetailModal
          shop={selected.raw}
          onClose={() => setSelected(null)}
        />
      )}
      {selected?.type === 'outfit' && (
        <OutfitDetailModal
          outfit={selected.raw}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
