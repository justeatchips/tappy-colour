import { describe, expect, it } from 'vitest'
import { estimateCompletionMinutes, makeDifficultyPreviews } from '../../src/engine/DifficultyPreview'
import { makeConversionSettings } from '../../src/engine/ConversionSettings'

describe('DifficultyPreview', () => {
  it('builds easy, medium, and hard previews from the conversion settings', () => {
    const previews = makeDifficultyPreviews(false)

    expect(previews.map(preview => preview.id)).toEqual(['easy', 'medium', 'hard'])
    expect(previews[0].settings).toEqual(makeConversionSettings(0, { autoFillEnabled: false }))
    expect(previews[1].settings).toEqual(makeConversionSettings(0.5, { autoFillEnabled: false }))
    expect(previews[2].settings).toEqual(makeConversionSettings(1, { autoFillEnabled: false }))
  })

  it('flags tiny-cell previews and estimates completion time', () => {
    const previews = makeDifficultyPreviews(true)

    expect(previews[0].tinyCells).toBe(false)
    expect(previews[2].tinyCells).toBe(true)
    expect(previews[2].estimatedMinutes).toBe(estimateCompletionMinutes(previews[2].settings))
    expect(previews[2].estimatedMinutes).toBeGreaterThan(previews[0].estimatedMinutes)
  })
})
