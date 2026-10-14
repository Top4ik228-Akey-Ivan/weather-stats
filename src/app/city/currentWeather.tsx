'use client'

import { useQuery } from '@tanstack/react-query'
import { Droplets, Gauge, Thermometer, Wind } from 'lucide-react'
import { GlassCard } from '@/components/GlassCard'
import { forecastQuery } from '@/lib/queries'
import { getWeather } from '@/lib/weather/codes'
import { formatPressure, formatTemp, formatWind } from '@/lib/weather/format'


type Props = {
  lat: number
  lon: number
  name: string
  place: string
}

export function CurrentWeather({ lat, lon, name, place }: Props) {
  const { data } = useQuery(forecastQuery(lat, lon))

  // после гидратации данные уже есть; состояния загрузки и ошибки добавим на дне 6
  if (!data) return null

  const c = data.current
  const { label, icon: Icon } = getWeather(c.weather_code, c.is_day === 1)

  return (
    <>
      <div className="py-8 text-center">
        <h1 className="text-3xl font-medium">{name}</h1>
        <p className="text-sm text-white/70">{place}</p>
        <p className="mt-3 text-8xl font-extralight leading-none">{formatTemp(c.temperature_2m)}</p>
        <p className="mt-3 flex items-center justify-center gap-2 text-lg">
          <Icon className="size-5" /> {label}
        </p>
        <p className="mt-1 text-white/80">
          Макс. {formatTemp(data.daily.temperature_2m_max[0])}, мин. {formatTemp(data.daily.temperature_2m_min[0])}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <GlassCard title="Ощущается" icon={Thermometer}>
          <p className="text-3xl font-light">{formatTemp(c.apparent_temperature)}</p>
        </GlassCard>
        <GlassCard title="Влажность" icon={Droplets}>
          <p className="text-3xl font-light">{c.relative_humidity_2m}%</p>
        </GlassCard>
        <GlassCard title="Ветер" icon={Wind}>
          <p className="text-3xl font-light">{formatWind(c.wind_speed_10m)}</p>
        </GlassCard>
        <GlassCard title="Давление" icon={Gauge}>
          <p className="text-2xl font-light">{formatPressure(c.pressure_msl)}</p>
        </GlassCard>
      </div>
    </>
  )
}