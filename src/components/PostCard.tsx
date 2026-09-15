type Props = {
  title: string
  description: string
  tags: string[]
  onClick: () => void
}

export function PostCard({ title, description, tags, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
      className="flex flex-col gap-2 p-4 rounded-xl border-2 border-sage-meadow bg-white/50 dark:bg-white/5 shadow-sm hover:shadow-md transition-shadow cursor-pointer text-left"
    >
      <h3 className="font-display font-semibold text-lg">{title}</h3>
      <p className="text-sm line-clamp-3">{description}</p>
      <div className="flex flex-wrap gap-1 mt-1">
        {tags.map((tag) => (
          <span
            key={tag}
            className={`text-xs px-2 py-0.5 rounded-full border ${
              tag === 'Spoilers'
                ? 'border-marigold-harvest text-marigold-harvest font-semibold'
                : 'border-sage-meadow text-sage-meadow'
            }`}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}