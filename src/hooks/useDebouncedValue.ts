import { useEffect, useState } from 'react'

export function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id) // новая буква сбрасывает таймер
  }, [value, delay])

  return debounced
}