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
  card.type = 'button'
  card.className = 'px-panel gallery-card'

  const imageContainer = document.createElement('div')
  imageContainer.className = 'gallery-card__thumb'

  const img = document.createElement('img')
  img.alt = artwork.title

  if (imageSrc) {
    img.src = imageSrc
  } else if (artwork.thumbnailBlob) {
    img.src = opts.objectUrls.create(artwork.thumbnailBlob)
  }
  imageContainer.appendChild(img)

  if (artwork.isComplete) {
    const badge = document.createElement('div')
    badge.className = 'gallery-card__badge'
    badge.textContent = 'DONE'
    imageContainer.appendChild(badge)
  }

  if (showDelete && onDelete) {
    const deleteBtn = document.createElement('button')
    deleteBtn.type = 'button'
    deleteBtn.className = 'gallery-card__delete'
    deleteBtn.textContent = 'DEL'
    deleteBtn.setAttribute('aria-label', 'Delete')
    deleteBtn.addEventListener('click', (e) => { e.stopPropagation(); onDelete() })
    addTouchTapListener(deleteBtn, (e) => { e.stopPropagation(); onDelete() })
    imageContainer.appendChild(deleteBtn)
  }

  card.appendChild(imageContainer)

  const titleEl = document.createElement('h3')
  titleEl.className = 'gallery-card__title'
  titleEl.textContent = artwork.title
  card.appendChild(titleEl)

  const total = artwork.grid.columns * artwork.grid.rows
  const painted = total - artwork.grid.unpaintedCount
  const percent = Math.round((100 * painted) / total)

  if (artwork.isComplete) {
    const doneLabel = document.createElement('div')
    doneLabel.className = 'gallery-card__done'
    doneLabel.textContent = 'DONE'
    card.appendChild(doneLabel)
  } else {
    const progressBarContainer = document.createElement('div')
    progressBarContainer.className = 'gallery-card__progress-bar'
    const progressFill = document.createElement('div')
    progressFill.className = 'gallery-card__progress-fill'
    progressFill.style.width = `${percent}%`
    progressBarContainer.appendChild(progressFill)
    card.appendChild(progressBarContainer)

    const percentEl = document.createElement('div')
    percentEl.className = 'gallery-card__pct'
    percentEl.textContent = `${percent}% DONE`
    card.appendChild(percentEl)
  }

  card.addEventListener('click', () => { unlockAudio(); opts.onOpen() })
  addTouchTapListener(card, () => { unlockAudio(); opts.onOpen() })

  return card
}
