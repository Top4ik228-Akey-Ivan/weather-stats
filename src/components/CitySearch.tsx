'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Command, CommandEmpty, CommandItem, CommandList } from '@/components/ui/command'
import { Command as CommandPrimitive } from 'cmdk'

import { weatherKeys } from '@/lib/keys'
import { cityHref, cityLabel } from '@/lib/city'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { fetchGeocode } from '@/lib/geocoding'
import { Search } from 'lucide-react'

export function CitySearch() {
  const router = useRouter()
  const [value, setValue] = useState('')
  const [open, setOpen] = useState(false)

  const query = value.trim()
  const debounced = useDebouncedValue(query, 300)

  const { data, isFetching, isError } = useQuery({
    queryKey: weatherKeys.geocode(debounced),
    queryFn: ({ signal }) => fetchGeocode(debounced, signal),
    enabled: debounced.length >= 2,
    placeholderData: keepPreviousData,
  })

  const showList = open && query.length >= 2
  const nothingFound = !isFetching && !isError && debounced === query && data?.length === 0

  return (
    <Command
      shouldFilter={false}
      className="relative h-auto overflow-visible rounded-2xl border border-white/20 bg-white/20 text-white"
    >
      <div className="flex h-12 items-center gap-2 px-4">
        <Search className="size-4 shrink-0 text-white/70" />
        <CommandPrimitive.Input
          value={value}
          onValueChange={(v) => { setValue(v); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          placeholder="Найти город…"
          className="h-full flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/60"
        />
      </div>

      {showList && (
        <CommandList
          onMouseDown={(e) => e.preventDefault()}
          className="absolute left-0 right-0 top-full z-20 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-white/20 bg-slate-900/70 p-1 text-white shadow-xl backdrop-blur-xl"
        >
          {isFetching && !data && <div className="p-3 text-sm text-white/70">Ищем…</div>}
          {isError && <div className="p-3 text-sm text-red-300">Не удалось загрузить, попробуйте ещё раз</div>}
          {nothingFound && <CommandEmpty className="py-4 text-center text-sm text-white/70">Ничего не найдено</CommandEmpty>}

          {data?.map((city) => (
            <CommandItem
              key={city.id}
              value={String(city.id)}
              onSelect={() => {
                setOpen(false)
                setValue('')
                router.push(cityHref(city))
              }}
              className="rounded-xl px-3 py-2.5 text-white data-[selected=true]:bg-white/15 data-[selected=true]:text-white"
            >
              {cityLabel(city)}
            </CommandItem>
          ))}
        </CommandList>
      )}
    </Command>
  )
}