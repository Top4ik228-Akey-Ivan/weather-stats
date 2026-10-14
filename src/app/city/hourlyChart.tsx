'use client'

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Hour } from '@/lib/weather/hourly'
import { formatHour, formatTemp } from '@/lib/weather/format'

const TICK = { fill: 'rgba(255,255,255,0.6)', fontSize: 11 }

export function HourlyChart({ hours }: { hours: Hour[] }) {
  return (
    // у родителя ResponsiveContainer должна быть явная высота, иначе график не появится
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={hours} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="time"
            tickFormatter={(t: string) => formatHour(t)}
            interval={3} // подпись под каждой четвёртой точкой
            tick={TICK}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            width={36}
            domain={[(min: number) => Math.floor(min - 2), (max: number) => Math.ceil(max + 2)]}
            tickFormatter={(v: number) => formatTemp(v)}
            tick={TICK}
            tickLine={false}
            axisLine={false}
          />

          <Tooltip
            cursor={{ stroke: 'rgba(255,255,255,0.3)' }}
            contentStyle={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 12,
              color: '#fff',
              fontSize: 12,
            }}
            labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
            itemStyle={{ color: '#fff' }}
            labelFormatter={(label) => formatHour(String(label))}
            formatter={(value) => [formatTemp(Number(value)), 'Температура']}
          />

          <Area
            type="monotone"
            dataKey="temp"
            stroke="#ffffff"
            strokeWidth={2}
            fill="url(#tempFill)"
            dot={false}
            activeDot={{ r: 4, fill: '#ffffff' }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}