<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- Header -->
    <div class="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 pb-8">
      <div class="max-w-screen-xl mx-auto">
        <h1 class="text-2xl font-bold mb-2">เรดาร์สภาพอากาศ</h1>
        <p class="text-blue-100 text-sm">ติดตามสภาพอากาศและฝนแบบเรียลไทม์</p>
      </div>
    </div>

    <!-- Current Weather Card -->
    <div class="max-w-screen-xl mx-auto px-4 -mt-4">
      <div v-if="currentWeather" class="bg-white rounded-xl shadow-lg p-6 mb-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-600 mb-1">
              {{ currentAddress?.province || 'กำลังระบุตำแหน่ง...' }}
            </div>
            <div class="text-4xl font-bold text-gray-900 mb-1">
              {{ currentWeather.temperature }}°C
            </div>
            <div class="text-gray-600">{{ currentWeather.description }}</div>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-600 mb-2">
              อัปเดตล่าสุด: {{ formatTime(currentWeather.updatedAt) }}
            </div>
            <button
              @click="refreshWeather"
              :disabled="loadingWeather"
              class="flex items-center gap-1 text-blue-600 text-sm hover:text-blue-700 disabled:opacity-50"
            >
              <ArrowPathIcon
                class="w-4 h-4"
                :class="{ 'animate-spin': loadingWeather }"
              />
              รีเฟรช
            </button>
          </div>
        </div>

        <!-- Weather Details Grid -->
        <div class="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div class="text-center">
            <div class="text-2xl mb-1">💧</div>
            <div class="text-sm text-gray-600">ความชื้น</div>
            <div class="font-semibold text-gray-900">{{ currentWeather.humidity }}%</div>
          </div>
          <div class="text-center">
            <div class="text-2xl mb-1">🌧️</div>
            <div class="text-sm text-gray-600">ปริมาณฝน</div>
            <div class="font-semibold text-gray-900">{{ currentWeather.rainfall }} มม.</div>
          </div>
          <div class="text-center">
            <div class="text-2xl mb-1">💨</div>
            <div class="text-sm text-gray-600">ความเร็วลม</div>
            <div class="font-semibold text-gray-900">{{ currentWeather.windSpeed.toFixed(1) }} ม./วิ</div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else class="bg-white rounded-xl shadow-lg p-6 mb-4">
        <div class="animate-pulse">
          <div class="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div class="h-12 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div class="h-6 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>

      <!-- Weather Radar Map -->
      <div class="bg-white rounded-xl shadow-lg overflow-hidden mb-4">
        <div class="p-4 bg-gray-50 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">เรดาร์ตรวจจับฝน</h2>
              <p class="text-sm text-gray-600">แสดงฝนในรัศมี 500 กม.</p>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="toggleRadarAnimation"
                class="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                :title="isRadarPlaying ? 'หยุดแอนิเมชั่น' : 'เล่นแอนิเมชั่น'"
              >
                <component :is="isRadarPlaying ? PauseIcon : PlayIcon" class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <ClientOnly>
          <WeatherRadarMap
            :center="mapCenter"
            :is-playing="isRadarPlaying"
            @update:is-playing="isRadarPlaying = $event"
          />
          <template #fallback>
            <div class="h-96 bg-gray-100 flex items-center justify-center">
              <div class="text-gray-500">กำลังโหลดแผนที่...</div>
            </div>
          </template>
        </ClientOnly>

        <!-- Radar Legend -->
        <div class="p-4 bg-gray-50 border-t border-gray-200">
          <div class="text-sm font-medium text-gray-700 mb-2">ระดับความหนาแน่นของฝน</div>
          <div class="flex items-center gap-4 text-xs">
            <div class="flex items-center gap-1">
              <div class="w-4 h-4 rounded" style="background-color: rgba(0, 255, 0, 0.5)"></div>
              <span class="text-gray-600">เบา</span>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-4 h-4 rounded" style="background-color: rgba(255, 255, 0, 0.6)"></div>
              <span class="text-gray-600">ปานกลาง</span>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-4 h-4 rounded" style="background-color: rgba(255, 165, 0, 0.7)"></div>
              <span class="text-gray-600">หนัก</span>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-4 h-4 rounded" style="background-color: rgba(255, 0, 0, 0.8)"></div>
              <span class="text-gray-600">หนักมาก</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 5-Day Forecast -->
      <div class="bg-white rounded-xl shadow-lg p-4">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">พยากรณ์อากาศ 5 วัน</h2>

        <div v-if="forecast.length > 0" class="space-y-3">
          <div
            v-for="(day, index) in forecast"
            :key="index"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center gap-3">
              <div class="text-2xl">{{ getWeatherEmoji(day.description) }}</div>
              <div>
                <div class="font-medium text-gray-900">
                  {{ formatDate(day.updatedAt, index) }}
                </div>
                <div class="text-sm text-gray-600">{{ day.description }}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-xl font-bold text-gray-900">{{ day.temperature }}°C</div>
              <div class="text-xs text-gray-600">ฝน {{ day.rainfall }} มม.</div>
            </div>
          </div>
        </div>

        <div v-else-if="loadingForecast" class="space-y-3">
          <div v-for="i in 5" :key="i" class="animate-pulse">
            <div class="h-16 bg-gray-100 rounded-lg"></div>
          </div>
        </div>

        <div v-else class="text-center py-8 text-gray-500">
          <CloudIcon class="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>ไม่สามารถโหลดพยากรณ์อากาศได้</p>
          <p class="text-sm mt-1">กรุณาตั้งค่า Weather API Key</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowPathIcon, PlayIcon, PauseIcon, CloudIcon } from '@heroicons/vue/24/outline'
import type { WeatherData, Location } from '~/types'

// Composables
const locationStore = useLocationStore()
const weatherService = useWeatherService()

// State
const currentWeather = ref<WeatherData | null>(null)
const forecast = ref<WeatherData[]>([])
const loadingWeather = ref(false)
const loadingForecast = ref(false)
const isRadarPlaying = ref(true)

// Computed
const currentAddress = computed(() => locationStore.currentAddress)
const currentLocation = computed(() => locationStore.currentLocation)

const mapCenter = computed((): Location => {
  if (currentLocation.value) {
    return currentLocation.value
  }
  // Default to Bangkok
  return { lat: 13.7563, lng: 100.5018 }
})

// Methods
const refreshWeather = async () => {
  if (!currentLocation.value) {
    await locationStore.getCurrentLocation()
  }

  if (currentLocation.value) {
    loadingWeather.value = true
    try {
      currentWeather.value = await weatherService.getCurrentWeather(currentLocation.value)
    } finally {
      loadingWeather.value = false
    }
  }
}

const loadForecast = async () => {
  if (!currentLocation.value) return

  loadingForecast.value = true
  try {
    forecast.value = await weatherService.get5DayForecast(currentLocation.value)
  } finally {
    loadingForecast.value = false
  }
}

const toggleRadarAnimation = () => {
  isRadarPlaying.value = !isRadarPlaying.value
}

const formatTime = (date: Date) => {
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60)

  if (diff < 1) return 'เมื่อสักครู่'
  if (diff < 60) return `${diff} นาทีที่แล้ว`

  const hours = Math.floor(diff / 60)
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`

  const time = date.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit'
  })
  return time
}

const formatDate = (date: Date, index: number) => {
  if (index === 0) return 'วันนี้'
  if (index === 1) return 'พรุ่งนี้'

  return date.toLocaleDateString('th-TH', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })
}

const getWeatherEmoji = (description: string): string => {
  const desc = description.toLowerCase()

  if (desc.includes('ฝน') || desc.includes('rain')) return '🌧️'
  if (desc.includes('พายุ') || desc.includes('storm') || desc.includes('thunder')) return '⛈️'
  if (desc.includes('เมฆ') || desc.includes('cloud')) return '☁️'
  if (desc.includes('หมอก') || desc.includes('fog') || desc.includes('mist')) return '🌫️'
  if (desc.includes('แดด') || desc.includes('clear') || desc.includes('sunny')) return '☀️'

  return '🌤️'
}

// Lifecycle
onMounted(async () => {
  // Get location first
  if (!currentLocation.value) {
    await locationStore.getCurrentLocation()
  }

  // Load weather data
  await Promise.all([
    refreshWeather(),
    loadForecast()
  ])
})
</script>
