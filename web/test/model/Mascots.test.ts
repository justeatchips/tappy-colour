import { describe, expect, it } from 'vitest'
import { DEFAULT_MASCOT_ID, colourDoneMessage, mascotImageUrl, resolveMascotId } from '../../src/model/Mascots'

describe('mascot asset helpers', () => {
  it('uses Flutters as the default mascot', () => {
    expect(DEFAULT_MASCOT_ID).toBe('flutters')
    expect(resolveMascotId(null)).toBe('flutters')
  })

  it('preserves new mascot ids', () => {
    expect(resolveMascotId('plop')).toBe('plop')
    expect(resolveMascotId('captain-snooze')).toBe('captain-snooze')
  })

  it('falls back when a saved setting points at an old mascot', () => {
    expect(resolveMascotId('rosie')).toBe('flutters')
  })

  it('builds PNG URLs for mascot artwork', () => {
    expect(mascotImageUrl('sparklepants')).toMatch(/assets\/mascots\/png\/sparklepants\.png$/)
    expect(mascotImageUrl('rosie')).toMatch(/assets\/mascots\/png\/flutters\.png$/)
  })

  it('builds mascot-specific colour completion copy', () => {
    expect(colourDoneMessage('plop', 3)).toBe('Plop made #3 pop!')
    expect(colourDoneMessage('rosie', 2)).toBe('Flutters fluttered through #2!')
  })
})
