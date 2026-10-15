import { defineStore } from 'pinia'
import type { WaterStation } from '~/types'

export const useWaterStationStore = defineStore('waterStation', {
  state: () => ({
    stations: [] as WaterStation[],
    loading: false,
    error: null as string | null,
    lastUpdated: null as Date | null,
    selectedProvince: null as string | null
  }),

  getters: {
    // Get stations by water level
    criticalStations: (state) => state.stations.filter(s => s.waterLevel === 'CRITICAL'),
    highRiskStations: (state) => state.stations.filter(s => s.waterLevel === 'HIGH_RISK'),
    watchStations: (state) => state.stations.filter(s => s.waterLevel === 'WATCH'),
    normalStations: (state) => state.stations.filter(s => s.waterLevel === 'NORMAL'),

    // Get counts by level
    criticalCount: (state) => state.stations.filter(s => s.waterLevel === 'CRITICAL').length,
    highRiskCount: (state) => state.stations.filter(s => s.waterLevel === 'HIGH_RISK').length,
    watchCount: (state) => state.stations.filter(s => s.waterLevel === 'WATCH').length,
    normalCount: (state) => state.stations.filter(s => s.waterLevel === 'NORMAL').length,

    // Get stations by selected province
    filteredStations: (state) => {
      if (!state.selectedProvince) return state.stations
      return state.stations.filter(s => s.province === state.selectedProvince)
    },

    // Get unique provinces
    provinces: (state) => {
      const provinces = state.stations.map(s => s.province)
      return [...new Set(provinces)].sort()
    },

    // Check if data is stale (older than 10 minutes)
    isDataStale: (state) => {
      if (!state.lastUpdated) return true
      const tenMinutes = 10 * 60 * 1000
      return Date.now() - state.lastUpdated.getTime() > tenMinutes
    }
  },

  actions: {
    async fetchStations(forceRefresh = false) {
      // Skip if data is fresh and not forcing refresh
      if (!forceRefresh && this.stations.length > 0 && !this.isDataStale) {
        return
      }

      this.loading = true
      this.error = null

      try {
        const waterStationService = useWaterStationService()
        const stations = await waterStationService.getAllStations()

        this.stations = stations
        this.lastUpdated = new Date()
      } catch (err) {
        this.error = 'ไม่สามารถโหลดข้อมูลสถานีวัดน้ำได้'
        console.error('Error fetching water stations:', err)
      } finally {
        this.loading = false
      }
    },

    async fetchStationsByProvince(province: string) {
      this.loading = true
      this.error = null
      this.selectedProvince = province

      try {
        const waterStationService = useWaterStationService()
        const stations = await waterStationService.getStationsByProvince(province)

        this.stations = stations
        this.lastUpdated = new Date()
      } catch (err) {
        this.error = 'ไม่สามารถโหลดข้อมูลสถานีวัดน้ำได้'
        console.error('Error fetching water stations by province:', err)
      } finally {
        this.loading = false
      }
    },

    async fetchStationsByLevel(waterLevel: 'CRITICAL' | 'HIGH_RISK' | 'WATCH' | 'NORMAL') {
      this.loading = true
      this.error = null

      try {
        const waterStationService = useWaterStationService()
        const stations = await waterStationService.getStationsByLevel(waterLevel)

        this.stations = stations
        this.lastUpdated = new Date()
      } catch (err) {
        this.error = 'ไม่สามารถโหลดข้อมูลสถานีวัดน้ำได้'
        console.error('Error fetching water stations by level:', err)
      } finally {
        this.loading = false
      }
    },

    clearFilter() {
      this.selectedProvince = null
    },

    // Auto-refresh every 10 minutes
    startAutoRefresh() {
      if (!process.client) return

      const interval = setInterval(() => {
        this.fetchStations(true)
      }, 10 * 60 * 1000) // 10 minutes

      // Store interval ID for cleanup
      return interval
    }
  }
})
