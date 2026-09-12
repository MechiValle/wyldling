import { useState } from 'react'

type Props = {
  checked: boolean
  onChange: () => void
  label?: string
}

export function FoundCheckbox({ checked, onChange, label }: Props) {
  const [justChecked, setJustChecked] = useState(false)

  function handleClick() {
    if (!checked) {
      setJustChecked(true)
      setTimeout(() => setJustChecked(false), 300)
    }
    onChange()
  }

  return (
    <span className="inline-flex items-center gap-2 cursor-pointer select-none">
      <span
        onClick={handleClick}
        className={`w-6 h-6 rounded-md border-2 border-sage-meadow flex items-center justify-center bg-oat-linen dark:bg-twilight-plum ${checked ? 'bg-sage-meadow text-white' : ''} ${justChecked ? 'animate-bloom' : ''}`}
      >
        {checked && '✓'}
      </span>
      {label && <span className="font-body">{label}</span>}
    </span>
  )
}