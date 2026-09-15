import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { PostCard } from '../components/PostCard'
import { CategoryTabs } from '../components/CategoryTabs'
import { TipDetailModal } from '../components/detail-modals/TipDetailModal'

type Tip = {
  id: number
  title: string
  description: string
  content: string
  source: string | null
}

type TipWithTags = Tip & { tagNames: string[] }

export function Tips() {
  const [tips, setTips] = useState<TipWithTags[]>([])
  const [tagOptions, setTagOptions] = useState<string[]>(['All'])
  const [activeTag, setActiveTag] = useState('All')
  const [pageLoading, setPageLoading] = useState(true)
  const [selected, setSelected] = useState<TipWithTags | null>(null)

  useEffect(() => {
    async function fetchTips() {
      setPageLoading(true)

      const { data: tipsData, error: tipsError } = await supabase
        .from('tips')
        .select('*')
        .order('id', { ascending: false })

      if (tipsError) {
        console.error(tipsError)
        setPageLoading(false)
        return
      }

      const { data: linksData, error: linksError } = await supabase
        .from('tip_tag_links')
        .select('tip_id, tip_tags(name)')

      if (linksError) {
        console.error(linksError)
        setPageLoading(false)
        return
      }

      const tagsByTip = new Map<number, string[]>()
      const allTags = new Set<string>()

      for (const row of linksData as unknown as { tip_id: number; tip_tags: { name: string } | null }[]) {
        const tagName = row.tip_tags?.name
        if (!tagName) continue
        allTags.add(tagName)
        if (!tagsByTip.has(row.tip_id)) {
          tagsByTip.set(row.tip_id, [])
        }
        tagsByTip.get(row.tip_id)!.push(tagName)
      }

      const tipsWithTags: TipWithTags[] = (tipsData as Tip[]).map((tip) => ({
        ...tip,
        tagNames: tagsByTip.get(tip.id) ?? [],
      }))

      setTips(tipsWithTags)
      setTagOptions(['All', ...Array.from(allTags).sort()])
      setPageLoading(false)
    }
    fetchTips()
  }, [])

  const visibleTips =
    activeTag === 'All'
      ? tips
      : tips.filter((tip) => tip.tagNames.includes(activeTag))

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-4">Tips</h1>

      {pageLoading ? (
        <p className="text-center italic mt-10">Loading...</p>
      ) : (
        <>
          <CategoryTabs options={tagOptions} active={activeTag} onChange={setActiveTag} />

          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
            {visibleTips.map((tip) => (
              <PostCard
                key={tip.id}
                title={tip.title}
                description={tip.description}
                tags={tip.tagNames}
                onClick={() => setSelected(tip)}
              />
            ))}
          </div>
        </>
      )}

      {selected && (
        <TipDetailModal tip={selected} tags={selected.tagNames} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}