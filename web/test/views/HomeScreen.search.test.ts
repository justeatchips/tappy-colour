// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UserSettings } from '../../src/model/UserSettings'
import type { ArtworkStore } from '../../src/model/ArtworkStore'
import type { Router } from '../../src/router'
import { HomeScreen } from '../../src/views/HomeScreen'

function makeStore(): ArtworkStore {
  return {
    cache: [],
    on: vi.fn(() => () => {}),
    fetchAll: vi.fn(async () => []),
    getByBundledName: vi.fn(() => undefined),
  } as unknown as ArtworkStore
}

function makeRouter(): Router {
  return { navigate: vi.fn() } as unknown as Router
}

function setOnline(online: boolean): void {
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(online)
}

function searchButton(root: HTMLElement): HTMLButtonElement {
  const button = [...root.querySelectorAll('button')]
    .find(candidate => candidate.textContent?.includes('SEARCH'))
  expect(button).toBeInstanceOf(HTMLButtonElement)
  return button as HTMLButtonElement
}

beforeEach(() => {
  document.body.innerHTML = ''
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

describe('HomeScreen search access', () => {
  it('disables search when parent search is off', () => {
    const root = document.createElement('div')
    const screen = new HomeScreen(makeRouter(), makeStore())

    screen.mount(root)

    expect(searchButton(root).disabled).toBe(true)
  })

  it('disables search while offline even when parent search is on', () => {
    const root = document.createElement('div')
    UserSettings.update({ searchEnabled: true })
    setOnline(false)
    const screen = new HomeScreen(makeRouter(), makeStore())

    screen.mount(root)

    expect(searchButton(root).disabled).toBe(true)
  })

  it('enables search when parent search is on and the browser is online', () => {
    const root = document.createElement('div')
    UserSettings.update({ searchEnabled: true })
    const screen = new HomeScreen(makeRouter(), makeStore())

    screen.mount(root)

    expect(searchButton(root).disabled).toBe(false)
  })
})
