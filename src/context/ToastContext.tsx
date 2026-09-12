import { createContext, useContext, useState, type ReactNode } from 'react'

type Toast = {
  id: string
  message: string
  leaving: boolean
}

type ToastContextType = {
  showToast: (message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

const MAX_TOASTS = 3
const FADE_DURATION = 500
const VISIBLE_DURATION = 5000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  function showToast(message: string) {
    const id = crypto.randomUUID()

    setToasts((prev) => {
      const updated = [...prev, { id, message, leaving: false }]
      return updated.length > MAX_TOASTS ? updated.slice(updated.length - MAX_TOASTS) : updated
    })

    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)))
    }, VISIBLE_DURATION - FADE_DURATION)

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, VISIBLE_DURATION)
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 left-0 right-0 flex flex-col items-center gap-2 z-100 px-4 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`bg-sage-meadow text-white text-sm px-3 py-2 rounded-xl shadow-lg font-body text-center max-w-[85vw] sm:max-w-sm transition-opacity duration-300 ease-out animate-fade-in-up ${
              toast.leaving ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within a ToastProvider')
  return context
}