import { useCallback, useEffect } from 'react'

import { hasKey } from '../lib/util'

const TWO_PI = 2 * Math.PI

const PLATFORM_COLORS: { [platform: string]: string } = {
  Twitter: '#3494ff',
  Twitch: '#822fff',
}

class Particle {
  static readonly SPEED_VARIANCE = Math.PI / 4
  static readonly MIN_SPEED = Math.PI / 24
  static readonly MAX_SPEED = Particle.MIN_SPEED + Particle.SPEED_VARIANCE

  cx: number
  cy: number
  rx: number
  ry: number
  size_variance: number
  spin = Math.random() * TWO_PI
  theta = Math.random() * TWO_PI
  speed = Particle.MIN_SPEED + Math.random() * Particle.SPEED_VARIANCE
  length = 0.005 + 0.05 * (this.speed / Particle.MAX_SPEED)

  constructor(x: number, y: number, radius: number) {
    this.cx = x
    this.cy = y
    this.rx = Math.random() * radius
    this.ry = radius
    this.size_variance = 4 * ((radius - this.rx) / radius)
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
  static readonly N_PARTICLES = 64
  static readonly FRAME_RATE_LIMIT = 40
  static readonly FRAME_TIME_MS = 1000 / Animation.FRAME_RATE_LIMIT

  ctx: CanvasRenderingContext2D | null = null
  w = 0
  h = 0
  initialized = false
  playing = true
  lastFrameTimeMs = 0
  activeColor: string | null = null
  particles: { [color: string]: Particle[] } = {}

  setCanvas = (canvas: HTMLCanvasElement) => {
    this.ctx = canvas.getContext('2d')
    if (!this.ctx) return
    this.w = canvas.width
    this.h = canvas.height
    this.ctx.lineWidth = 3
    const x = this.w / 2
    const y = this.h / 2
    const radius = Math.min(x, y) - 16
    for (const c of Object.values(PLATFORM_COLORS)) {
      this.particles[c] = Array.from(
        { length: Animation.N_PARTICLES },
        () => new Particle(x, y, radius)
      )
    }
  }

  setPlatform = (platform: string | null) => {
    if (!this.initialized && platform !== null) {
      this.initialized = true
      this.playing = true
    }
    if (platform && hasKey(PLATFORM_COLORS, platform)) {
      this.activeColor = PLATFORM_COLORS[platform]
    } else {
      this.activeColor = null
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
    for (const [color, particles] of Object.entries(this.particles)) {
      if (this.activeColor && color !== this.activeColor) {
        this.ctx.strokeStyle = color + '44'
      } else {
        this.ctx.strokeStyle = color
      }
      for (const p of particles) {
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
      style={{ cursor: 'pointer' }}
      width={width}
    />
  )
}

export default OrbitAnimation
