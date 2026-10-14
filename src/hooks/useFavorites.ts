'use client'

import { useCallback, useSyncExternalStore } from 'react'
import type { CityRef } from '@/lib/city'
import { EMPTY, readFavorites, removeFavorite, subscribe, toggleFavorite } from '@/lib/favorites'

const noopSubscribe = () => () => {}

export function useFavorites() {
  // Сервер и первый рендер в браузере используют EMPTY, поэтому HTML совпадает и ошибки гидратации нет.
  // После гидратации React сам перерисует компонент с реальными данными.
  const favorites = useSyncExternalStore(subscribe, readFavorites, () => EMPTY)

  // ready: false на сервере и при гидратации, true после. Нужен, чтобы не мигала надпись «пока пусто».
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false)

  const isFavorite = useCallback((id: number) => favorites.some((c) => c.id === id), [favorites])

  return {
    favorites,
    ready,
    isFavorite,
    toggle: (city: CityRef) => toggleFavorite(city),
    remove: (id: number) => removeFavorite(id),
  }
}