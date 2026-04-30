// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Router } from '../../src/router'
import type { OpenverseResult } from '../../src/util/searchSafety'
import { SearchScreen } from '../../src/views/SearchScreen'

function makeRouter(): Router {
  return { navigate: vi.fn() } as unknown as Router
}

function makeResult(overrides: Partial<OpenverseResult> = {}): OpenverseResult {
  return {
    id: 'safe-flower',
    title: 'Yellow flower in a garden',
    url: 'https://images.example.test/flower.jpg',
    thumbnail: 'https://images.example.test/flower-thumb.jpg',
    creator: 'Safe Photos',
    creator_url: 'https://creator.example.test',
    license: 'cc0',
    license_version: '1.0',
    license_url: 'https://license.example.test/cc0',
    foreign_landing_url: 'https://landing.example.test/flower',
    tags: [{ name: 'flower' }, { name: 'garden' }],
    source: 'wikimedia',
    ...overrides,
  }
}

beforeEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('SearchScreen topic shortcuts', () => {
  it('shows image topic cards before a typed search', () => {
    const root = document.createElement('div')
    const screen = new SearchScreen(makeRouter())

    screen.mount(root)

    expect(root.querySelector('[data-search-topic="cat"] img')).toBeInstanceOf(HTMLImageElement)
    expect(root.querySelector('[data-search-topic="rocket"] img')).toBeInstanceOf(HTMLImageElement)
  })

  it('runs the topic search and keeps the topic image as the first selectable result', async () => {
    const root = document.createElement('div')
    const router = makeRouter()
    const screen = new SearchScreen(router)
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ results: [makeResult()] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))
    vi.stubGlobal('fetch', fetchMock)

    screen.mount(root)
    root.querySelector<HTMLButtonElement>('[data-search-topic="cat"]')?.click()

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalled()
      expect(root.querySelector('[data-topic-result="cat"]')).toBeInstanceOf(HTMLButtonElement)
    })

    const cards = root.querySelectorAll('.tc-search-card')
    expect((cards[0] as HTMLElement).dataset.topicResult).toBe('cat')

    ;(cards[0] as HTMLButtonElement).click()
    expect(router.navigate).toHaveBeenCalledWith('#/difficulty/img_cat')
  })

  it('shows child-safe autocomplete suggestions while typing', () => {
    const root = document.createElement('div')
    const screen = new SearchScreen(makeRouter())

    screen.mount(root)
    const input = root.querySelector<HTMLInputElement>('.tc-input')!
    input.value = 'ro'
    input.dispatchEvent(new Event('input', { bubbles: true }))

    expect(root.querySelector('.tc-search-suggestion')?.textContent).toBe('rocket')
  })
})
