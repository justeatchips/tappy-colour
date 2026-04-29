// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { makeConversionSettings } from '../../src/engine/ConversionSettings'
import { UserSettings } from '../../src/model/UserSettings'
import type { ArtworkStore } from '../../src/model/ArtworkStore'
import type { Router } from '../../src/router'
import { DifficultyPicker } from '../../src/views/DifficultyPicker'

const styles = readFileSync(resolve('src/styles/global.css'), 'utf8')

function makeStore(): ArtworkStore {
  return { saveImmediate: vi.fn() } as unknown as ArtworkStore
}

function makeRouter(): Router {
  return { navigate: vi.fn() } as unknown as Router
}

beforeEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
  UserSettings.update({
    soundEnabled: true,
    defaultSliderValue: 0.75,
    searchEnabled: false,
    autoFillEnabled: true,
    mascotId: 'rosie',
    pin: null,
  })
})

describe('DifficultyPicker defaults', () => {
  it('starts the slider, chick row, and stats from the saved default difficulty', () => {
    const root = document.createElement('div')
    document.body.appendChild(root)
    const screen = new DifficultyPicker(makeRouter(), makeStore(), 'starter', null)
    const expectedSettings = makeConversionSettings(0.75)

    screen.mount(root)

    const slider = root.querySelector<HTMLInputElement>('#diff-slider')
    expect(slider).toBeInstanceOf(HTMLInputElement)
    expect(slider!.value).toBe('75')
    expect(root.querySelectorAll('.chick-row img')).toHaveLength(7)
    expect(root.querySelector('#diff-stat-grid')?.textContent).toBe(`${expectedSettings.gridSize}\u00d7${expectedSettings.gridSize}`)
    expect(root.querySelector('#diff-stat-colours')?.textContent).toBe(`${expectedSettings.paletteSize}`)
  })

  it('shows smart preview cards that can set the difficulty', () => {
    const root = document.createElement('div')
    document.body.appendChild(root)
    const screen = new DifficultyPicker(makeRouter(), makeStore(), 'starter', null)

    screen.mount(root)

    const previews = root.querySelectorAll('[data-difficulty-preview]')
    expect(previews).toHaveLength(3)
    expect(root.querySelector('[data-difficulty-preview="hard"] [data-difficulty-warning="tiny-cells"]')).toBeInstanceOf(HTMLElement)

    root.querySelector<HTMLButtonElement>('[data-difficulty-preview="easy"]')?.click()

    const slider = root.querySelector<HTMLInputElement>('#diff-slider')
    expect(slider?.value).toBe('0')
    expect(root.querySelector('#diff-stat-grid')?.textContent).toBe('16\u00d716')
  })

  it('uses responsive layout hooks for narrow difficulty screens', () => {
    const root = document.createElement('div')
    document.body.appendChild(root)
    const screen = new DifficultyPicker(makeRouter(), makeStore(), 'starter', null)

    screen.mount(root)

    expect(root.querySelector('.difficulty-screen')).toBeInstanceOf(HTMLElement)
    expect(root.querySelector('.difficulty-layout')).toBeInstanceOf(HTMLElement)
    expect(root.querySelector('.difficulty-preview-grid')).toBeInstanceOf(HTMLElement)
    expect(root.querySelector('.difficulty-controls-col')).toBeInstanceOf(HTMLElement)
    expect(root.querySelector('.difficulty-start-btn')).toBeInstanceOf(HTMLButtonElement)

    expect(styles).toContain('@media (max-width: 780px)')
    expect(styles).toContain('.difficulty-layout { grid-template-columns: 1fr; }')
    expect(styles).toContain('.difficulty-preview-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }')
    expect(styles).toContain('@media (max-width: 460px)')
    expect(styles).toContain('.difficulty-preview-grid { grid-template-columns: 1fr; }')
  })
})
