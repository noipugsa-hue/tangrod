import { defineStore } from 'pinia'
import type { Location, Address } from '~/types'

export const useLocationStore = defineStore('location', {
  state: () => ({
    currentLocation: null as Location | null,
    currentAddress: null as Address | null,
    loading: false,
    error: null as string | null,
    permissionDenied: false
  }),

  actions: {
    async getCurrentLocation(): Promise<Location | null> {
      if (!process.client) return null

      this.loading = true
      this.error = null
      this.permissionDenied = false

      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          })
        })

        const location: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }

        this.currentLocation = location
        await this.reverseGeocode(location)

        return location
      } catch (err: any) {
        if (err.code === 1) {
          this.permissionDenied = true
          this.error = 'กรุณาอนุญาตการเข้าถึงตำแหน่งของคุณ'
        } else if (err.code === 2) {
          this.error = 'ไม่สามารถระบุตำแหน่งได้ กรุณาลองใหม่อีกครั้ง'
        } else {
          this.error = 'เกิดข้อผิดพลาดในการระบุตำแหน่ง'
        }
        return null
      } finally {
        this.loading = false
      }
    },

    async reverseGeocode(location: Location): Promise<Address | null> {
      try {
        // Using Nominatim (OpenStreetMap) for reverse geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&accept-language=th`
        )

        if (!response.ok) throw new Error('Failed to reverse geocode')

        const data = await response.json()

        const address: Address = {
          province: data.address.province || data.address.state || '',
          district: data.address.city || data.address.town || data.address.municipality || '',
          subDistrict: data.address.suburb || data.address.neighbourhood || '',
          postalCode: data.address.postcode,
          fullAddress: data.display_name
        }

        this.currentAddress = address
        return address
      } catch (err) {
        console.error('Reverse geocode error:', err)
        return null
      }
    },

    setLocation(location: Location) {
      this.currentLocation = location
    },

    setAddress(address: Address) {
      this.currentAddress = address
    },

    clearLocation() {
      this.currentLocation = null
      this.currentAddress = null
      this.error = null
      this.permissionDenied = false
    }
  }
})
