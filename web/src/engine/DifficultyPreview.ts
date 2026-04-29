import { makeConversionSettings, type ConversionSettings } from './ConversionSettings'

export type DifficultyPreviewId = 'easy' | 'medium' | 'hard'

export interface DifficultyPreview {
  id: DifficultyPreviewId
  label: string
  sliderValue: number
  settings: ConversionSettings
  estimatedMinutes: number
  tinyCells: boolean
}

const PREVIEW_LEVELS: Array<{ id: DifficultyPreviewId; label: string; sliderValue: number }> = [
  { id: 'easy', label: 'EASY', sliderValue: 0 },
  { id: 'medium', label: 'MEDIUM', sliderValue: 0.5 },
  { id: 'hard', label: 'HARD', sliderValue: 1 },
]

export function estimateCompletionMinutes(settings: Pick<ConversionSettings, 'gridSize' | 'paletteSize'>): number {
  const estimatedSeconds = Math.round((settings.gridSize * settings.gridSize * settings.paletteSize) / 100)
  return Math.max(1, Math.ceil(estimatedSeconds / 60))
}

export function makeDifficultyPreviews(autoFillEnabled: boolean): DifficultyPreview[] {
  return PREVIEW_LEVELS.map(level => {
    const settings = makeConversionSettings(level.sliderValue, { autoFillEnabled })
    return {
      ...level,
      settings,
      estimatedMinutes: estimateCompletionMinutes(settings),
      tinyCells: settings.gridSize >= 64,
    }
  })
}
