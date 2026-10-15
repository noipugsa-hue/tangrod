import type { Location, WeatherData } from '~/types'

export class WeatherService {
  private apiKey: string
  private baseUrl = 'https://api.openweathermap.org/data/2.5'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async getCurrentWeather(location: Location): Promise<WeatherData | null> {
    if (!this.apiKey) {
      // Using mock weather data (API key not configured)
      return this.getMockWeather()
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/weather?lat=${location.lat}&lon=${location.lng}&appid=${this.apiKey}&units=metric&lang=th`
      )

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`)
      }

      const data = await response.json()

      return {
        temperature: Math.round(data.main.temp),
        humidity: data.main.humidity,
        rainfall: data.rain?.['1h'] || data.rain?.['3h'] || 0,
        windSpeed: data.wind.speed,
        description: data.weather[0]?.description || 'ไม่ทราบ',
        updatedAt: new Date()
      }
    } catch (error) {
      console.error('Error fetching weather:', error)
      return this.getMockWeather()
    }
  }

  private getMockWeather(): WeatherData {
    return {
      temperature: 28 + Math.floor(Math.random() * 5),
      humidity: 60 + Math.floor(Math.random() * 20),
      rainfall: Math.random() > 0.7 ? Math.floor(Math.random() * 10) : 0,
      windSpeed: 5 + Math.random() * 5,
      description: 'มีเมฆบางส่วน',
      updatedAt: new Date()
    }
  }

  async get5DayForecast(location: Location): Promise<WeatherData[]> {
    if (!this.apiKey) {
      // API key not configured, return empty forecast
      return []
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/forecast?lat=${location.lat}&lon=${location.lng}&appid=${this.apiKey}&units=metric&lang=th`
      )

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`)
      }

      const data = await response.json()

      // Get one forecast per day
      const dailyForecasts: WeatherData[] = []
      const seenDates = new Set<string>()

      for (const item of data.list) {
        const date = new Date(item.dt * 1000).toDateString()

        if (!seenDates.has(date) && dailyForecasts.length < 5) {
          seenDates.add(date)
          dailyForecasts.push({
            temperature: Math.round(item.main.temp),
            humidity: item.main.humidity,
            rainfall: item.rain?.['3h'] || 0,
            windSpeed: item.wind.speed,
            description: item.weather[0]?.description || 'ไม่ทราบ',
            updatedAt: new Date(item.dt * 1000)
          })
        }
      }

      return dailyForecasts
    } catch (error) {
      console.error('Error fetching forecast:', error)
      return []
    }
  }
}
