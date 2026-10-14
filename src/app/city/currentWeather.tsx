'use client'

import { useQuery } from '@tanstack/react-query'
import { forecastQuery } from '@/lib/queries'
import { getWeather } from '@/lib/weather/codes'
import { formatTemp } from '@/lib/weather/format'

type Props = {
  lat: number
  lon: number
  name: string
  place: string
}

export function CurrentWeather({ lat, lon, name, place }: Props) {
  const { data } = useQuery(forecastQuery(lat, lon))
  if (!data) return null

  const c = data.current
  const { label, icon: Icon } = getWeather(c.weather_code, c.is_day === 1)

  return (
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
  )
}