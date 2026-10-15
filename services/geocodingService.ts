import type { Location, Address } from '~/types'
import { useGoogleMapsService } from '~/services/googleMapsService'

export interface GeocodingResult {
  location: Location
  address: Address
  formattedAddress: string
}

class GeocodingService {
  private apiKey: string = ''
  private geocoder: google.maps.Geocoder | null = null

  constructor() {
    // API key will be retrieved when needed
  }

  /**
   * Get API key from runtime config
   */
  private getApiKey(): string {
    if (!this.apiKey && process.client) {
      const config = useRuntimeConfig()
      this.apiKey = config.public.googleMapsApiKey as string || ''
    }
    return this.apiKey
  }

  /**
   * Initialize geocoder
   */
  private async initGeocoder(): Promise<void> {
    if (this.geocoder) return

    // Ensure Google Maps is loaded
    const mapsService = useGoogleMapsService()
    await mapsService.loadGoogleMaps()

    this.geocoder = new google.maps.Geocoder()
  }

  /**
   * Reverse geocode - convert location to address
   */
  async reverseGeocode(location: Location): Promise<GeocodingResult | null> {
    await this.initGeocoder()

    if (!this.geocoder) {
      throw new Error('Geocoder not initialized')
    }

    try {
      const response = await this.geocoder.geocode({
        location: { lat: location.lat, lng: location.lng }
      })

      if (response.results && response.results.length > 0) {
        const result = response.results[0]
        const address = this.parseAddressComponents(result.address_components)

        return {
          location,
          address,
          formattedAddress: result.formatted_address
        }
      }

      return null
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      return null
    }
  }

  /**
   * Forward geocode - convert address to location
   */
  async geocode(address: string): Promise<GeocodingResult | null> {
    await this.initGeocoder()

    if (!this.geocoder) {
      throw new Error('Geocoder not initialized')
    }

    try {
      const response = await this.geocoder.geocode({ address })

      if (response.results && response.results.length > 0) {
        const result = response.results[0]
        const location: Location = {
          lat: result.geometry.location.lat(),
          lng: result.geometry.location.lng()
        }
        const parsedAddress = this.parseAddressComponents(result.address_components)

        return {
          location,
          address: parsedAddress,
          formattedAddress: result.formatted_address
        }
      }

      return null
    } catch (error) {
      console.error('Geocoding error:', error)
      return null
    }
  }

  /**
   * Parse Google address components to our Address format
   */
  private parseAddressComponents(components: google.maps.GeocoderAddressComponent[]): Address {
    const address: Address = {
      province: '',
      district: '',
      subDistrict: ''
    }

    for (const component of components) {
      const types = component.types

      // Province (administrative_area_level_1)
      if (types.includes('administrative_area_level_1')) {
        address.province = component.long_name
      }

      // District (administrative_area_level_2 or locality)
      if (types.includes('administrative_area_level_2') || types.includes('locality')) {
        address.district = component.long_name
      }

      // Sub-district (sublocality_level_1 or administrative_area_level_3)
      if (types.includes('sublocality_level_1') || types.includes('administrative_area_level_3')) {
        address.subDistrict = component.long_name
      }

      // Street
      if (types.includes('route')) {
        address.street = component.long_name
      }

      // Postal code
      if (types.includes('postal_code')) {
        address.postalCode = component.long_name
      }
    }

    return address
  }

  /**
   * Get current location address
   */
  async getCurrentLocationAddress(): Promise<GeocodingResult | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null)
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }

          const result = await this.reverseGeocode(location)
          resolve(result)
        },
        (error) => {
          console.error('Geolocation error:', error)
          resolve(null)
        }
      )
    })
  }
}

// Export singleton
export const useGeocodingService = () => {
  return new GeocodingService()
}
