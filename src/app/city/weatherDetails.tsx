'use client'

import { useQuery } from '@tanstack/react-query'
import {
  Droplets, Gauge, Sun, Sunrise, Thermometer, Umbrella, Wind,
  type LucideIcon,
} from 'lucide-react'
import { forecastQuery } from '@/lib/queries'
import {
  daylight, formatHour, formatTemp, formatWind, hpaToMmHg, uvLabel,
} from '@/lib/weather/format'
import { GlassCard } from '@/components/GlassCard'

type Props = { lat: number; lon: number }

function Tile({
  title,
  icon,
  value,
  hint,
}: {
  title: string
  icon: LucideIcon
  value: string
  hint?: string
}) {
  return (
    <GlassCard title={title} icon={icon}>
      <p className="text-3xl font-light">{value}</p>
      {hint && <p className="mt-1 text-sm text-white/70">{hint}</p>}
    </GlassCard>
  )
}

const toMs = (t: string) => new Date(`${t}Z`).getTime() // строки местного времени читаем одинаково везде

export function WeatherDetails({ lat, lon }: Props) {
  const { data } = useQuery(forecastQuery(lat, lon))
  if (!data) return null

  const c = data.current
  const d = data.daily
  const sunrise = d.sunrise[0]
  const sunset = d.sunset[0]
  const uv = Math.round(d.uv_index_max[0])

  // Где сейчас солнце между рассветом и закатом: от 0 (рассвет) до 1 (закат)
  const raw = (toMs(c.time) - toMs(sunrise)) / (toMs(sunset) - toMs(sunrise))
  const progress = Number.isFinite(raw) ? Math.min(Math.max(raw, 0), 1) : 0

  return (
    <div className="grid grid-cols-2 gap-3">
      <Tile title="Ощущается" icon={Thermometer} value={formatTemp(c.apparent_temperature)} />
      <Tile title="Влажность" icon={Droplets} value={`${c.relative_humidity_2m}%`} />
      <Tile title="Ветер" icon={Wind} value={formatWind(c.wind_speed_10m)} />
      <Tile
        title="Давление"
        icon={Gauge}
        value={String(Math.round(hpaToMmHg(c.pressure_msl)))}
        hint="мм рт. ст."
      />
      <Tile title="УФ-индекс" icon={Sun} value={String(uv)} hint={uvLabel(uv)} />
      <Tile
        title="Осадки"
        icon={Umbrella}
        value={`${d.precipitation_probability_max[0]}%`}
        hint="вероятность сегодня"
      />

      <GlassCard title="Рассвет и закат" icon={Sunrise} className="col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/60">Рассвет</p>
            <p className="text-2xl font-light">{formatHour(sunrise)}</p>
          </div>
          <p className="text-center text-sm text-white/70">
            Световой день
            <br />
            {daylight(sunrise, sunset)}
          </p>
          <div className="text-right">
            <p className="text-xs text-white/60">Закат</p>
            <p className="text-2xl font-light">{formatHour(sunset)}</p>
          </div>
        </div>

        <div aria-hidden className="relative mt-4 h-1.5 rounded-full bg-white/20">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-amber-300/80"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </GlassCard>
    </div>
  )
}