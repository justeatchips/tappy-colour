// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Router } from '../../src/router'
import type { OpenverseResult } from '../../src/util/searchSafety'
import { ImportStaging } from '../../src/model/ImportStaging'
import { SearchScreen } from '../../src/views/SearchScreen'

const { decodeAndDownscaleMock } = vi.hoisted(() => ({
  decodeAndDownscaleMock: vi.fn(),
}))

vi.mock('../../src/util/imageImport', () => ({
  decodeAndDownscale: decodeAndDownscaleMock,
}))

function makeRouter(): Router {
  return { navigate: vi.fn() } as unknown as Router
}

function makeBitmap(): ImageBitmap {
  return {
    width: 8,
    height: 8,
    close: vi.fn(),
  } as unknown as ImageBitmap
}

function makeResult(overrides: Partial<OpenverseResult> = {}): OpenverseResult {
  return {
    id: 'cat-1',
    title: 'Orange Cat',
    url: 'https://images.example.test/full-cat.jpg',
    thumbnail: 'https://images.example.test/thumb-cat.jpg',
    creator: 'Kid Safe Photos',
    creator_url: 'https://creator.example.test',
    license: 'cc0',
    license_version: '1.0',
    license_url: 'https://license.example.test/cc0',
    foreign_landing_url: 'https://landing.example.test/orange-cat',
    tags: [{ name: 'cat' }],
    ...overrides,
  }
}

function imageResponse(body: string, type = 'image/jpeg', extraHeaders: Record<string, string> = {}): Response {
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': type,
      'Content-Length': String(body.length),
      ...extraHeaders,
    },
  })
}

async function selectSearchResult(result: OpenverseResult): Promise<{ router: Router }> {
  const root = document.createElement('div')
  document.body.appendChild(root)
  const router = makeRouter()
  const screen = new SearchScreen(router)
  screen.mount(root)

  await (screen as unknown as {
    handleSelect(result: OpenverseResult): Promise<void>
  }).handleSelect(result)

  return { router }
}

beforeEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
  ImportStaging.take()
  ImportStaging.clearQueue()
  decodeAndDownscaleMock.mockResolvedValue(makeBitmap())
})

describe('SearchScreen result selection', () => {
  it('stages the full selected image instead of the thumbnail when it is usable', async () => {
    const result = makeResult()
    const fetchMock = vi.fn(async (url: string | URL | Request) => {
      expect(String(url)).toBe(result.url)
      return imageResponse('full image')
    })
    vi.stubGlobal('fetch', fetchMock)

    const { router } = await selectSearchResult(result)

    const staged = ImportStaging.take()
    expect(staged?.imageBlob).toBeInstanceOf(Blob)
    await expect(staged?.imageBlob.text()).resolves.toBe('full image')
    expect(staged?.attribution?.usedImageUrl).toBe(result.url)
    expect(staged?.attribution?.usedImageKind).toBe('full')
    expect(decodeAndDownscaleMock).toHaveBeenCalledWith(staged?.imageBlob)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(router.navigate).toHaveBeenCalledWith('#/difficulty/import')
  })

  it('falls back to the thumbnail when the full image response is too large', async () => {
    const result = makeResult()
    const fetchMock = vi.fn(async (url: string | URL | Request) => {
      if (String(url) === result.url) {
        return imageResponse('too big', 'image/jpeg', {
          'Content-Length': String(16 * 1024 * 1024),
        })
      }
      if (String(url) === result.thumbnail) return imageResponse('thumbnail image')
      throw new Error(`Unexpected URL ${String(url)}`)
    })
    vi.stubGlobal('fetch', fetchMock)

    await selectSearchResult(result)

    const staged = ImportStaging.take()
    await expect(staged?.imageBlob.text()).resolves.toBe('thumbnail image')
    expect(staged?.attribution?.usedImageUrl).toBe(result.thumbnail)
    expect(staged?.attribution?.usedImageKind).toBe('thumbnail')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('falls back to the thumbnail when the full image is blocked by fetch/CORS', async () => {
    const result = makeResult()
    const fetchMock = vi.fn(async (url: string | URL | Request) => {
      if (String(url) === result.url) throw new TypeError('Failed to fetch')
      if (String(url) === result.thumbnail) return imageResponse('thumbnail image')
      throw new Error(`Unexpected URL ${String(url)}`)
    })
    vi.stubGlobal('fetch', fetchMock)

    await selectSearchResult(result)

    const staged = ImportStaging.take()
    await expect(staged?.imageBlob.text()).resolves.toBe('thumbnail image')
    expect(staged?.attribution?.usedImageUrl).toBe(result.thumbnail)
    expect(staged?.attribution?.usedImageKind).toBe('thumbnail')
  })
})
