import { describe, expect, it } from 'vitest'
import { configureFixedRoot, configureScrollableRoot } from '../../src/views/BaseView'

function fakeRoot(): HTMLElement & { properties: Map<string, string> } {
  const properties = new Map<string, string>()
  const style = {
    overflowX: '',
    overflowY: '',
    touchAction: '',
    setProperty(name: string, value: string) {
      properties.set(name, value)
    },
    removeProperty(name: string) {
      properties.delete(name)
      return ''
    },
  } as unknown as CSSStyleDeclaration

  return { style, properties } as HTMLElement & { properties: Map<string, string> }
}

describe('root viewport configuration', () => {
  it('allows vertical touch panning for scrollable screens', () => {
    const root = fakeRoot()

    configureScrollableRoot(root)

    expect(root.style.overflowX).toBe('hidden')
    expect(root.style.overflowY).toBe('auto')
    expect(root.style.touchAction).toBe('pan-y')
    expect(root.properties.get('-webkit-overflow-scrolling')).toBe('touch')
  })

  it('restores fixed touch handling for canvas-style screens', () => {
    const root = fakeRoot()
    configureScrollableRoot(root)

    configureFixedRoot(root)

    expect(root.style.overflowX).toBe('hidden')
    expect(root.style.overflowY).toBe('hidden')
    expect(root.style.touchAction).toBe('none')
    expect(root.properties.has('-webkit-overflow-scrolling')).toBe(false)
  })
})
