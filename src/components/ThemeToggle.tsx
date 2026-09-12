import { useTheme } from '../context/ThemeContext'

export function ThemeToggle() {
  const { isDark, toggleDark } = useTheme()

  return (
    <button
      onClick={toggleDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="text-2xl leading-none"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}