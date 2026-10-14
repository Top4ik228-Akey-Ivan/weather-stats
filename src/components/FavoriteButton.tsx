'use client'

import { Heart } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import type { CityRef } from '@/lib/city'
import { cn } from '@/lib/utils'

export function FavoriteButton({ city }: { city: CityRef }) {
  const { ready, isFavorite, toggle } = useFavorites()
  const active = ready && isFavorite(city.id)

  return (
    <button
      type="button" 
      disabled={!ready}
      onClick={() => toggle(city)}
      aria-pressed={active}
      aria-label={active ? 'Убрать из избранного' : 'Добавить в избранное'}
      className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/15 backdrop-blur-md transition hover:bg-white/25 disabled:opacity-50 cursor-pointer"
    >
      <Heart className={cn('size-5', active && 'fill-rose-400 text-rose-400')} />
    </button>
  )
}