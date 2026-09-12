import type { ReactNode } from 'react'

type ModalProps = {
  onClose: () => void
  children: ReactNode
}

export function Modal({ onClose, children }: ModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-oat-linen dark:bg-twilight-plum w-full max-w-md max-h-[85vh] rounded-2xl overflow-y-auto p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-2xl">
          ✕
        </button>
        {children}
      </div>
    </div>
  )
}