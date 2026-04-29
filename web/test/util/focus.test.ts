// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  blurActiveTextEditingElement,
  focusTextInputWhenHelpful,
  isTextEditingElement,
  shouldAutoFocusTextInput,
} from '../../src/util/focus'

function stubMatchMedia(matchesByQuery: Record<string, boolean>): void {
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    matches: matchesByQuery[query] ?? false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => true),
  })))
}

afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

describe('focus helpers', () => {
  it('recognises text-editing fields without treating sliders as typing fields', () => {
    const text = document.createElement('input')
    text.type = 'text'
    const number = document.createElement('input')
    number.type = 'number'
    const slider = document.createElement('input')
    slider.type = 'range'

    expect(isTextEditingElement(text)).toBe(true)
    expect(isTextEditingElement(number)).toBe(true)
    expect(isTextEditingElement(slider)).toBe(false)
  })

  it('blurs the active text-editing field', () => {
    const input = document.createElement('input')
    input.type = 'search'
    document.body.appendChild(input)
    input.focus()

    expect(document.activeElement).toBe(input)

    blurActiveTextEditingElement()

    expect(document.activeElement).not.toBe(input)
  })

  it('skips text input autofocus on coarse-pointer devices', () => {
    stubMatchMedia({
      '(pointer: coarse)': true,
      '(hover: none)': true,
    })

    const input = document.createElement('input')
    document.body.appendChild(input)

    expect(shouldAutoFocusTextInput()).toBe(false)

    focusTextInputWhenHelpful(input)

    expect(document.activeElement).not.toBe(input)
  })
})
