import { categoryColors, type CategoryKey } from '../lib/categoryColors'
import { FoundCheckbox } from './FoundCheckbox'

type CardProps = {
  image: string
  name: string
  category: CategoryKey
  onClick: () => void
  checked?: boolean
  onToggleChecked?: () => void
  badge?: string | number
  imageAspect?: 'square' | 'portrait'
}

export function Card({
  image,
  name,
  category,
  onClick,
  checked,
  onToggleChecked,
  badge,
  imageAspect = 'square',
}: CardProps) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
      className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 ${categoryColors[category]} bg-white/50 dark:bg-white/5 shadow-sm hover:shadow-md transition-shadow text-center cursor-pointer`}
    >
      {onToggleChecked && (
        <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
          <FoundCheckbox checked={!!checked} onChange={onToggleChecked} />
        </div>
      )}
      {badge !== undefined && !onToggleChecked && (
        <div className="absolute top-2 right-2 bg-marigold-harvest text-white text-xs font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
          {badge}
        </div>
      )}
      <img
        src={image}
        alt={name}
        className={`${imageAspect === 'portrait' ? 'w-16 h-28' : 'w-16 h-16'} object-contain rounded-lg`}
      />
      <span className="font-display font-semibold truncate w-full">{name}</span>
    </div>
  )
}