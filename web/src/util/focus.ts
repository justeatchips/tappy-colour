const TEXT_EDIT_INPUT_TYPES = new Set([
  '',
  'email',
  'number',
  'password',
  'search',
  'tel',
  'text',
  'url',
])

export function isTextEditingElement(element: Element | null): element is HTMLElement {
  if (!(element instanceof HTMLElement)) return false
  if (element.isContentEditable) return true
  if (element instanceof HTMLTextAreaElement) return true
  if (!(element instanceof HTMLInputElement)) return false
  return TEXT_EDIT_INPUT_TYPES.has(element.type)
}

export function blurActiveTextEditingElement(): void {
  const active = document.activeElement
  if (isTextEditingElement(active)) {
    active.blur()
  }
}

export function shouldAutoFocusTextInput(): boolean {
  if (!window.matchMedia) return true
  return !window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(hover: none)').matches
}

export function focusTextInputWhenHelpful(input: HTMLInputElement): void {
  if (shouldAutoFocusTextInput() && input.isConnected) {
    input.focus({ preventScroll: true })
  }
}
