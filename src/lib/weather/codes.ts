import {
  Sun, Moon, CloudSun, CloudMoon, Cloud, CloudFog, CloudDrizzle,
  CloudRain, CloudRainWind, CloudSnow, Snowflake, CloudLightning,
  CloudHail, Thermometer, type LucideIcon,
} from 'lucide-react'

type WeatherInfo = {
  label: string
  icon: LucideIcon
  nightIcon?: LucideIcon
}

const WEATHER: Record<number, WeatherInfo> = {
  0: { label: 'Ясно', icon: Sun, nightIcon: Moon },
  1: { label: 'Преимущественно ясно', icon: CloudSun, nightIcon: CloudMoon },
  2: { label: 'Переменная облачность', icon: CloudSun, nightIcon: CloudMoon },
  3: { label: 'Пасмурно', icon: Cloud },

  45: { label: 'Туман', icon: CloudFog },
  48: { label: 'Изморозь', icon: CloudFog },

  51: { label: 'Слабая морось', icon: CloudDrizzle },
  53: { label: 'Морось', icon: CloudDrizzle },
  55: { label: 'Сильная морось', icon: CloudDrizzle },
  56: { label: 'Слабая ледяная морось', icon: CloudDrizzle },
  57: { label: 'Ледяная морось', icon: CloudDrizzle },

  61: { label: 'Слабый дождь', icon: CloudRain },
  63: { label: 'Дождь', icon: CloudRain },
  65: { label: 'Сильный дождь', icon: CloudRainWind },
  66: { label: 'Слабый ледяной дождь', icon: CloudRain },
  67: { label: 'Ледяной дождь', icon: CloudRainWind },

  71: { label: 'Слабый снег', icon: CloudSnow },
  73: { label: 'Снег', icon: CloudSnow },
  75: { label: 'Сильный снег', icon: Snowflake },
  77: { label: 'Снежные зёрна', icon: Snowflake },

  80: { label: 'Слабый ливень', icon: CloudRain },
  81: { label: 'Ливень', icon: CloudRainWind },
  82: { label: 'Сильный ливень', icon: CloudRainWind },

  85: { label: 'Слабый снегопад', icon: CloudSnow },
  86: { label: 'Сильный снегопад', icon: Snowflake },

  95: { label: 'Гроза', icon: CloudLightning },
  96: { label: 'Гроза с градом', icon: CloudHail },
  99: { label: 'Сильная гроза с градом', icon: CloudHail },
}

const UNKNOWN: WeatherInfo = { label: 'Нет данных', icon: Thermometer }

export function getWeather(code: number, isDay = true) {
  const info = WEATHER[code] ?? UNKNOWN
  return {
    label: info.label,
    icon: !isDay && info.nightIcon ? info.nightIcon : info.icon,
  }
}