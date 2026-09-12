const HEART_LEVEL_NAMES = [
  'Acquaintance',
  'Casual Friend',
  'Good Friend',
  'Best Friend',
  'Intimate Friend',
  'Dating',
  'Partner',
]

export function getHeartLevelName(level: number): string {
  return HEART_LEVEL_NAMES[level - 1] ?? `Heart ${level}`
}
