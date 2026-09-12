const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const BUCKET = 'item-images'

export function getImageUrl(path: string | null): string {
  if (!path) return ''
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`
}

export function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          if (!url) {
            resolve()
            return
          }
          const img = new Image()
          img.onload = () => resolve()
          img.onerror = () => resolve()
          img.src = url
        })
    )
  )
}