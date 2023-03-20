import { useCallback, useEffect } from 'react'

import { hasKey } from '../lib/util'

const TWO_PI = 2 * Math.PI

const PLATFORM_COLORS: { [platform: string]: string } = {
  Twitter: '#3494ff',
  Twitch: '#822fff',
}

class Particle {
  static RADIUS = 128
  static SPEED_VARIANCE = Math.PI / 8
  static MIN_SPEED = Math.PI / 32
  static MAX_SPEED = Particle.MIN_SPEED + Particle.SPEED_VARIANCE

  x = 0
  y = 0
  color: string
  squash = Math.random() * Particle.RADIUS
  spin = Math.random() * TWO_PI
  theta = Math.random() * TWO_PI
  speed = Particle.MIN_SPEED + Math.random() * Particle.SPEED_VARIANCE
  length = 0.005 + 0.05 * (this.speed / Particle.MAX_SPEED)

  constructor(x: number, y: number, color: typeof PLATFORM_COLORS[string]) {
    this.x = x
    this.y = y
    this.color = color
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
    ctx.beginPath()
    ctx.ellipse(
      this.x,
      this.y,
      Particle.RADIUS / 1.25,
      this.squash,
      this.spin,
      this.theta,
      this.theta + this.length
    )
    ctx.stroke()
    ctx.closePath()
  }
}

class Animation {
  static N_PARTICLES = 80
  static FRAME_RATE_LIMIT = 40
  static FRAME_TIME_MS = 1000 / Animation.FRAME_RATE_LIMIT

  ctx: CanvasRenderingContext2D | null = null
  w = 0
  h = 0
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
    for (const c of Object.values(PLATFORM_COLORS)) {
      this.particles[c] = Array.from(
        { length: Animation.N_PARTICLES },
        () => new Particle(x, y, c)
      )
    }
  }

  setPlatform = (platform: string | null) => {
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
    if (!this.ctx) return
    const timeSinceLastFrameMs = Date.now() - this.lastFrameTimeMs
    const dtUs = timeSinceLastFrameMs / 1000
    this.ctx.clearRect(0, 0, this.w, this.h)
    for (const [color, particles] of Object.entries(this.particles)) {
      if (this.activeColor && color !== this.activeColor) {
        this.ctx.strokeStyle = color + '44'
      }
      else {
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

interface Props {
  width: number
  height: number
  platform: string | null
}

const OrbitAnimation = ({ width, height, platform }: Props) => {
  const canvasRef = useCallback((canvas: HTMLCanvasElement | null) => {
    if (canvas) {
      animation.setCanvas(canvas)
    }
  }, [])
  useEffect(() => animation.setPlatform(platform), [platform])
  return (
    <canvas
      id="surface"
      width={width}
      height={height}
      ref={canvasRef}
      style={{ cursor: 'pointer' }}
      onClick={() => animation.plause()}
    />
  )
}

export default OrbitAnimation
