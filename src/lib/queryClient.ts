import { cache } from 'react'
import { QueryClient } from '@tanstack/react-query'

// cache() даёт один клиент на один серверный запрос, а не общий для всех пользователей
export const getQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: { queries: { staleTime: 5 * 60 * 1000 } },
    }),
)