'use client'

import { useCallback, useEffect } from 'react'

import { hasKey } from 'lib/util'

const TWO_PI = 2 * Math.PI

const PLATFORM_COLORS: Record<string, [number, number, number]> = {
  Bluesky: [218, 90, 50],
  Mastodon: [240, 90, 69],
  Threads: [0, 0, 90],
  Twitch: [263, 90, 59],
  Twitter: [211, 90, 60],
  YouTube: [0, 90, 50],
}

const shiftHSL = (hsl: [number, number, number]) => {
  let [h, s, l] = hsl
  h += Math.random() * 24 - 12
  h %= 360
  if (h < 0) {
    h += 360
  }
  s += Math.random() * 16 - 8
  l += Math.random() * 24 - 12
  return `hsl(${h.toFixed(1)}, ${s.toFixed(1)}%, ${l.toFixed(1)}%)`
}

class Particle {
  static readonly SPEED_VARIANCE = Math.PI / 4
  static readonly MIN_SPEED = Math.PI / 24
  static readonly MAX_SPEED = Particle.MIN_SPEED + Particle.SPEED_VARIANCE

  cx: number
  cy: number
  rx: number
  ry: number
  color: string
  colorFaded: string
  size_variance: number
  spin = Math.random() * TWO_PI
  theta = Math.random() * TWO_PI
  speed = Particle.MIN_SPEED + Math.random() * Particle.SPEED_VARIANCE
  length = 0.005 + 0.05 * (this.speed / Particle.MAX_SPEED)

  constructor(x: number, y: number, radius: number, color: string) {
    this.cx = x
    this.cy = y
    this.rx = Math.random() * radius
    this.ry = radius
    this.size_variance = 4 * ((radius - this.rx) / radius)
    this.color = color
    this.colorFaded = `${color.slice(0, 3)}a${color.slice(3, -1)}, .25)`
    if (Math.random() >= 0.5) {
      this.size_variance *= -1
    }
    if (Math.random() >= 0.5) {
      this.speed *= -1
    }
  }

  update = (dtUs: number) => {
    this.theta += this.speed * dtUs
    if (this.theta > TWO_PI) {
      this.theta -= TWO_PI
    }
  }

  render = (ctx: CanvasRenderingContext2D) => {
    const size = 8 + this.size_variance * Math.sin(this.theta)
    ctx.lineWidth = size / 2.5
    ctx.beginPath()
    ctx.ellipse(
      this.cx,
      this.cy,
      this.ry,
      this.rx,
      this.spin,
      this.theta,
      this.theta + size / 170
    )
    ctx.stroke()
  }
}

class Animation {
  static readonly N_PARTICLES = 32
  static readonly FRAME_RATE_LIMIT = 40
  static readonly FRAME_TIME_MS = 1000 / Animation.FRAME_RATE_LIMIT

  ctx: CanvasRenderingContext2D | null = null
  w = 0
  h = 0
  initialized = false
  playing = true
  lastFrameTimeMs = 0
  activePlatform: string | null = null
  particles: Record<string, Particle[]> = {}

  setCanvas = (canvas: HTMLCanvasElement) => {
    this.ctx = canvas.getContext('2d')
    if (!this.ctx) return
    this.w = canvas.width
    this.h = canvas.height
    this.ctx.lineWidth = 3
    const x = this.w / 2
    const y = this.h / 2
    const radius = Math.min(x, y) - 16
    for (const [p, c] of Object.entries(PLATFORM_COLORS)) {
      this.particles[p] = Array.from(
        { length: Animation.N_PARTICLES },
        () => new Particle(x, y, radius, shiftHSL(c))
      )
    }
  }

  setPlatform = (platform: string | null) => {
    if (!this.initialized && platform !== null) {
      this.initialized = true
      this.playing = true
    }
    if (platform && hasKey(PLATFORM_COLORS, platform)) {
      this.activePlatform = platform
    } else {
      this.activePlatform = null
    }
    if (!this.playing || platform !== null) {
      this.start()
    }
  }

  start = () => {
    this.lastFrameTimeMs = Date.now()
    window.requestAnimationFrame(this.frame)
  }

  plause = () => {
    this.playing = !this.playing
    if (this.playing) {
      this.start()
    }
  }

  frame = () => {
    if (!this.ctx || !this.initialized) return
    const timeSinceLastFrameMs = Date.now() - this.lastFrameTimeMs
    const dtUs = timeSinceLastFrameMs / 1000
    this.ctx.clearRect(0, 0, this.w, this.h)
    for (const [platform, particles] of Object.entries(this.particles)) {
      const faded = platform !== this.activePlatform
      for (const p of particles) {
        this.ctx.strokeStyle = faded ? p.colorFaded : p.color
        p.update(dtUs)
        p.render(this.ctx)
      }
    }
    this.lastFrameTimeMs = Date.now()
    if (this.playing) {
      if (timeSinceLastFrameMs < Animation.FRAME_TIME_MS) {
        const delay = Animation.FRAME_TIME_MS - timeSinceLastFrameMs
        setTimeout(() => window.requestAnimationFrame(this.frame), delay)
      } else {
        window.requestAnimationFrame(this.frame)
      }
    }
  }
}

const animation = new Animation()

export const setAnimationPlatform = (platform: string | null) => {
  animation.setPlatform(platform)
}

interface Props {
  width: number
  height: number
}

const OrbitAnimation = ({ width, height }: Props) => {
  const canvasRef = useCallback((canvas: HTMLCanvasElement | null) => {
    if (canvas) {
      animation.setCanvas(canvas)
    }
  }, [])
  useEffect(() => {
    animation.playing = animation.initialized
    animation.start()
    return () => {
      animation.playing = false
    }
  })
  return (
    <canvas
      height={height}
      id="surface"
      onClick={() => animation.plause()}
      ref={canvasRef}
      className="pointer"
      width={width}
    />
  )
}

export default OrbitAnimation
