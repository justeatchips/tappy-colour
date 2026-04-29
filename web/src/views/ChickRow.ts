export class ChickRow {
  private el: HTMLElement
  private currentCount = 0

  constructor() {
    this.el = document.createElement('div')
    this.el.className = 'chick-row'
    this.el.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      min-height: 40px;
      align-items: center;
      justify-content: center;
    `

    // Create stylesheet for animations if not already present
    if (!document.getElementById('chick-row-styles')) {
      const style = document.createElement('style')
      style.id = 'chick-row-styles'
      style.textContent = `
        @keyframes chick-enter {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes chick-exit {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.5);
          }
        }
        .chick-enter {
          animation: chick-enter 0.3s ease-out;
        }
        .chick-exit {
          animation: chick-exit 0.3s ease-in;
        }
      `
      document.head.appendChild(style)
    }
  }

  get element(): HTMLElement {
    return this.el
  }

  update(sliderValue: number): void {
    const targetCount = Math.max(1, Math.floor(1 + sliderValue * 9))

    if (targetCount > this.currentCount) {
      // Add chicks
      for (let i = this.currentCount; i < targetCount; i++) {
        const img = document.createElement('img')
        img.src = import.meta.env.BASE_URL + 'images/chick.png'
        img.alt = 'chick'
        img.className = 'chick-enter'
        img.style.cssText = `
          width: 32px;
          height: 32px;
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        `
        this.el.appendChild(img)
      }
    } else if (targetCount < this.currentCount) {
      // Remove chicks
      const chickElements = this.el.querySelectorAll('img')
      for (let i = chickElements.length - 1; i >= targetCount; i--) {
        const img = chickElements[i] as HTMLElement
        img.classList.remove('chick-enter')
        img.classList.add('chick-exit')

        const removeOnAnimEnd = () => {
          img.remove()
          img.removeEventListener('animationend', removeOnAnimEnd)
        }
        img.addEventListener('animationend', removeOnAnimEnd)
      }
    }

    this.currentCount = targetCount
  }
}
