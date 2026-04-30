import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'

function readProjectFile(path: string): string {
  return readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')
}

describe('Tappy Colour UX system contract', () => {
  it('documents the production Pixel Native UI rules', () => {
    const doc = readProjectFile('docs/UX_SYSTEM.md')

    expect(doc).toContain('Tappy Colour UX System')
    expect(doc).toContain('Pixel Native')
    expect(doc).toContain('44px')
    expect(doc).toContain('Avoid `style.cssText`')
  })

  it('defines reusable CSS primitives for the main app surfaces', () => {
    const css = readProjectFile('src/styles/global.css')

    for (const selector of [
      '.tc-topbar',
      '.tc-tool-strip',
      '.palette-entry',
      '.tc-search-card',
      '.tc-modal-scrim',
      '.tc-toast',
      '.tc-completion-overlay',
      '.difficulty-preview-card',
      '.settings-picture-manager',
      '.colour-picker',
    ]) {
      expect(css).toContain(selector)
    }

    expect(css).toMatch(/steps\([23]\)/)
  })

  it('keeps priority view code on classes and tokens instead of static one-off chrome', () => {
    const priorityViews = [
      'src/views/PuzzleContainer.ts',
      'src/views/ToolbarStrip.ts',
      'src/views/PaletteStrip.ts',
      'src/views/SearchScreen.ts',
      'src/views/CompletionOverlay.ts',
      'src/views/GalleryCard.ts',
      'src/views/DifficultyPicker.ts',
      'src/views/SettingsScreen.ts',
      'src/views/ColourPicker.ts',
      'src/views/OnboardingCoach.ts',
      'src/views/ColourEncouragement.ts',
    ]

    const bannedPatterns = [
      /style\.cssText/,
      /#[0-9a-fA-F]{3,8}/,
      /border-radius:\s*10px/,
      /transition:\s*[^`'\n]*0\.[0-9]s/,
      /system-ui/,
    ]

    for (const view of priorityViews) {
      const source = readProjectFile(view)
      const failures = bannedPatterns
        .filter(pattern => pattern.test(source))
        .map(pattern => pattern.toString())

      expect(failures, `${view} has static visual drift patterns`).toEqual([])
    }
  })
})
