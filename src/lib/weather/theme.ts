type SkyKind = 'clear' | 'partly' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'storm'

const GRADIENTS: Record<SkyKind, { day: [string, string]; night: [string, string] }> = {
  clear:  { day: ['#1e6fd9', '#63b3f0'], night: ['#0a1030', '#1c2f6b'] },
  partly: { day: ['#3b7fd0', '#86b8e6'], night: ['#101a3d', '#2c3f72'] },
  cloudy: { day: ['#56677a', '#97a6b6'], night: ['#1d2733', '#3a4756'] },
  fog:    { day: ['#6b7a89', '#a9b5c0'], night: ['#222c36', '#47535f'] },
  rain:   { day: ['#2f4558', '#5f7a90'], night: ['#121a24', '#2b3b4b'] },
  snow:   { day: ['#587497', '#a2b8d1'], night: ['#1b283a', '#46597a'] },
  storm:  { day: ['#2a2748', '#5a4d7e'], night: ['#14122a', '#352c52'] },
}

function getSkyKind(code: number): SkyKind {
  if (code === 0) return 'clear'
  if (code <= 2) return 'partly'
  if (code === 3) return 'cloudy'
  if (code === 45 || code === 48) return 'fog'
  if (code >= 95) return 'storm'
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow'
  if (code >= 51) return 'rain' // морось, дождь, ливни
  return 'cloudy'
}

export function getSkyGradient(code: number, isDay = true) {
  const [from, to] = GRADIENTS[getSkyKind(code)][isDay ? 'day' : 'night']
  return `linear-gradient(180deg, ${from} 0%, ${to} 100%)`
}

export const DEFAULT_GRADIENT = getSkyGradient(0, true)