const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const BUCKET = 'item-images'

export function getImageUrl(path: string | null): string {
  if (!path) return ''
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`
}