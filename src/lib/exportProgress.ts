const PROGRESS_KEYS = [
  'wyldling-caught-fish',
  'wyldling-found-recipes',
  'wyldling-reached-hearts',
  'wyldling-gifted-foods',
]

export function exportProgressToFile(): void {
  const data: Record<string, unknown> = {}

  for (const key of PROGRESS_KEYS) {
    const value = localStorage.getItem(key)
    if (value) {
      data[key] = JSON.parse(value)
    }
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = 'wyldling-progress.json'
  link.click()

  URL.revokeObjectURL(url)
}

export function importProgressFromFile(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string)

        for (const key of PROGRESS_KEYS) {
          if (key in parsed) {
            localStorage.setItem(key, JSON.stringify(parsed[key]))
          }
        }

        resolve()
      } catch (err) {
        reject(err)
      }
    }

    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}