import { UserSettings } from '../model/UserSettings'

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (ctx) return ctx
  try {
    ctx = new AudioContext()
    return ctx
  } catch {
    return null
  }
}

/**
 * Call on the first user gesture to unlock Web Audio on Safari.
 */
export function unlockAudio(): void {
  const c = getCtx()
  if (c && c.state === 'suspended') {
    c.resume().catch(() => {})
  }
}

function isSoundEnabled(): boolean {
  return UserSettings.get().soundEnabled
}

/**
 * Play a short, soft tap click using Web Audio API.
 */
export function playTap(): void {
  if (!isSoundEnabled()) return
  const c = getCtx()
  if (!c) return

  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.connect(gain)
  gain.connect(c.destination)

  osc.type = 'sine'
  osc.frequency.setValueAtTime(880, c.currentTime)
  osc.frequency.exponentialRampToValueAtTime(440, c.currentTime + 0.04)

  gain.gain.setValueAtTime(0.08, c.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.05)

  osc.start(c.currentTime)
  osc.stop(c.currentTime + 0.05)
}

/**
 * Play a cheerful ascending chime for puzzle completion.
 */
export function playCompletion(): void {
  if (!isSoundEnabled()) return
  const c = getCtx()
  if (!c) return

  const notes = [523, 659, 784, 1047]  // C5 E5 G5 C6
  notes.forEach((freq, i) => {
    const t = c.currentTime + i * 0.15

    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.connect(gain)
    gain.connect(c.destination)

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, t)

    gain.gain.setValueAtTime(0.0, t)
    gain.gain.linearRampToValueAtTime(0.18, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35)

    osc.start(t)
    osc.stop(t + 0.35)
  })
}

/**
 * Play a gentle pop when a colour is fully completed.
 */
export function playColourDone(): void {
  if (!isSoundEnabled()) return
  const c = getCtx()
  if (!c) return

  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.connect(gain)
  gain.connect(c.destination)

  osc.type = 'sine'
  osc.frequency.setValueAtTime(660, c.currentTime)
  osc.frequency.linearRampToValueAtTime(880, c.currentTime + 0.08)

  gain.gain.setValueAtTime(0.12, c.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15)

  osc.start(c.currentTime)
  osc.stop(c.currentTime + 0.15)
}
