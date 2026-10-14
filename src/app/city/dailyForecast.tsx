'use client'

import { useQuery } from '@tanstack/react-query'
import { CalendarDays } from 'lucide-react'
import { forecastQuery } from '@/lib/queries'
import { getWeather } from '@/lib/weather/codes'
import { formatTemp, formatWeekday } from '@/lib/weather/format'
import { GlassCard } from '@/components/GlassCard'

type Props = { lat: number; lon: number }

export function DailyForecast({ lat, lon }: Props) {
  const { data } = useQuery(forecastQuery(lat, lon))
  if (!data) return null

  const d = data.daily

  // API отдаёт колонками (time: [...], temperature_2m_max: [...]),
  // для рендера удобнее массив строк
  const days = d.time.map((date, i) => ({
    date,
    code: d.weather_code[i],
    min: d.temperature_2m_min[i],
    max: d.temperature_2m_max[i],
    rain: d.precipitation_probability_max[i],
  }))

  // Полоса каждого дня рисуется относительно диапазона всей недели
  const weekMin = Math.min(...days.map((x) => x.min))
  const weekMax = Math.max(...days.map((x) => x.max))
  const span = Math.max(weekMax - weekMin, 1) // защита от деления на ноль

  return (
    <GlassCard title="Прогноз по дням" icon={CalendarDays}>
      <ul className="divide-y divide-white/15">
        {days.map((day, i) => {
          const { icon: Icon, label } = getWeather(day.code)
          const left = ((day.min - weekMin) / span) * 100
          const width = Math.min(Math.max(((day.max - day.min) / span) * 100, 6), 100 - left)

          return (
            <li key={day.date} className="flex items-center gap-3 py-2.5">
              <span className="w-16 capitalize">{i === 0 ? 'Сегодня' : formatWeekday(day.date)}</span>

              <span className="flex h-9 w-10 flex-col items-center justify-center">
                <Icon className="size-5" aria-label={label} />
                {day.rain >= 20 && <span className="text-[11px] leading-none text-sky-200">{day.rain}%</span>}
              </span>

              <span className="w-9 text-right text-white/70">{formatTemp(day.min)}</span>

              <div aria-hidden className="relative h-1.5 flex-1 rounded-full bg-white/20">
                <div
                  className="absolute inset-y-0 rounded-full"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    background: 'linear-gradient(90deg, #7dd3fc, #fcd34d)',
                  }}
                />
              </div>

              <span className="w-9">{formatTemp(day.max)}</span>
            </li>
          )
        })}
      </ul>
    </GlassCard>
  )
}