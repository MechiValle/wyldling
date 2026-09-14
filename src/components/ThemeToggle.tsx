import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export function ThemeToggle() {
  const { isDark, toggleDark } = useTheme()

  return (
    <button
      onClick={toggleDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="text-bramble-ink dark:text-moonlit-cream hover:text-marigold-harvest transition-colors"
    >
      {isDark ? <Sun size={22} /> : <Moon size={22} />}
    </button>
  )
}