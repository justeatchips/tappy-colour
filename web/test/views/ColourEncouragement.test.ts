// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UserSettings } from '../../src/model/UserSettings'
import { ColourEncouragement } from '../../src/views/ColourEncouragement'

beforeEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    matches: query === '(prefers-reduced-motion: reduce)',
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })))
  UserSettings.update({
    soundEnabled: false,
    defaultSliderValue: 0.2,
    searchEnabled: false,
    autoFillEnabled: true,
    mascotId: 'plop',
    pin: null,
  })
})

describe('ColourEncouragement', () => {
  it('shows mascot copy and respects reduced motion', () => {
    vi.useFakeTimers()
    try {
      const root = document.createElement('div')
      const encouragement = new ColourEncouragement()

      encouragement.show(root, 3)

      const el = root.querySelector<HTMLElement>('[data-colour-encouragement]')
      expect(el).toBeInstanceOf(HTMLElement)
      expect(el?.textContent).toContain('Plop made #3 pop!')
      expect(el?.style.transition).toBe('none')
      expect(el?.querySelector('img')?.classList.contains('mascot-bob')).toBe(false)

      vi.advanceTimersByTime(1600)

      expect(root.querySelector('[data-colour-encouragement]')).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })
})
