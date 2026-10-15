import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'
import { fetchForecast } from '@/lib/forecast'
import { getQueryClient } from '@/lib/queryClient'
import { Screen } from '@/components/Screen'
import { CurrentWeather } from '../currentWeather'
import { forecastQuery } from '@/lib/queries'
import { getWeather } from '@/lib/weather/codes'
import { formatTemp } from '@/lib/weather/format'
import { getSkyGradient } from '@/lib/weather/theme'
import { DailyForecast } from '../dailyForecast'
import { WeatherDetails } from '../weatherDetails'
import { HourlyForecast } from '../hourlyForecast'
import { FavoriteButton } from '@/components/FavoriteButton'
import { WeatherSummary } from '../weatherSummary'

type SearchParams = {
  lat?: string
  lon?: string
  name?: string
  region?: string
  country?: string
}
type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<SearchParams>
}

// В адресе координаты строки. Приводим к числу один раз,
// иначе ключ ['forecast', '52.23', ...] не совпадёт с ['forecast', 52.23, ...]
function parseCoords(sp: SearchParams) {
  if (!sp.lat || !sp.lon) return null
  const lat = Number(sp.lat)
  const lon = Number(sp.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null
  return { lat, lon }
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams
  const coords = parseCoords(sp)
  if (!coords) return { title: 'Город не найден' }

  const title = `Погода в ${sp.name ?? 'городе'}`
  try {
    const f = await fetchForecast(coords.lat, coords.lon)
    const { label } = getWeather(f.current.weather_code, f.current.is_day === 1)
    return { title, description: `Сейчас ${formatTemp(f.current.temperature_2m)}, ${label}` }
  } catch {
    return { title }
  }
}

export default async function CityPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams
  const coords = parseCoords(sp)
  if (!coords) notFound()
  const id = Number(slug)

  const queryClient = getQueryClient()
  // fetchQuery и кладёт данные в кэш для гидратации, и возвращает их для серверного кода
  const forecast = await queryClient.fetchQuery(forecastQuery(coords.lat, coords.lon))

  const gradient = getSkyGradient(forecast.current.weather_code, forecast.current.is_day === 1)

  return (
    <Screen gradient={gradient}>
      <div className="flex h-10 items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white">
          <ChevronLeft className="size-4" /> Поиск
        </Link>
        {Number.isFinite(id) && (
          <FavoriteButton
            city={{
              id,
              name: sp.name ?? 'Город',
              admin1: sp.region,
              country: sp.country,
              latitude: coords.lat,
              longitude: coords.lon,
            }}
          />
        )}
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <CurrentWeather
          lat={coords.lat}
          lon={coords.lon}
          name={sp.name ?? 'Город'}
          place={[sp.region, sp.country].filter(Boolean).join(', ')}
        />
        <div className="space-y-3">
          <WeatherSummary lat={coords.lat} lon={coords.lon} />
          <HourlyForecast lat={coords.lat} lon={coords.lon} />
          <DailyForecast lat={coords.lat} lon={coords.lon} />
          <WeatherDetails lat={coords.lat} lon={coords.lon} />
        </div>
      </HydrationBoundary>
    </Screen>
  )
}