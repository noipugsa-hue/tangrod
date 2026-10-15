import { WeatherService } from '~/services/weatherService'

export const useWeatherService = () => {
  return new WeatherService()
}
