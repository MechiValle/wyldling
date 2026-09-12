type CategoryTabsProps = {
  options: string[]
  active: string
  onChange: (value: string) => void
}

export function CategoryTabs({ options, active, onChange }: CategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`px-3 py-1.5 rounded-full text-sm font-body border-2 transition-colors ${
            active === option
              ? 'bg-sage-meadow border-sage-meadow text-white'
              : 'border-sage-meadow/40 hover:border-sage-meadow'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  )
}