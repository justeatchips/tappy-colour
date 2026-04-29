/**
 * Get the first touch's client coordinates from a TouchEvent.
 * Returns null if no touches are present.
 */
export function primaryTouch(
  e: TouchEvent
): { clientX: number; clientY: number } | null {
  if (e.touches.length === 0) return null

  const touch = e.touches[0]
  return {
    clientX: touch.clientX,
    clientY: touch.clientY,
  }
}

/**
 * Calculate the distance in pixels between two touches (for pinch detection).
 * Returns 0 if fewer than 2 touches are present.
 */
export function touchDistance(e: TouchEvent): number {
  if (e.touches.length < 2) return 0

  const t0 = e.touches[0]
  const t1 = e.touches[1]

  const dx = t1.clientX - t0.clientX
  const dy = t1.clientY - t0.clientY

  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Call fn and also preventDefault() on the event.
 * Returns fn's result.
 */
export function withPrevent<T>(e: Event, fn: () => T): T {
  e.preventDefault()
  return fn()
}

export interface TouchTapOptions {
  movementThresholdPx?: number
}

const DEFAULT_TAP_MOVEMENT_THRESHOLD_PX = 12
const SYNTHETIC_CLICK_SUPPRESSION_MS = 700

/**
 * Runs onTap only when a touch starts and ends within a small movement radius.
 * This lets scroll gestures that begin on tappable elements finish without
 * triggering their action.
 */
export function addTouchTapListener(
  element: HTMLElement,
  onTap: (event: TouchEvent) => void,
  options: TouchTapOptions = {}
): () => void {
  const threshold = options.movementThresholdPx ?? DEFAULT_TAP_MOVEMENT_THRESHOLD_PX
  let startX = 0
  let startY = 0
  let tracking = false
  let movedBeyondThreshold = false
  let suppressClickUntil = 0

  const distanceFromStart = (touch: Touch): number => {
    const dx = touch.clientX - startX
    const dy = touch.clientY - startY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const onTouchStart = (event: TouchEvent): void => {
    if (event.touches.length !== 1) {
      tracking = false
      movedBeyondThreshold = true
      return
    }

    const touch = event.touches[0]
    startX = touch.clientX
    startY = touch.clientY
    tracking = true
    movedBeyondThreshold = false
  }

  const onTouchMove = (event: TouchEvent): void => {
    if (!tracking || event.touches.length !== 1) return
    if (distanceFromStart(event.touches[0]) > threshold) {
      movedBeyondThreshold = true
    }
  }

  const onTouchEnd = (event: TouchEvent): void => {
    if (!tracking) return

    const touch = event.changedTouches[0]
    if (touch && distanceFromStart(touch) > threshold) {
      movedBeyondThreshold = true
    }

    tracking = false
    if (movedBeyondThreshold) {
      suppressClickUntil = Date.now() + SYNTHETIC_CLICK_SUPPRESSION_MS
      return
    }

    event.preventDefault()
    onTap(event)
  }

  const onTouchCancel = (): void => {
    tracking = false
    movedBeyondThreshold = true
  }

  const onClick = (event: MouseEvent): void => {
    if (Date.now() > suppressClickUntil) return

    event.preventDefault()
    event.stopImmediatePropagation()
  }

  element.addEventListener('touchstart', onTouchStart, { passive: true })
  element.addEventListener('touchmove', onTouchMove, { passive: true })
  element.addEventListener('touchend', onTouchEnd)
  element.addEventListener('touchcancel', onTouchCancel)
  element.addEventListener('click', onClick, true)

  return () => {
    element.removeEventListener('touchstart', onTouchStart)
    element.removeEventListener('touchmove', onTouchMove)
    element.removeEventListener('touchend', onTouchEnd)
    element.removeEventListener('touchcancel', onTouchCancel)
    element.removeEventListener('click', onClick, true)
  }
}
