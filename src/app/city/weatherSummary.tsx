'use client'

import { useQuery } from '@tanstack/react-query'
import { MessageSquareText } from 'lucide-react'
import { forecastQuery } from '@/lib/queries'
import { buildSummary } from '@/lib/weather/summary'
import { GlassCard } from '@/components/GlassCard'

type Props = { lat: number; lon: number }

export function WeatherSummary({ lat, lon }: Props) {
  const { data } = useQuery(forecastQuery(lat, lon))
  if (!data) return null

  const summary = buildSummary(data)
  if (!summary) return null

  return (
    <GlassCard title="Сводка" icon={MessageSquareText}>
      <p className="text-lg leading-snug">{summary.headline}</p>
      {summary.lines.length > 0 && (
        <ul className="mt-2 space-y-1 text-sm text-white/80">
          {summary.lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
    </GlassCard>
  )
}