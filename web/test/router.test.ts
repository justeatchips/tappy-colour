// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Router } from '../src/router'
import { UserSettings } from '../src/model/UserSettings'
import type { ArtworkStore } from '../src/model/ArtworkStore'

function makeStore(): ArtworkStore {
  return {
    cache: [],
    on: vi.fn(() => () => {}),
    fetchAll: vi.fn(async () => []),
    getByBundledName: vi.fn(() => undefined),
  } as unknown as ArtworkStore
}

function setOnline(online: boolean): void {
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(online)
}

async function routeToSearch(root: HTMLElement): Promise<void> {
  const router = new Router(root, makeStore())
  window.location.hash = '#/search'
  await (router as unknown as { route(): Promise<void> }).route()
}

async function route(router: Router, hash: string): Promise<void> {
  window.location.hash = hash
  await (router as unknown as { route(): Promise<void> }).route()
}

beforeEach(() => {
  document.body.innerHTML = ''
  window.location.hash = ''
  vi.restoreAllMocks()
  UserSettings.update({
    soundEnabled: true,
    defaultSliderValue: 0.2,
    searchEnabled: false,
    autoFillEnabled: true,
    mascotId: 'rosie',
    pin: null,
  })
  setOnline(true)
})

describe('Router search gate', () => {
  it('blurs focused text fields before changing views', async () => {
    const root = document.createElement('div')
    const router = new Router(root, makeStore())
    const input = document.createElement('input')
    input.type = 'search'
    document.body.appendChild(input)
    input.focus()

    expect(document.activeElement).toBe(input)

    await route(router, '#/')

    expect(document.activeElement).not.toBe(input)
  })

  it('redirects direct search routes when parent search is disabled', async () => {
    const root = document.createElement('div')

    await routeToSearch(root)

    expect(window.location.hash).toBe('#/')
    expect(root.querySelector('input[aria-label="Search"]')).toBeNull()
  })

  it('keeps rendering home when an existing view navigates to disabled search', async () => {
    const root = document.createElement('div')
    const router = new Router(root, makeStore())

    await route(router, '#/')
    await route(router, '#/search')

    expect(window.location.hash).toBe('#/')
    expect(root.textContent).toContain('TAPPY COLOUR')
    expect(root.querySelector('input[aria-label="Search"]')).toBeNull()
  })

  it('redirects direct search routes while offline', async () => {
    const root = document.createElement('div')
    UserSettings.update({ searchEnabled: true })
    setOnline(false)

    await routeToSearch(root)

    expect(window.location.hash).toBe('#/')
    expect(root.querySelector('input[aria-label="Search"]')).toBeNull()
  })

  it('redirects missing staged imports home without blanking the app', async () => {
    const root = document.createElement('div')
    const router = new Router(root, makeStore())

    await route(router, '#/difficulty/import')

    expect(window.location.hash).toBe('#/')
    expect(root.textContent).toContain('TAPPY COLOUR')
  })

  it('mounts the search screen when parent search is enabled and online', async () => {
    const root = document.createElement('div')
    UserSettings.update({ searchEnabled: true })

    await routeToSearch(root)

    expect(window.location.hash).toBe('#/search')
    expect(root.querySelector('input[aria-label="Search"]')).toBeInstanceOf(HTMLInputElement)
  })
})
