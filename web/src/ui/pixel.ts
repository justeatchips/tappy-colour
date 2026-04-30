type ButtonVariant = 'ghost' | 'primary' | 'accent' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonOptions {
  label?: string
  icon?: string
  ariaLabel?: string
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  type?: 'button' | 'submit' | 'reset'
  onClick?: (event: MouseEvent) => void
}

function appendContent(button: HTMLButtonElement, label?: string, icon?: string): void {
  if (icon) {
    const iconEl = document.createElement('span')
    iconEl.className = 'px-button__icon'
    iconEl.innerHTML = icon
    button.appendChild(iconEl)
  }

  if (label) {
    const labelEl = document.createElement('span')
    labelEl.className = 'px-button__label'
    labelEl.textContent = label
    button.appendChild(labelEl)
  }
}

export function createPxButton(options: ButtonOptions): HTMLButtonElement {
  const button = document.createElement('button')
  button.type = options.type ?? 'button'

  const classes = ['px-button']
  const variant = options.variant ?? 'ghost'
  classes.push(`px-button--${variant}`)

  if (options.size && options.size !== 'md') {
    classes.push(`px-button--${options.size}`)
  }
  if (options.className) classes.push(options.className)

  button.className = classes.join(' ')
  appendContent(button, options.label, options.icon)

  if (options.ariaLabel) button.setAttribute('aria-label', options.ariaLabel)
  if (options.onClick) button.addEventListener('click', options.onClick)

  return button
}

export function createIconButton(
  ariaLabel: string,
  icon: string,
  options: Omit<ButtonOptions, 'ariaLabel' | 'icon' | 'label' | 'size'> = {}
): HTMLButtonElement {
  const className = ['tc-icon-button', options.className].filter(Boolean).join(' ')
  return createPxButton({
    ...options,
    ariaLabel,
    icon,
    size: 'icon',
    className,
  })
}

export function createPanel(className = ''): HTMLDivElement {
  const panel = document.createElement('div')
  panel.className = ['px-panel', className].filter(Boolean).join(' ')
  return panel
}

export function createTopBar(title: string): { bar: HTMLDivElement; titleEl: HTMLDivElement } {
  const bar = document.createElement('div')
  bar.className = 'tc-topbar'

  const titleEl = document.createElement('div')
  titleEl.className = 'tc-topbar__title'
  titleEl.textContent = title

  return { bar, titleEl }
}

export function createToast(message: string, className = ''): HTMLDivElement {
  const toast = document.createElement('div')
  toast.className = ['tc-toast', className].filter(Boolean).join(' ')
  toast.textContent = message
  return toast
}

export function pulseElement(el: HTMLElement): void {
  el.classList.remove('tc-pop')
  void el.offsetWidth
  el.classList.add('tc-pop')
  el.addEventListener('animationend', () => el.classList.remove('tc-pop'), { once: true })
}
