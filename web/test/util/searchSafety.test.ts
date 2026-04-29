import { describe, expect, it } from 'vitest'
import {
  assessSearchResultSafety,
  filterResults,
  sanitizeQuery,
  type OpenverseResult,
} from '../../src/util/searchSafety'

function recordedResult(overrides: Partial<OpenverseResult> = {}): OpenverseResult {
  return {
    id: 'safe-cat',
    title: 'Orange cat on a sunny windowsill',
    url: 'https://images.example.test/cat.jpg',
    thumbnail: 'https://images.example.test/cat-thumb.jpg',
    creator: 'Example Museum',
    creator_url: 'https://creator.example.test/example-museum',
    license: 'cc0',
    license_version: '1.0',
    license_url: 'https://license.example.test/cc0',
    foreign_landing_url: 'https://landing.example.test/orange-cat',
    tags: [{ name: 'cat' }, { name: 'pet' }],
    source: 'wikimedia',
    ...overrides,
  }
}

describe('search safety', () => {
  it('sanitises safe queries and blocks unsafe query terms', () => {
    expect(sanitizeQuery('  cute kitten <script>  ')).toBe('cute kitten script')
    expect(sanitizeQuery('toy gun')).toBeNull()
    expect(sanitizeQuery('')).toBeNull()
  })

  it('keeps recorded safe responses with descriptive metadata', () => {
    const safe = recordedResult()

    expect(assessSearchResultSafety(safe)).toEqual({ safe: true, reasons: [] })
    expect(filterResults([safe])).toEqual([safe])
  })

  it('rejects unsafe terms outside the title and tags', () => {
    const borderline = recordedResult({
      id: 'borderline-description',
      title: 'Stage costume',
      tags: [{ name: 'costume' }],
      description: 'Archived adult theatre costume photo',
    })

    expect(assessSearchResultSafety(borderline).safe).toBe(false)
    expect(filterResults([borderline])).toEqual([])
  })

  it('rejects provider sensitivity flags even when visible text is bland', () => {
    const flagged = recordedResult({
      id: 'flagged',
      title: 'Untitled',
      tags: [{ name: 'portrait' }],
      mature: true,
    })

    expect(assessSearchResultSafety(flagged).reasons).toContain('provider marked result as sensitive')
    expect(filterResults([flagged])).toEqual([])
  })

  it('rejects provider sensitivity arrays from recorded API metadata', () => {
    const flagged = recordedResult({
      id: 'sensitive-array',
      title: 'Historical scene',
      tags: [{ name: 'history' }],
      unstable__sensitivity: ['graphic violence'],
    })

    expect(assessSearchResultSafety(flagged).safe).toBe(false)
    expect(filterResults([flagged])).toEqual([])
  })

  it('rejects vague untagged responses that have too little metadata to trust', () => {
    const untagged = recordedResult({
      id: 'untagged',
      title: 'IMG_4821',
      tags: [],
      description: null,
      alt_text: null,
    })

    expect(assessSearchResultSafety(untagged).reasons)
      .toContain('result has too little descriptive safety metadata')
    expect(filterResults([untagged])).toEqual([])
  })

  it('filters mixed recorded responses while preserving safe result order', () => {
    const safeOne = recordedResult({ id: 'safe-one', title: 'Rainbow kite', tags: [{ name: 'kite' }] })
    const blocked = recordedResult({ id: 'blocked', title: 'Cartoon sword', tags: [{ name: 'toy' }] })
    const safeTwo = recordedResult({ id: 'safe-two', title: 'Wooden train', tags: [{ name: 'train' }] })

    expect(filterResults([safeOne, blocked, safeTwo])).toEqual([safeOne, safeTwo])
  })
})
