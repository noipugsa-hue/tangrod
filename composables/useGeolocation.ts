import type { Location } from '~/types'

export const useGeolocation = () => {
  const location = ref<Location | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const permissionDenied = ref(false)

  const getCurrentPosition = async (): Promise<Location | null> => {
    if (!process.client) return null

    loading.value = true
    error.value = null
    permissionDenied.value = false

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        })
      })

      const loc: Location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }

      location.value = loc
      return loc
    } catch (err: any) {
      if (err.code === 1) {
        permissionDenied.value = true
        error.value = 'กรุณาอนุญาตการเข้าถึงตำแหน่งของคุณ'
      } else if (err.code === 2) {
        error.value = 'ไม่สามารถระบุตำแหน่งได้'
      } else {
        error.value = 'เกิดข้อผิดพลาด'
      }
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    location,
    loading,
    error,
    permissionDenied,
    getCurrentPosition
  }
}
