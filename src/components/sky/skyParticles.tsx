'use client'

import { useEffect, useRef } from 'react'
import type { SkyKind } from '@/lib/weather/theme'

type Props = { kind: SkyKind; isDay: boolean }
type Mode = 'rain' | 'snow' | 'stars'
type Particle = { x: number; y: number; size: number; speed: number; phase: number }

const TAU = Math.PI * 2
const SLANT = 0.18 // на сколько капля сносится ветром (пикселей по горизонтали на пиксель падения)
const FRAME_MS = 1000 / 40 // потолок около 30-40 кадров в секунду: глаз не заметит, а нагрузка вдвое меньше

// Максимум частиц: на широком и на узком экране
const LIMITS: Record<Mode, [number, number]> = {
  rain: [400, 150],
  snow: [220, 100],
  stars: [160, 80],
}
// Сколько пикселей экрана приходится на одну частицу
const DENSITY: Record<Mode, number> = { rain: 3500, snow: 5000, stars: 6000 }

function getMode(kind: SkyKind, isDay: boolean): Mode | null {
  if (kind === 'rain' || kind === 'storm') return 'rain'
  if (kind === 'snow') return 'snow'
  if (!isDay && (kind === 'clear' || kind === 'partly')) return 'stars'
  return null
}

const rnd = (min: number, max: number) => min + Math.random() * (max - min)

function countFor(mode: Mode, w: number, h: number, heavy: boolean) {
  const [max, maxSmall] = LIMITS[mode]
  const cap = w < 640 ? maxSmall : max
  return Math.round(Math.min(((w * h) / DENSITY[mode]) * (heavy ? 1.3 : 1), cap))
}

function spawn(mode: Mode, w: number, h: number, heavy: boolean): Particle {
  if (mode === 'rain') {
    // x шире экрана: капли сносит влево, и справа без запаса образуется пустая полоса
    return { x: rnd(0, w + h * SLANT), y: rnd(0, h), size: rnd(10, 22), speed: rnd(650, 1000) * (heavy ? 1.25 : 1), phase: 0 }
  }
  if (mode === 'snow') {
    return { x: rnd(0, w), y: rnd(0, h), size: rnd(1, 3.2), speed: rnd(30, 70), phase: rnd(0, TAU) }
  }
  // звёзды: только в верхней части неба; speed здесь частота мерцания
  return { x: rnd(0, w), y: rnd(0, h * 0.75), size: rnd(0.4, 1.4), speed: rnd(0.6, 2.2), phase: rnd(0, TAU) }
}

// Один кадр. dt в секундах, t общее время анимации
function draw(
  ctx: CanvasRenderingContext2D,
  mode: Mode,
  ps: Particle[],
  w: number,
  h: number,
  t: number,
  dt: number,
) {
  ctx.clearRect(0, 0, w, h)

  if (mode === 'rain') {
    const xMax = w + h * SLANT
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)'
    ctx.lineWidth = 1
    ctx.beginPath() // все капли одним путём и одним stroke: так быстрее всего
    for (const p of ps) {
      p.y += p.speed * dt
      p.x -= p.speed * SLANT * dt
      if (p.y > h + p.size || p.x < -20) {
        p.y = -p.size
        p.x = rnd(0, xMax)
      }
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(p.x + p.size * SLANT, p.y - p.size)
    }
    ctx.stroke()
    return
  }

  if (mode === 'snow') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
    ctx.beginPath()
    for (const p of ps) {
      p.y += p.speed * dt
      p.x += Math.sin(t * 0.8 + p.phase) * 18 * dt // лёгкое покачивание
      if (p.y > h + p.size) {
        p.y = -p.size
        p.x = rnd(0, w)
      }
      if (p.x < -5) p.x = w + 5
      if (p.x > w + 5) p.x = -5
      ctx.moveTo(p.x + p.size, p.y)
      ctx.arc(p.x, p.y, p.size, 0, TAU)
    }
    ctx.fill()
    return
  }

  // звёзды: стоят на месте, мерцает только прозрачность
  ctx.fillStyle = '#ffffff'
  for (const p of ps) {
    ctx.globalAlpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * p.speed + p.phase))
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, TAU)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

export function SkyParticles({ kind, isDay }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const mode = getMode(kind, isDay)
  const heavy = kind === 'storm'

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || !mode) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let w = 0
    let h = 0
    let particles: Particle[] = []
    let raf = 0
    let last = 0
    let t = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2) // на ретине без лишней нагрузки
      const nw = canvas.clientWidth
      const nh = canvas.clientHeight
      canvas.width = Math.round(nw * dpr)
      canvas.height = Math.round(nh * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Частицы пересоздаём только при смене ширины: на телефоне высота «прыгает»
      // при скрытии адресной строки, и дождь не должен каждый раз начинаться заново
      const widthChanged = Math.abs(nw - w) > 1
      w = nw
      h = nh
      if (widthChanged || particles.length === 0) {
        particles = Array.from({ length: countFor(mode, w, h, heavy) }, () => spawn(mode, w, h, heavy))
      }
      if (reduced) draw(ctx, mode, particles, w, h, 0, 0) // один неподвижный кадр
    }

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const elapsed = now - last
      if (elapsed < FRAME_MS) return
      last = now
      const dt = Math.min(elapsed / 1000, 0.05) // после паузы не даём частицам «прыгнуть»
      t += dt
      draw(ctx, mode, particles, w, h, t, dt)
    }

    const start = () => {
      cancelAnimationFrame(raf)
      last = performance.now()
      raf = requestAnimationFrame(tick)
    }
    const onVisibility = () => (document.hidden ? cancelAnimationFrame(raf) : start())

    resize()
    window.addEventListener('resize', resize)

    if (!reduced) {
      document.addEventListener('visibilitychange', onVisibility)
      if (!document.hidden) start()
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [mode, heavy])

  if (!mode) return null
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />
}