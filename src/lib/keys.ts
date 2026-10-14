export const weatherKeys = {
  geocode: (q: string) => ['geocode', q] as const,
  forecast: (lat: number, lon: number, days: number) => ['forecast', lat, lon, days] as const,
}