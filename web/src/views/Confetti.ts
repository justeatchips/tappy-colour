interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  angularVel: number
  color: string
  opacity: number
  width: number
  height: number
}

export class Confetti {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private particles: Particle[] = []
  private animFrame: number | null = null
  private lastTime = 0
  private isRunning = false

  constructor() {
    this.canvas = document.createElement('canvas')
    this.canvas.style.cssText = `
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 101;
    `
    this.ctx = this.canvas.getContext('2d')!
  }

  get element(): HTMLCanvasElement {
    return this.canvas
  }

  start(): void {
    if (this.isRunning) return

    this.isRunning = true
    this.particles = []
    this.lastTime = performance.now()

    // Set canvas size
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight

    // Spawn 60 particles
    const colors = ['#ff6b6b', '#ffd93d', '#6bcf7f', '#4d96ff', '#ff9ff3', '#54a0ff']

    for (let i = 0; i < 60; i++) {
      const x = Math.random() * window.innerWidth
      const y = -10

      const vx = (Math.random() - 0.5) * 300 // -150 to 150
      const vy = -(Math.random() * 300 + 300) // -600 to -300

      const rotation = Math.random() * Math.PI * 2
      const angularVel = (Math.random() - 0.5) * 8

      const color = colors[Math.floor(Math.random() * colors.length)]
      const opacity = 1
      const width = 6 + Math.random() * 4
      const height = 6 + Math.random() * 4

      this.particles.push({
        x,
        y,
        vx,
        vy,
        rotation,
        angularVel,
        color,
        opacity,
        width,
        height,
      })
    }

    // Start animation loop
    this.animate()
  }

  stop(): void {
    this.isRunning = false
    if (this.animFrame !== null) {
      cancelAnimationFrame(this.animFrame)
      this.animFrame = null
    }
    this.canvas.remove()
  }

  private animate = (): void => {
    const now = performance.now()
    let dt = (now - this.lastTime) / 1000
    this.lastTime = now

    // Cap dt at 0.05s
    dt = Math.min(dt, 0.05)

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vy += 800 * dt // gravity
      p.rotation += p.angularVel * dt
      p.opacity -= 0.5 * dt

      if (p.opacity <= 0) {
        this.particles.splice(i, 1)
      }
    }

    // Draw
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    for (const p of this.particles) {
      this.ctx.save()
      this.ctx.globalAlpha = p.opacity
      this.ctx.translate(p.x, p.y)
      this.ctx.rotate(p.rotation)
      this.ctx.fillStyle = p.color
      this.ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height)
      this.ctx.restore()
    }

    // Continue loop if particles remain
    if (this.particles.length > 0) {
      this.animFrame = requestAnimationFrame(this.animate)
    } else {
      this.stop()
    }
  }
}
