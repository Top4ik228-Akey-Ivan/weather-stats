'use client'

import Link from 'next/link'
import { useQueries, type UseQueryResult } from '@tanstack/react-query'
import { Heart, X } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useFavorites } from '@/hooks/useFavorites'
import { cityHref, type CityRef } from '@/lib/city'
import { forecastQuery } from '@/lib/queries'
import { getWeather } from '@/lib/weather/codes'
import { formatTemp } from '@/lib/weather/format'
import { getSkyGradient } from '@/lib/weather/theme'
import { GlassCard } from './GlassCard'
import { Forecast } from '@/lib/forecast'

// Подсказки для пустого состояния. id взяты из GeoNames по памяти:
// здесь они нужны только для адреса и как ключ избранного.
const POPULAR: CityRef[] = [
    { id: 524901, name: 'Москва', admin1: 'Москва', country: 'Россия', latitude: 55.7558, longitude: 37.6173 },
    { id: 2643743, name: 'Лондон', admin1: 'Англия', country: 'Великобритания', latitude: 51.5074, longitude: -0.1278 },
    { id: 5128581, name: 'Нью-Йорк', admin1: 'Нью-Йорк', country: 'США', latitude: 40.7128, longitude: -74.006 },
    { id: 1850147, name: 'Токио', admin1: 'Токио', country: 'Япония', latitude: 35.6762, longitude: 139.6503 },
    { id: 292223, name: 'Дубай', admin1: 'Дубай', country: 'ОАЭ', latitude: 25.2048, longitude: 55.2708 },
]

function EmptyState() {
    return (
        <GlassCard title="Избранное" icon={Heart} className="mt-8">
            <p className="text-sm text-white/80">
                Пока здесь пусто. Найдите город и нажмите на сердечко или начните с популярных:
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
                {POPULAR.map((city) => (
                    <li key={city.id}>
                        <Link
                            href={cityHref(city)}
                            className="inline-flex h-9 items-center rounded-full border border-white/20 bg-white/15 px-4 text-sm hover:bg-white/25"
                        >
                            {city.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </GlassCard>
    )
}

function FavoriteCard({
    city,
    query,
    onRemove,
}: {
    city: CityRef
    query: UseQueryResult<Forecast>
    onRemove: () => void
}) {
    const current = query.data?.current
    const weather = current ? getWeather(current.weather_code, current.is_day === 1) : null
    const gradient = current
        ? getSkyGradient(current.weather_code, current.is_day === 1)
        : 'rgba(255, 255, 255, 0.15)'

    return (
        <li className="relative">
            <Link
                href={cityHref(city)}
                className="flex min-h-32 flex-col justify-between rounded-3xl p-4 shadow-lg ring-1 ring-white/20"
                style={{ background: gradient }}
            >
                <div className="pr-6">
                    <p className="truncate text-lg font-medium">{city.name}</p>
                    <p className="truncate text-xs text-white/70">
                        {[city.admin1, city.country].filter(Boolean).join(', ')}
                    </p>
                </div>

                {current && weather ? (
                    <div className="mt-3 flex items-end justify-between">
                        <p className="text-4xl font-light leading-none">{formatTemp(current.temperature_2m)}</p>
                        <div className="text-right text-xs text-white/80">
                            <weather.icon className="ml-auto size-5" />
                            <p className="mt-1">
                                {formatTemp(query.data!.daily.temperature_2m_max[0])} / {formatTemp(query.data!.daily.temperature_2m_min[0])}
                            </p>
                        </div>
                    </div>
                ) : query.isError ? (
                    <p className="mt-3 text-sm text-white/80">Не удалось загрузить</p>
                ) : (
                    <div className="mt-3 flex items-end justify-between">
                        <Skeleton className="h-9 w-16 bg-white/20" />
                        <Skeleton className="h-8 w-12 bg-white/20" />
                    </div>
                )}
            </Link>

            {/* Кнопка лежит рядом со ссылкой, а не внутри: вложенные интерактивные элементы недопустимы в HTML */}
            <button
                type="button"
                onClick={onRemove}
                aria-label={`Убрать ${city.name} из избранного`}
                className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/20 text-white/80 hover:bg-black/40"
            >
                <X className="size-4" />
            </button>
        </li>
    )
}

export function FavoritesGrid() {
    const { favorites, ready, remove } = useFavorites()

    // Один запрос на каждый город, параллельно. Ключи те же, что на странице города:
    // если город уже открывали, данные берутся из кэша без запроса.
    const results = useQueries({
        queries: favorites.map((c) => forecastQuery(c.latitude, c.longitude)),
    })

    if (!ready) return null // чтобы «пока пусто» не мелькало до чтения localStorage
    if (favorites.length === 0) return <EmptyState />

    return (
        <section className="mt-8">
            <h2 className="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-white/60">
                <Heart className="size-3.5" /> Избранное
            </h2>
            <ul className="grid grid-cols-2 gap-3">
                {favorites.map((city, i) => (
                    <FavoriteCard key={city.id} city={city} query={results[i]} onRemove={() => remove(city.id)} />
                ))}
            </ul>
        </section>
    )
}