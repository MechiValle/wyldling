import { useState } from 'react'
import { useToast } from '../context/ToastContext'

type Props = {
  title: string
  description: string
  onReset: () => void
  toastMessage: string
}

export function ResetProgressCard({ title, description, onReset, toastMessage }: Props) {
  const [confirming, setConfirming] = useState(false)
  const { showToast } = useToast()

  function handleReset() {
    onReset()
    setConfirming(false)
    showToast(toastMessage)
  }

  return (
    <div className="border-2 border-marigold-harvest rounded-xl p-4 max-w-md">
      <h2 className="font-display font-semibold mb-2">{title}</h2>
      <p className="text-sm mb-4">{description}</p>

      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="px-4 py-2 rounded-lg border-2 border-marigold-harvest font-body"
        >
          Reset
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">Are you sure? This will delete all your checkmarks.</p>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg bg-marigold-harvest text-white font-body"
            >
              Yes, reset everything
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="px-4 py-2 rounded-lg border-2 border-sage-meadow font-body"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}