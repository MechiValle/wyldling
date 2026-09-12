export const categoryColors = {
  fish: 'border-dusky-lavender',
  food: 'border-marigold-harvest',
  character: 'border-sage-meadow',
  shop: 'border-sage-meadow',
  animal: 'border-dusky-lavender',
} as const

export type CategoryKey = keyof typeof categoryColors