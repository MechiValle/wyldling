import { resetCaughtFish, resetFoundRecipes, resetReachedHearts, resetGiftedFoods } from '../lib/progress'
import { ResetProgressCard } from '../components/ResetProgressCard'

export function Settings() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-4">Settings</h1>

      <div className="flex flex-col gap-4">
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
          onReset={resetGiftedFoods}
          toastMessage="Your gifted food checkmarks have been cleared."
        />
      </div>
    </div>
  )
}