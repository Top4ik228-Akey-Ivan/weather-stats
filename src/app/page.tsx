
import { fetchAir } from '@/lib/air'
import { fetchForecast } from '@/lib/forecast'
import { fetchGeocode } from '@/lib/geocoding'
import { getWeather } from '@/lib/weather/codes'
import { daylight, formatPressure, formatTemp, formatWind } from '@/lib/weather/format'


export default async function Home() {

  const cities = await fetchGeocode('Warszawa')
  const { latitude, longitude } = cities[0]

  const forecast = await fetchForecast(latitude, longitude)
  const air = await fetchAir(latitude, longitude)

  const { label, icon: Icon } = getWeather(forecast.current.weather_code, forecast.current.is_day === 1)

  console.log(cities)
  console.log(forecast)
  console.log(air)

  return (
    <main className="p-6">
      <p>Город: {cities[0].name}, {cities[0].admin1}, {cities[0].country}</p>
      <p>Сейчас: {forecast.current.temperature_2m}°C</p>
      <p>Код погоды: {forecast.current.weather_code}</p>
      <p>Дней в прогнозе: {forecast.daily.time.length}</p>
      <p>AQI: {air.current.european_aqi}</p>

      <Icon className="size-10" />
      <p>{label}, {formatTemp(forecast.current.temperature_2m)}</p>
      <p>Ветер {formatWind(forecast.current.wind_speed_10m)}, {formatPressure(forecast.current.pressure_msl)}</p>
      <p>Световой день {daylight(forecast.daily.sunrise[0], forecast.daily.sunset[0])}</p>
    </main>
  )
}