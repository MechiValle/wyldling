type Props = {
  checked: boolean
  onChange: () => void
  label: string
}

export function HideCompletedToggle({ checked, onChange, label }: Props) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none mb-4">
      <span
        onClick={onChange}
        className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors ${
          checked ? 'bg-sage-meadow justify-end' : 'bg-sage-meadow/30 justify-start'
        }`}
      >
        <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
      </span>
      <span className="text-sm font-body">{label}</span>
    </label>
  )
}