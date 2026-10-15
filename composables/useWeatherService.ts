import { WeatherService } from '~/services/weatherService'

export const useWeatherService = () => {
  const config = useRuntimeConfig()
  return new WeatherService(config.public.weatherApiKey)
}
