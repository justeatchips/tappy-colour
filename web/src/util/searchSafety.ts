// Deliberately conservative: reject anything that needs a second look.
const UNSAFE_WORDS = [
  'gun', 'guns', 'firearm', 'firearms', 'rifle', 'rifles', 'pistol', 'pistols',
  'weapon', 'weapons', 'knife', 'knives', 'sword', 'swords', 'blade', 'blades',
  'bomb', 'bombs', 'grenade', 'grenades', 'explosive', 'explosives',
  'shoot', 'shoots', 'shooting', 'shot',
  'blood', 'bloody', 'gore', 'gory', 'dead', 'death', 'kill', 'kills', 'killing',
  'murder', 'murdered', 'corpse', 'corpses', 'skull', 'skulls', 'skeleton',
  'skeletons', 'zombie', 'zombies', 'wound', 'wounds',
  'war', 'battle', 'combat', 'military', 'soldier', 'soldiers', 'army', 'troops',
  'nude', 'naked', 'nudity', 'sex', 'sexual', 'sexy', 'adult', 'porn',
  'pornography', 'erotic', 'fetish', 'lingerie', 'underwear', 'bikini',
  'drug', 'drugs', 'alcohol', 'beer', 'wine', 'vodka', 'whiskey', 'cigarette',
  'cigarettes', 'tobacco', 'weed', 'cannabis', 'marijuana',
  'hate', 'racist', 'racism', 'violence', 'violent', 'abuse', 'abusive',
  'suicide', 'selfharm', 'horror', 'terror', 'creepy', 'disturbing',
]

const UNSAFE_PHRASES = [
  'body horror',
  'graphic violence',
  'hate speech',
  'hate symbol',
  'middle finger',
  'self harm',
]

const UNSAFE_SAFETY_VALUES = [
  'adult',
  'explicit',
  'mature',
  'nsfw',
  'racy',
  'sensitive',
  'violence',
]

const SAFETY_FLAG_KEYS = [
  'adult',
  'explicit',
  'is_adult',
  'is_explicit',
  'is_mature',
  'is_nsfw',
  'is_sensitive',
  'mature',
  'nsfw',
  'sensitive',
]

const SAFETY_VALUE_KEYS = [
  'content_warning',
  'content_warnings',
  'safety',
  'safety_rating',
  'sensitivity',
  'sensitivities',
  'unstable__sensitivity',
]

const METADATA_TEXT_KEYS = [
  'alt_text',
  'category',
  'creator',
  'creator_url',
  'description',
  'foreign_landing_url',
  'source',
  'thumbnail',
  'title',
  'url',
]

const GENERIC_TITLE_PATTERNS = [
  /^untitled$/i,
  /^(image|photo|picture|pic)$/i,
  /^(img|dsc|dscn|image|photo|pic)[-_ ]?\d+$/i,
  /^\d+$/,
]

const UNSAFE_SET = new Set(UNSAFE_WORDS)
const UNSAFE_SAFETY_SET = new Set(UNSAFE_SAFETY_VALUES)

function normaliseText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function tokenise(text: string): string[] {
  return normaliseText(text).split(/\s+/).filter(Boolean)
}

function containsBlockedTerm(text: string): boolean {
  const normalised = ` ${normaliseText(text)} `
  if (UNSAFE_PHRASES.some(phrase => normalised.includes(` ${phrase} `))) return true
  return tokenise(text).some(t => UNSAFE_SET.has(t))
}

/** Returns the sanitised query, or null if the query is blocked entirely. */
export function sanitizeQuery(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  if (containsBlockedTerm(trimmed)) return null
  // Strip any characters that could cause injection/escaping issues
  return trimmed.replace(/[<>"'\\]/g, '').slice(0, 100)
}

export interface OpenverseResult {
  id: string
  title: string
  url: string
  thumbnail: string
  creator: string
  creator_url: string
  license: string
  license_version: string
  license_url: string
  foreign_landing_url: string
  tags?: Array<{ name: string }>
  alt_text?: string | null
  category?: string | null
  description?: string | null
  mature?: boolean
  source?: string | null
  unstable__sensitivity?: string[] | null
}

export interface SearchResultSafety {
  safe: boolean
  reasons: string[]
}

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' ? value as Record<string, unknown> : {}
}

function flattenStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (typeof value === 'number' || typeof value === 'boolean') return [String(value)]
  if (Array.isArray(value)) return value.flatMap(flattenStrings)
  if (value !== null && typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).flatMap(flattenStrings)
  }
  return []
}

function hasTruthySafetyFlag(result: OpenverseResult): boolean {
  const record = asRecord(result)
  return SAFETY_FLAG_KEYS.some(key => record[key] === true)
}

function hasUnsafeSafetyValue(result: OpenverseResult): boolean {
  const record = asRecord(result)
  return SAFETY_VALUE_KEYS.some(key => {
    const values = flattenStrings(record[key]).flatMap(tokenise)
    return values.some(value => UNSAFE_SAFETY_SET.has(value) || containsBlockedTerm(value))
  })
}

function collectMetadataText(result: OpenverseResult): string[] {
  const record = asRecord(result)
  const fields = METADATA_TEXT_KEYS.flatMap(key => flattenStrings(record[key]))
  const tags = (result.tags ?? []).flatMap(tag => flattenStrings(tag))
  return [...fields, ...tags].filter(text => text.trim().length > 0)
}

function hasHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

function hasUsableImageLinks(result: OpenverseResult): boolean {
  return hasHttpUrl(result.thumbnail) && hasHttpUrl(result.url)
}

function hasDescriptiveSafetyMetadata(result: OpenverseResult): boolean {
  const title = result.title.trim()
  if (title && !GENERIC_TITLE_PATTERNS.some(pattern => pattern.test(title))) return true
  if ((result.tags ?? []).some(tag => tokenise(tag.name).length > 0)) return true
  if (typeof result.description === 'string' && tokenise(result.description).length > 0) return true
  if (typeof result.alt_text === 'string' && tokenise(result.alt_text).length > 0) return true
  return false
}

export function assessSearchResultSafety(result: OpenverseResult): SearchResultSafety {
  const reasons: string[] = []

  if (!hasUsableImageLinks(result)) reasons.push('missing usable image URL')
  if (hasTruthySafetyFlag(result)) reasons.push('provider marked result as sensitive')
  if (hasUnsafeSafetyValue(result)) reasons.push('provider safety metadata is unsafe')
  if (collectMetadataText(result).some(containsBlockedTerm)) reasons.push('metadata contains blocked term')
  if (!hasDescriptiveSafetyMetadata(result)) reasons.push('result has too little descriptive safety metadata')

  return { safe: reasons.length === 0, reasons }
}

/** Filter out results whose provider flags or metadata are not safe enough for kids. */
export function filterResults(results: OpenverseResult[]): OpenverseResult[] {
  return results.filter(r => assessSearchResultSafety(r).safe)
}
