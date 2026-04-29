import { afterEach, describe, expect, it, vi } from 'vitest'
import { makeConversionSettings } from '../../src/engine/ConversionSettings'
import type { ConversionOutput } from '../../src/engine/ImageConverter'

type Listener = (event: unknown) => void

class FakeWorker {
  static instances: FakeWorker[] = []

  readonly listeners = new Map<string, Listener[]>()
  readonly postMessage = vi.fn()
  readonly terminate = vi.fn()

  constructor() {
    FakeWorker.instances.push(this)
  }

  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
    const fn: Listener = typeof listener === 'function'
      ? listener as Listener
      : event => listener.handleEvent(event as Event)
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn])
  }

  dispatchMessage(data: unknown): void {
    this.dispatch('message', { data })
  }

  dispatchError(message: string): { message: string; preventDefault: ReturnType<typeof vi.fn> } {
    const event = { message, preventDefault: vi.fn() }
    this.dispatch('error', event)
    return event
  }

  private dispatch(type: string, event: unknown): void {
    for (const listener of this.listeners.get(type) ?? []) {
      listener(event)
    }
  }
}

function output(): ConversionOutput {
  return {
    paletteIndices: new Uint8Array([0]),
    centroids: [{ r: 1, g: 2, b: 3, a: 255 }],
    columns: 1,
    rows: 1,
  }
}

function postedId(worker: FakeWorker, callIndex = 0): number {
  const message = worker.postMessage.mock.calls[callIndex]?.[0] as { id?: number } | undefined
  if (typeof message?.id !== 'number') throw new Error('Expected worker message id')
  return message.id
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ImageConverter worker lifecycle', () => {
  it('rejects only the affected request when the worker reports a conversion error', async () => {
    vi.resetModules()
    FakeWorker.instances = []
    vi.stubGlobal('Worker', FakeWorker)
    const { convertInWorker } = await import('../../src/engine/ImageConverter')
    const settings = makeConversionSettings(0)

    const failed = convertInWorker('bad.jpg', settings)
    const healthy = convertInWorker('good.jpg', settings)
    const worker = FakeWorker.instances[0]

    worker.dispatchMessage({ id: postedId(worker, 0), error: 'bad image' })
    worker.dispatchMessage({ id: postedId(worker, 1), result: output() })

    await expect(failed).rejects.toThrow('bad image')
    await expect(healthy).resolves.toEqual(output())
    expect(worker.terminate).not.toHaveBeenCalled()
  })

  it('rejects and clears all pending requests after a worker-level error, then creates a fresh worker', async () => {
    vi.resetModules()
    FakeWorker.instances = []
    vi.stubGlobal('Worker', FakeWorker)
    const { convertInWorker } = await import('../../src/engine/ImageConverter')
    const settings = makeConversionSettings(0)

    const first = convertInWorker('first.jpg', settings)
    const second = convertInWorker('second.jpg', settings)
    const failedWorker = FakeWorker.instances[0]

    const errorEvent = failedWorker.dispatchError('worker exploded')

    await expect(first).rejects.toThrow('worker exploded')
    await expect(second).rejects.toThrow('worker exploded')
    expect(errorEvent.preventDefault).toHaveBeenCalled()
    expect(failedWorker.terminate).toHaveBeenCalledTimes(1)

    const next = convertInWorker('next.jpg', settings)
    expect(FakeWorker.instances).toHaveLength(2)
    const freshWorker = FakeWorker.instances[1]
    freshWorker.dispatchMessage({ id: postedId(freshWorker), result: output() })

    await expect(next).resolves.toEqual(output())
    expect(freshWorker.terminate).not.toHaveBeenCalled()
  })
})
