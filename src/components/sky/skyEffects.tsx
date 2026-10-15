import type { SkyKind } from '@/lib/weather/theme'
import { SkyParticles } from './skyParticles'

type Props = { kind: SkyKind; isDay: boolean }

type Cloud = { top: string; width: string; dur: number; delay: number }

// Детерминированный набор (без Math.random), чтобы сервер и браузер дали одинаковую разметку
const CLOUDS: Cloud[] = [
  { top: '4%', width: 'clamp(200px, 46vw, 560px)', dur: 140, delay: -30 },
  { top: '24%', width: 'clamp(240px, 58vw, 680px)', dur: 180, delay: -120 },
  { top: '44%', width: 'clamp(180px, 40vw, 480px)', dur: 160, delay: -70 },
  { top: '14%', width: 'clamp(160px, 34vw, 420px)', dur: 120, delay: -95 },
  { top: '58%', width: 'clamp(220px, 50vw, 600px)', dur: 200, delay: -160 },
]

// [цвет, прозрачность всей группы]; blur: чем больше, тем ближе к дымке
const CLOUD_STYLE: Partial<
  Record<SkyKind, { count: number; blur: number; day: [string, number]; night: [string, number] }>
> = {
  partly: { count: 2, blur: 10, day: ['#ffffff', 0.55], night: ['#c7d2ea', 0.18] },
  cloudy: { count: 5, blur: 10, day: ['#f1f5f9', 0.4], night: ['#94a3b8', 0.22] },
  fog: { count: 4, blur: 28, day: ['#ffffff', 0.3], night: ['#cbd5e1', 0.16] },
  rain: { count: 4, blur: 10, day: ['#1e293b', 0.5], night: ['#020617', 0.55] },
  storm: { count: 5, blur: 10, day: ['#0f172a', 0.6], night: ['#020617', 0.65] },
  snow: { count: 3, blur: 12, day: ['#f8fafc', 0.4], night: ['#cbd5e1', 0.2] },
}

function CloudShape({ color, blur }: { color: string; blur: number }) {
  const puff = 'absolute rounded-full'
  return (
    <div className="relative aspect-2/1 w-full" style={{ filter: `blur(${blur}px)` }}>
      <span className={puff} style={{ left: '4%', bottom: 0, width: '92%', height: '42%', background: color }} />
      <span className={puff} style={{ left: '10%', bottom: '18%', width: '30%', height: '52%', background: color }} />
      <span className={puff} style={{ left: '30%', bottom: '24%', width: '36%', height: '70%', background: color }} />
      <span className={puff} style={{ left: '56%', bottom: '18%', width: '32%', height: '56%', background: color }} />
    </div>
  )
}

function Clouds({ kind, isDay }: Props) {
  const cfg = CLOUD_STYLE[kind]
  if (!cfg) return null
  const [color, opacity] = isDay ? cfg.day : cfg.night

  return (
    <>
      {CLOUDS.slice(0, cfg.count).map((c, i) => (
        <div
          key={i}
          className="sky-cloud absolute left-0"
          style={{
            top: c.top,
            width: c.width,
            opacity,
            animationDuration: `${c.dur}s`,
            animationDelay: `${c.delay}s`,
          }}
        >
          <CloudShape color={color} blur={cfg.blur} />
        </div>
      ))}
    </>
  )
}

// Мягкое свечение в верхнем углу: солнце днём, луна ночью
function Glow({ kind, isDay }: Props) {
  if (kind !== 'clear' && kind !== 'partly') return null
  const background = isDay
    ? 'radial-gradient(circle at 82% 8%, rgba(255,244,200,0.55) 0%, rgba(255,244,200,0) 38%)'
    : 'radial-gradient(circle at 82% 10%, rgba(226,232,240,0.30) 0%, rgba(226,232,240,0) 22%)'
  return <div className="absolute inset-0" style={{ background }} />
}

function Lightning() {
  return (
    <>
      <div className="sky-flash absolute inset-0 bg-white" style={{ opacity: 0, animationDuration: '11s' }} />
      <div
        className="sky-flash absolute inset-0 bg-indigo-100"
        style={{ opacity: 0, animationDuration: '17s', animationDelay: '-6s' }}
      />
    </>
  )
}

export function SkyEffects({ kind, isDay }: Props) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <Glow kind={kind} isDay={isDay} />
      <Clouds kind={kind} isDay={isDay} />
      <SkyParticles kind={kind} isDay={isDay} />
      {kind === 'storm' && <Lightning />}
    </div>
  )
}