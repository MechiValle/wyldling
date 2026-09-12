import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Card } from '../components/Card'
import { CardGrid } from '../components/CardGrid'
import { CategoryTabs } from '../components/CategoryTabs'
import { FoodDetailModal } from '../components/detail-modals/FoodDetailModal'
import { getImageUrl, preloadImages } from '../lib/storage'
import { getFoundRecipes, toggleRecipeFound } from '../lib/progress'
import type { Item } from '../types/Item'

type FoodWithCategory = Item & { categoryName: string | null }

export function Food() {
  const [food, setFood] = useState<FoodWithCategory[]>([])
  const [categoryOptions, setCategoryOptions] = useState<string[]>(['All'])
  const [activeCategory, setActiveCategory] = useState('All')
  const [pageLoading, setPageLoading] = useState(true)
  const [selected, setSelected] = useState<FoodWithCategory | null>(null)
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

  function handleToggleFound(id: number) {
    setFoundIds(toggleRecipeFound(id))
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
                onClick={() => setSelected(item)}
                checked={foundIds.includes(item.id)}
                onToggleChecked={() => handleToggleFound(item.id)}
              />
            ))}
          </CardGrid>
        </>
      )}

      {selected && <FoodDetailModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}