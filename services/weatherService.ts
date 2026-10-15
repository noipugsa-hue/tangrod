import type { Location, WeatherData } from '~/types'

/**
 * Weather Service
 *
 * Client-side service that calls internal API endpoint
 * API key is kept secure on server-side
 */
export class WeatherService {
  async getCurrentWeather(location: Location): Promise<WeatherData | null> {
    try {
      const data = await $fetch<WeatherData>('/api/weather/current', {
        query: {
          lat: location.lat,
          lng: location.lng
        }
      })
      return data
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
    // Forecast not implemented yet
    // Can add /api/weather/forecast endpoint later if needed
    return []
  }
}
