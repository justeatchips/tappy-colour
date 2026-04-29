import type { Artwork } from '../model/Artwork'
import { unlockAudio } from '../util/sound'

export function createThumbnail(
  imageSrc: string,
  title: string,
  artwork: Artwork | undefined,
  onClick: () => void
): HTMLElement {
  const card = document.createElement('div')
  card.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    user-select: none;
    -webkit-user-select: none;
  `

  card.addEventListener('mouseover', () => {
    card.style.transform = 'translateY(-2px)'
    card.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
  })

  card.addEventListener('mouseout', () => {
    card.style.transform = 'translateY(0)'
    card.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)'
  })

  // Image square
  const imageContainer = document.createElement('div')
  imageContainer.style.cssText = `
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    background: #f5f5f5;
    border-radius: 6px;
    overflow: hidden;
  `

  const img = document.createElement('img')
  img.src = imageSrc
  img.alt = title
  img.style.cssText = `
    width: 100%;
    height: 100%;
    object-fit: cover;
  `
  imageContainer.appendChild(img)

  // Completion badge (checkmark)
  if (artwork?.isComplete) {
    const badge = document.createElement('div')
    badge.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      width: 32px;
      height: 32px;
      background: #10b981;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
      font-weight: bold;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    `
    badge.textContent = '✓'
    imageContainer.appendChild(badge)
  }

  card.appendChild(imageContainer)

  // Title
  const titleEl = document.createElement('h3')
  titleEl.textContent = title
  titleEl.style.cssText = `
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    text-align: center;
  `
  card.appendChild(titleEl)

  // Progress (if artwork exists)
  if (artwork) {
    const total = artwork.grid.columns * artwork.grid.rows
    const painted = total - artwork.grid.unpaintedCount
    const percent = Math.round((100 * painted) / total)
    const progressText = `${percent}% done`

    const progressEl = document.createElement('p')
    progressEl.textContent = progressText
    progressEl.style.cssText = `
      margin: 0;
      font-size: 12px;
      color: #6b7280;
      text-align: center;
    `
    card.appendChild(progressEl)
  }

  // Touch and click handlers
  card.addEventListener('touchend', (e: TouchEvent) => {
    e.preventDefault()
    unlockAudio()
    onClick()
  })

  card.addEventListener('click', () => {
    unlockAudio()
    onClick()
  })

  return card
}
