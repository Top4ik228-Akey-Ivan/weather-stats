'use client'

import dynamic from 'next/dynamic'
import { useQuery } from '@tanstack/react-query'
import { forecastQuery } from '@/lib/queries'
import { getWeather } from '@/lib/weather/codes'
import { getNextHours } from '@/lib/weather/hourly'
import { formatHour, formatTemp } from '@/lib/weather/format'
import { GlassCard } from '@/components/GlassCard'
import { Clock } from 'lucide-react'
import { useDragScroll } from '@/hooks/useDragScroll'
import type { Hour } from '@/lib/weather/hourly'

// Recharts работает только в браузере, поэтому грузим его отдельным куском и без серверного рендера.
// Пока он грузится, держим место такой же высоты, чтобы страница не прыгала.
const HourlyChart = dynamic(() => import('./hourlyChart').then((m) => m.HourlyChart), {
    ssr: false,
    loading: () => <div className="h-40 animate-pulse rounded-xl bg-white/10" />,
})

type Props = { lat: number; lon: number }

function HourlyStrip({ hours }: { hours: Hour[] }) {
    const ref = useDragScroll<HTMLUListElement>()

    return (
        <ul
            ref={ref}
            className="mt-3 flex cursor-grab select-none gap-4 overflow-x-auto border-t border-white/15 pt-3 active:cursor-grabbing scrollbar-none [&::-webkit-scrollbar]:hidden"
        >
            {hours.map((h, i) => {
                const { icon: Icon, label } = getWeather(h.code, h.isDay)
                return (
                    <li key={h.time} className="flex w-12 shrink-0 flex-col items-center gap-1.5 text-center">
                        <span className="text-xs text-white/70">{i === 0 ? 'Сейчас' : formatHour(h.time)}</span>
                        <Icon className="size-6" aria-label={label} />
                        <span className="h-3 text-[11px] leading-none text-sky-200">{h.rain >= 20 ? `${h.rain}%` : ''}</span>
                        <span className="text-base">{formatTemp(h.temp)}</span>
                    </li>
                )
            })}
        </ul>
    )
}

export function HourlyForecast({ lat, lon }: Props) {
    const { data } = useQuery(forecastQuery(lat, lon))
    if (!data) return null

    const hours = getNextHours(data, 24)

    return (
        <GlassCard title="Почасовой прогноз" icon={Clock}>
            <HourlyChart hours={hours} />
            <HourlyStrip hours={hours} />
        </GlassCard>
    )
}