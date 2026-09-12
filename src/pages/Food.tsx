import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Card } from '../components/Card'
import { CardGrid } from '../components/CardGrid'
import { Modal } from '../components/Modal'
import { CategoryTabs } from '../components/CategoryTabs'
import { getImageUrl, preloadImages } from '../lib/storage'
import { getFoundRecipes, toggleRecipeFound } from '../lib/progress'
import type { Item } from '../types/Item'

type FoodWithCategory = Item & { categoryName: string | null }

export function Food() {
  const [searchParams] = useSearchParams()
  const openId = searchParams.get('open')

  const [food, setFood] = useState<FoodWithCategory[]>([])
  const [categoryOptions, setCategoryOptions] = useState<string[]>(['All'])
  const [activeCategory, setActiveCategory] = useState('All')
  const [pageLoading, setPageLoading] = useState(true)

  const [selected, setSelected] = useState<FoodWithCategory | null>(null)
  const [unlockMethod, setUnlockMethod] = useState<string | null>(null)
  const [unlockDetails, setUnlockDetails] = useState<string | null>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [foundIds, setFoundIds] = useState<number[]>([])

  useEffect(() => {
    setFoundIds(getFoundRecipes())

    async function fetchFood() {
      setPageLoading(true)

      const { data: foodItems, error: foodError } = await supabase
        .from('items')
        .select('*')
        .eq('category', 'food')
        .order('name')

      if (foodError) {
        console.error(foodError)
        setPageLoading(false)
        return
      }

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('food_categories')
        .select('id, name')
        .order('id')

      if (categoriesError) {
        console.error(categoriesError)
        setPageLoading(false)
        return
      }

      const { data: detailsRows, error: detailsError } = await supabase
        .from('food_details')
        .select('item_id, food_categories(name)')

      if (detailsError) {
        console.error(detailsError)
        setPageLoading(false)
        return
      }

      const categoryByItem = new Map<number, string>()
      for (const row of detailsRows as unknown as { item_id: number; food_categories: { name: string } | null }[]) {
        if (row.food_categories?.name) {
          categoryByItem.set(row.item_id, row.food_categories.name)
        }
      }

      const foodWithCategory: FoodWithCategory[] = foodItems.map((item) => ({
        ...item,
        categoryName: categoryByItem.get(item.id) ?? null,
      }))

      await preloadImages(foodWithCategory.map((item) => getImageUrl(item.image_path)))

      setFood(foodWithCategory)
      setCategoryOptions(['All', ...(categoriesData as { id: number; name: string }[]).map((c) => c.name)])
      setPageLoading(false)
    }
    fetchFood()
  }, [])

  async function openFood(item: FoodWithCategory) {
    setSelected(item)
    setUnlockMethod(null)
    setUnlockDetails(null)
    setModalLoading(true)

    const { data, error } = await supabase
      .from('food_details')
      .select('unlock_method, unlock_details')
      .eq('item_id', item.id)
      .maybeSingle()

    if (error) {
      console.error(error)
    } else {
      setUnlockMethod(data?.unlock_method ?? null)
      setUnlockDetails(data?.unlock_details ?? null)
    }

    setModalLoading(false)
  }

  useEffect(() => {
    if (pageLoading || !openId) return
    const match = food.find((f) => f.id === Number(openId))
    if (match) openFood(match)
  }, [pageLoading, food, openId])

  function handleToggleFound(id: number) {
    const updated = toggleRecipeFound(id)
    setFoundIds(updated)
  }

  const visibleFood =
    activeCategory === 'All'
      ? food
      : food.filter((item) => item.categoryName === activeCategory)

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-4">Food</h1>

      {pageLoading ? (
        <p className="text-center italic mt-10">Loading...</p>
      ) : (
        <>
          <CategoryTabs options={categoryOptions} active={activeCategory} onChange={setActiveCategory} />

          <CardGrid>
            {visibleFood.map((item) => (
              <Card
                key={item.id}
                name={item.name}
                image={getImageUrl(item.image_path)}
                category="food"
                onClick={() => openFood(item)}
                checked={foundIds.includes(item.id)}
                onToggleChecked={() => handleToggleFound(item.id)}
              />
            ))}
          </CardGrid>
        </>
      )}

      {selected && (
        <Modal onClose={() => setSelected(null)}>
          <img
            src={getImageUrl(selected.image_path)}
            alt={selected.name}
            className="w-24 h-24 object-contain rounded-xl mx-auto mb-2"
          />
          <h2 className="font-display text-2xl font-bold text-center mb-1">{selected.name}</h2>

          {modalLoading ? (
            <p className="text-center text-sm italic mt-6 mb-6">Loading...</p>
          ) : (
            <>
              {selected.categoryName && (
                <p className="text-sm text-center mb-4">
                  <span className="font-semibold">Category:</span> {selected.categoryName}
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
      )}
    </div>
  )
}