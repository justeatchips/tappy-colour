export abstract class View {
  abstract mount(root: HTMLElement): void
  abstract unmount(): void
}

export function configureScrollableRoot(root: HTMLElement): void {
  root.style.overflowX = 'hidden'
  root.style.overflowY = 'auto'
  root.style.touchAction = 'pan-y'
  root.style.setProperty('-webkit-overflow-scrolling', 'touch')
}

export function configureFixedRoot(root: HTMLElement): void {
  root.style.overflowX = 'hidden'
  root.style.overflowY = 'hidden'
  root.style.touchAction = 'none'
  root.style.removeProperty('-webkit-overflow-scrolling')
}
