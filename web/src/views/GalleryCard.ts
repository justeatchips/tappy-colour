import type { Artwork } from '../model/Artwork'
import { unlockAudio } from '../util/sound'
import { addTouchTapListener } from '../util/touch'

export interface GalleryCardOptions {
  artwork: Artwork
  /** URL string for bundled images, or null to derive from thumbnailBlob */
  imageSrc: string | null
  onOpen: () => void
  onDelete?: () => void
  showDelete?: boolean
  objectUrls: { create(b: Blob | MediaSource): string }
}

export function createGalleryCard(opts: GalleryCardOptions): HTMLElement {
  const { artwork, imageSrc, onDelete, showDelete = false } = opts

  const card = document.createElement('button')
  card.style.cssText = `
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px;
    border-radius: 6px;
    background: var(--tc-surface);
    border: 4px solid var(--tc-ink-black);
    box-shadow: 0 6px 0 0 var(--tc-ink-black);
    cursor: pointer;
    transition: transform 80ms steps(2), box-shadow 80ms steps(2);
    user-select: none;
    -webkit-user-select: none;
    touch-action: pan-y;
    font-family: inherit;
  `

  card.addEventListener('mouseover', () => {
    card.style.transform = 'translateY(-2px)'
    card.style.boxShadow = '0 8px 0 0 var(--tc-ink-black)'
  })
  card.addEventListener('mouseout', () => {
    card.style.transform = 'translateY(0)'
    card.style.boxShadow = '0 6px 0 0 var(--tc-ink-black)'
  })

  // Image container
  const imageContainer = document.createElement('div')
  imageContainer.className = 'gallery-card__thumb'
  imageContainer.style.cssText = `
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    background: var(--tc-bg-alt);
    margin-bottom: 8px;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    border: 2px solid rgba(31,46,74,0.1);
  `

  const img = document.createElement('img')
  img.alt = artwork.title
  img.style.cssText = `width: 100%; height: 100%; object-fit: cover;`

  if (imageSrc) {
    img.src = imageSrc
  } else if (artwork.thumbnailBlob) {
    img.src = opts.objectUrls.create(artwork.thumbnailBlob)
  } else {
    // Fallback placeholder
    img.style.background = 'var(--tc-bg-alt)'
  }
  imageContainer.appendChild(img)

  if (artwork.isComplete) {
    const badge = document.createElement('div')
    badge.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      width: 32px;
      height: 32px;
      background: var(--tc-primary);
      border-radius: 4px;
      border: 2px solid var(--tc-ink-black);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 16px;
      font-weight: bold;
      box-shadow: 0 2px 0 0 var(--tc-ink-black);
    `
    badge.textContent = '★'
    imageContainer.appendChild(badge)
  }

  // Delete button — top-left
  if (showDelete && onDelete) {
    const deleteBtn = document.createElement('button')
    deleteBtn.textContent = '🗑'
    deleteBtn.setAttribute('aria-label', 'Delete')
    deleteBtn.style.cssText = `
      position: absolute;
      top: 6px;
      left: 6px;
      width: 44px;
      height: 44px;
      min-width: 44px;
      min-height: 44px;
      background: var(--tc-ink-black);
      color: white;
      border: 2px solid var(--tc-ink-black);
      border-radius: 4px;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 2;
      padding: 0;
      transition: background 80ms steps(2);
    `
    deleteBtn.addEventListener('mouseover', () => { deleteBtn.style.background = 'var(--tc-primary)' })
    deleteBtn.addEventListener('mouseout', () => { deleteBtn.style.background = 'var(--tc-ink-black)' })
    deleteBtn.addEventListener('click', (e) => { e.stopPropagation(); onDelete() })
    deleteBtn.style.touchAction = 'manipulation'
    addTouchTapListener(deleteBtn, (e) => { e.stopPropagation(); onDelete() })
    imageContainer.appendChild(deleteBtn)
  }

  card.appendChild(imageContainer)

  // Title
  const titleEl = document.createElement('h3')
  titleEl.className = 'gallery-card__title'
  titleEl.textContent = artwork.title
  titleEl.style.cssText = `
    margin: 0;
    font-family: var(--tc-font-display);
    font-size: 14px;
    letter-spacing: 1px;
    margin-bottom: 4px;
    color: var(--tc-ink);
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `
  card.appendChild(titleEl)

  // Progress
  const total = artwork.grid.columns * artwork.grid.rows
  const painted = total - artwork.grid.unpaintedCount
  const percent = Math.round((100 * painted) / total)

  if (artwork.isComplete) {
    const doneLabel = document.createElement('div')
    doneLabel.className = 'gallery-card__done'
    doneLabel.textContent = '★ DONE'
    card.appendChild(doneLabel)
  } else {
    // Progress bar
    const progressBarContainer = document.createElement('div')
    progressBarContainer.className = 'gallery-card__progress-bar'
    progressBarContainer.style.cssText = `
      height: 8px;
      background: var(--tc-bg-alt);
      border: 2px solid var(--tc-ink-black);
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 4px;
    `
    const progressFill = document.createElement('div')
    progressFill.className = 'gallery-card__progress-fill'
    progressFill.style.cssText = `
      height: 100%;
      background: var(--tc-primary);
      width: ${percent}%;
    `
    progressBarContainer.appendChild(progressFill)
    card.appendChild(progressBarContainer)

    // Percentage text
    const percentEl = document.createElement('div')
    percentEl.className = 'gallery-card__pct'
    percentEl.style.cssText = `
      font-family: var(--tc-font-display);
      font-size: 12px;
      color: var(--tc-ink-soft);
      text-align: center;
      letter-spacing: 0.5px;
    `
    percentEl.textContent = `${percent}% DONE`
    card.appendChild(percentEl)
  }

  card.addEventListener('click', () => { unlockAudio(); opts.onOpen() })
  addTouchTapListener(card, () => { unlockAudio(); opts.onOpen() })

  return card
}
