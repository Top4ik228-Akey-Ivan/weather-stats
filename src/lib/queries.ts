import { queryOptions } from '@tanstack/react-query'

import { weatherKeys } from '@/lib/keys'
import { fetchForecast } from './forecast'

export const FORECAST_DAYS = 7

export const forecastQuery = (lat: number, lon: number, days = FORECAST_DAYS) =>
  queryOptions({
    queryKey: weatherKeys.forecast(lat, lon, days),
    queryFn: ({ signal }) => fetchForecast(lat, lon, days, signal),
  })