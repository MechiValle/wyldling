import { useRef, useState } from 'react'
import {
  resetCaughtFish,
  resetFoundRecipes,
  resetReachedHearts,
  resetGiftedFoods,
  resetCraftedOutfits,
  resetUnlockedHairstyles,
} from '../lib/progress'
import { exportProgressToFile, importProgressFromFile } from '../lib/exportProgress'
import { ResetProgressCard } from '../components/ResetProgressCard'
import { useToast } from '../context/ToastContext'
import { useGiftedFoods } from '../context/GiftedFoodsContext'

export function Settings() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showToast } = useToast()
  const { refresh: refreshGiftedFoods } = useGiftedFoods()
  const [confirmingAll, setConfirmingAll] = useState(false)

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      await importProgressFromFile(file)
      showToast('Your progress has been restored. Refreshing...')
      setTimeout(() => window.location.reload(), 1500)
    } catch {
      showToast('That file could not be read. Please make sure it\'s a valid Wyldling progress file.')
    }

    e.target.value = ''
  }

  function handleResetAll() {
    resetCaughtFish()
    resetFoundRecipes()
    resetReachedHearts()
    resetGiftedFoods()
    resetCraftedOutfits()
    resetUnlockedHairstyles()
    refreshGiftedFoods()
    setConfirmingAll(false)
    showToast('All progress has been reset.')
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-4">Settings</h1>

      <div className="border-2 border-sage-meadow rounded-xl p-4 max-w-md mb-4">
        <h2 className="font-display font-semibold mb-2">Backup your progress</h2>
        <p className="text-sm mb-4">
          Your checkmarks are saved only in this browser. If you clear your browser data or
          switch devices, they'll be lost unless you back them up first. Download a backup
          file now, and restore it later on any device.
        </p>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={exportProgressToFile}
            className="px-4 py-2 rounded-lg bg-sage-meadow text-white font-body"
          >
            Export progress
          </button>
          <button
            onClick={handleImportClick}
            className="px-4 py-2 rounded-lg border-2 border-sage-meadow font-body"
          >
            Import progress
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleFileSelected}
            className="hidden"
          />
        </div>
      </div>

      <div className="border-2 border-marigold-harvest rounded-xl p-4 max-w-md mb-8">
        <h2 className="font-display font-semibold mb-2">Reset everything</h2>
        <p className="text-sm mb-4">
          This clears every checkmark across the entire site — fish, recipes, hearts, gifts,
          outfits, and hairstyles — all at once. This can't be undone.
        </p>

        {!confirmingAll ? (
          <button
            onClick={() => setConfirmingAll(true)}
            className="px-4 py-2 rounded-lg border-2 border-marigold-harvest font-body"
          >
            Reset all progress
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">Are you absolutely sure? This clears everything, everywhere.</p>
            <div className="flex gap-2">
              <button
                onClick={handleResetAll}
                className="px-4 py-2 rounded-lg bg-marigold-harvest text-white font-body"
              >
                Yes, reset everything
              </button>
              <button
                onClick={() => setConfirmingAll(false)}
                className="px-4 py-2 rounded-lg border-2 border-sage-meadow font-body"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <h2 className="font-display font-semibold mb-3">Or reset just one category</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
        <ResetProgressCard
          title="Reset caught fish"
          description="This clears every fish you've marked as caught, so you can start tracking fresh. This can't be undone."
          onReset={resetCaughtFish}
          toastMessage="Your caught fish checkmarks have been cleared."
        />

        <ResetProgressCard
          title="Reset found recipes"
          description="This clears every recipe you've marked as found, so you can start tracking fresh. This can't be undone."
          onReset={resetFoundRecipes}
          toastMessage="Your found recipe checkmarks have been cleared."
        />

        <ResetProgressCard
          title="Reset reached hearts"
          description="This clears every heart level you've marked as reached for every character, so you can start tracking fresh. This can't be undone."
          onReset={resetReachedHearts}
          toastMessage="Your reached heart levels have been cleared."
        />

        <ResetProgressCard
          title="Reset gifted foods"
          description="This clears every food you've marked as delivered to a character, so all favorite foods show as silhouettes again. This can't be undone."
          onReset={() => { resetGiftedFoods(); refreshGiftedFoods() }}
          toastMessage="Your gifted food checkmarks have been cleared."
        />

        <ResetProgressCard
          title="Reset crafted outfits"
          description="This clears every outfit you've marked as crafted, bringing back their materials in your 'Items still needed' totals. This can't be undone."
          onReset={resetCraftedOutfits}
          toastMessage="Your crafted outfit checkmarks have been cleared."
        />

        <ResetProgressCard
          title="Reset unlocked hairstyles"
          description="This clears every hairstyle you've marked as unlocked, bringing back their materials in your 'Items still needed' totals. This can't be undone."
          onReset={resetUnlockedHairstyles}
          toastMessage="Your unlocked hairstyle checkmarks have been cleared."
        />
      </div>
    </div>
  )
}