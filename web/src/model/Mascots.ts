export const DEFAULT_MASCOT_ID = 'flutters'

const MASCOT_IMAGE_FILENAMES = {
  'flutters': 'flutters.png',
  'plop': 'plop.png',
  'sparklepants': 'sparklepants.png',
  'sir-chomps-a-lot': 'sir-chomps-a-lot.png',
  'squeak-nugget': 'squeak-nugget.png',
  'oinkers-mcsnort': 'oinkers-mcsnort.png',
  'chaosaurus': 'chaosaurus.png',
  'captain-snooze': 'captain-snooze.png',
} as const

export type MascotId = keyof typeof MASCOT_IMAGE_FILENAMES

export interface Mascot {
  id: MascotId
  name: string
  kind: string
  tag: string
  vibe: string
  personality: string
  filename: string
  palette: string[]
  tokens: { body: string; accent: string; cheek: string }
}

const BASE = import.meta.env.BASE_URL

function isMascotId(id: string | null | undefined): id is MascotId {
  return typeof id === 'string' && Object.hasOwn(MASCOT_IMAGE_FILENAMES, id)
}

export function resolveMascotId(id: string | null | undefined): MascotId {
  return isMascotId(id) ? id : DEFAULT_MASCOT_ID
}

export function mascotImageUrl(id: string | null | undefined): string {
  const filename = MASCOT_IMAGE_FILENAMES[resolveMascotId(id)]
  return `${BASE}assets/mascots/png/${filename}`
}

let _cache: Mascot[] | null = null

export async function loadMascots(): Promise<Mascot[]> {
  if (_cache) return _cache
  const r = await fetch(`${BASE}assets/mascots/mascots.json`)
  if (!r.ok) throw new Error(`Failed to load mascots: ${r.status}`)
  const data = await r.json() as { mascots: Mascot[] }
  _cache = data.mascots
  return _cache
}

export function getMascotById(id: string): Mascot | undefined {
  const resolvedId = resolveMascotId(id)
  return _cache?.find(m => m.id === resolvedId) ?? undefined
}

const COLOUR_DONE_MESSAGES: Record<MascotId, string> = {
  'flutters': 'Flutters fluttered through #{number}!',
  'plop': 'Plop made #{number} pop!',
  'sparklepants': 'Sparklepants says #{number} sparkles!',
  'sir-chomps-a-lot': 'Sir Chomps-a-Lot chomped #{number}!',
  'squeak-nugget': 'Squeak Nugget squeaks: #{number} done!',
  'oinkers-mcsnort': 'Oinkers McSnort cheers for #{number}!',
  'chaosaurus': 'Chaosaurus roars for #{number}!',
  'captain-snooze': 'Captain Snooze dreams #{number} done!',
}

export function colourDoneMessage(id: string | null | undefined, paletteNumber: number): string {
  const resolvedId = resolveMascotId(id)
  return COLOUR_DONE_MESSAGES[resolvedId].replace('{number}', String(paletteNumber))
}
