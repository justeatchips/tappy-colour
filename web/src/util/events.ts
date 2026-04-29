// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Listener<T> = (payload: T) => void

export class EventEmitter<Events extends Record<string, unknown>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private listeners = new Map<keyof Events, Set<Listener<any>>>()

  on<K extends keyof Events>(
    event: K,
    listener: Listener<Events[K]>
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.listeners.get(event)!.add(listener as Listener<any>)
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.listeners.get(event)?.delete(listener as Listener<any>)
    }
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    const set = this.listeners.get(event)
    if (!set) return
    for (const listener of set) {
      listener(payload)
    }
  }

  off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.listeners.get(event)?.delete(listener as Listener<any>)
  }
}
