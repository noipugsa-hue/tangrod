/**
 * Weather API Endpoint
 *
 * Server-only endpoint for fetching current weather from OpenWeatherMap
 * Keeps API key secure on server-side
 */

import type { WeatherData } from '~/types'

export default defineEventHandler(async (event): Promise<WeatherData> => {
  const config = useRuntimeConfig(event)
  const apiKey = config.weatherApiKey

  // Get query parameters
  const query = getQuery(event)
  const lat = query.lat as string
  const lng = query.lng as string

  // Validate parameters
  if (!lat || !lng) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Missing required parameters: lat and lng'
    })
  }

  // Validate API key
  if (!apiKey) {
    console.warn('[Weather] API key not configured, returning mock data')
    return getMockWeather()
  }

  // Fetch from OpenWeatherMap API
  try {
    const response = await $fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric&lang=th`,
      {
        timeout: 5000,
        retry: 0
      }
    )

    const data = response as any

    return {
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      rainfall: data.rain?.['1h'] || data.rain?.['3h'] || 0,
      windSpeed: data.wind.speed,
      description: data.weather[0]?.description || 'ไม่ทราบ',
      updatedAt: new Date()
    }
  } catch (error) {
    console.error('[Weather] Failed to fetch from OpenWeatherMap:', error)
    return getMockWeather()
  }
})

function getMockWeather(): WeatherData {
  return {
    temperature: 28 + Math.floor(Math.random() * 5),
    humidity: 60 + Math.floor(Math.random() * 20),
    rainfall: Math.random() > 0.7 ? Math.floor(Math.random() * 10) : 0,
    windSpeed: 5 + Math.random() * 5,
    description: 'มีเมฆบางส่วน',
    updatedAt: new Date()
  }
}
