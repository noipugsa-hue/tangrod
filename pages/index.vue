<template>
  <div class="fixed inset-0 overflow-hidden">
    <!-- Background Image with Overlay -->
    <div class="absolute inset-0">
      <!-- Background Image - Amphawa Floating Market, Samut Songkhram -->
      <div
        class="absolute inset-0 bg-cover"
        style="background-image: url('/images/amphawa-sunset.jpg'); background-position: center 40%;"
      ></div>

      <!-- Gradient Overlay - Lighter and more subtle -->
      <div class="absolute inset-0 bg-gradient-to-b from-blue-600/40 via-blue-700/45 to-blue-900/80"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 flex flex-col h-full">
      <!-- Status Bar Space -->
      <div class="h-12"></div>

      <!-- Logo Section -->
      <div class="flex-1 flex flex-col items-center justify-center px-6 pb-32">
        <!-- Logo Icon -->
        <div class="mb-6 relative">
          <!-- Glow Effect -->
          <div class="absolute inset-0 bg-yellow-400/30 rounded-full blur-2xl"></div>

          <!-- Logo -->
          <div class="relative">
            <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- White Border Circle -->
              <circle cx="90" cy="90" r="75" fill="white" stroke="white" stroke-width="8"/>

              <!-- Dark Blue Background Circle -->
              <circle cx="90" cy="75" r="50" fill="#1E3A8A"/>

              <!-- Light Blue Waves at Bottom -->
              <path d="M40 100 Q55 95, 70 100 T100 100 Q115 95, 130 100 T160 100 L160 145 Q145 140, 130 145 T100 145 Q85 140, 70 145 T40 145 Z"
                    fill="#60A5FA" stroke="white" stroke-width="4"/>
              <path d="M35 110 Q50 105, 65 110 T95 110 Q110 105, 125 110 T155 110 L155 150 Q140 145, 125 150 T95 150 Q80 145, 65 150 T35 150 Z"
                    fill="#3B82F6" stroke="white" stroke-width="3"/>

              <!-- Location Pin -->
              <g transform="translate(90, 55)">
                <!-- Pin Shadow -->
                <ellipse cx="0" cy="38" rx="14" ry="5" fill="#000000" opacity="0.2"/>

                <!-- Pin Body with White Border -->
                <path d="M0,-25 C-13,-25 -24,-14 -24,0 C-24,14 0,35 0,35 C0,35 24,14 24,0 C24,-14 13,-25 0,-25 Z"
                      fill="white"/>
                <path d="M0,-22 C-11.5,-22 -21,-12.5 -21,0 C-21,12.5 0,32 0,32 C0,32 21,12.5 21,0 C21,-12.5 11.5,-22 0,-22 Z"
                      fill="#F59E0B"/>

                <!-- Pin Center Circle -->
                <circle cx="0" cy="0" r="9" fill="white"/>
                <circle cx="0" cy="0" r="6" fill="#FCD34D"/>
              </g>
            </svg>
          </div>
        </div>

        <!-- Title -->
        <h1 class="text-7xl font-black mb-2 tracking-tight logo-text" style="font-family: 'Noto Sans Thai', sans-serif;">
          ทางรอด
        </h1>
        <p class="text-xl font-bold mb-6 tracking-wider logo-subtext" style="font-family: 'Noto Sans Thai', sans-serif;">
          TANGROD
        </p>

        <!-- Tagline -->
        <p class="text-center text-base font-bold leading-relaxed px-8 max-w-sm tagline-text" style="font-family: 'Noto Sans Thai', sans-serif;">
          รู้ก่อนลุย เลี่ยงจุดเสี่ยง<br />
          ถึงที่หมายปลอดภัย
        </p>
      </div>

      <!-- Bottom Card -->
      <div class="px-6 pb-8">
        <button
          @click="navigateToMain"
          class="w-full bg-white rounded-2xl shadow-2xl p-5 flex items-center justify-between hover:shadow-3xl transition-all active:scale-[0.98] group"
        >
          <div class="flex items-center flex-1">
            <!-- Location Icon -->
            <div class="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-blue-700 transition-colors">
              <MapPinIcon class="w-7 h-7 text-white" />
            </div>

            <!-- Text -->
            <div class="text-left flex-1">
              <div class="text-sm text-gray-600 font-medium mb-0.5">เริ่มต้นจาก</div>
              <div class="text-base font-semibold text-gray-900">
                {{ displayLocation }}
              </div>
            </div>
          </div>

          <!-- Arrow Icon -->
          <ChevronRightIcon class="w-6 h-6 text-gray-400 flex-shrink-0 group-hover:text-gray-600 transition-colors" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MapPinIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { useLocationStore } from '~/stores/location'

const router = useRouter()
const locationStore = useLocationStore()

// Display location text
const displayLocation = computed(() => {
  const addr = locationStore.currentAddress

  // If we have real GPS location with different province
  if (addr && addr.province && addr.province !== 'สมุทรสงคราม') {
    return addr.district ? `${addr.district}, ${addr.province}` : addr.province
  }

  // Default to Samut Songkhram
  return 'สมุทรสงคราม'
})

const navigateToMain = async () => {
  // Navigate to map page (location detection happens there)
  router.push('/map')
}

onMounted(() => {
  // Don't auto-detect location on splash screen
  // Let user click the button to navigate and detect location later
})

definePageMeta({
  layout: false
})
</script>

<style scoped>
/* Import Thai font with all weights */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700;800;900&display=swap');

/* Smooth transitions */
* {
  -webkit-tap-highlight-color: transparent;
}

/* Logo Text with Strong Contrast */
.logo-text {
  color: #1a1a2e;
  text-shadow:
    2px 2px 4px rgba(255, 255, 255, 0.8),
    -1px -1px 2px rgba(255, 255, 255, 0.5),
    0 4px 8px rgba(0, 0, 0, 0.3);
  -webkit-text-stroke: 0.5px rgba(255, 255, 255, 0.3);
}

.logo-subtext {
  color: #FFFFFF;
  text-shadow:
    2px 2px 4px rgba(0, 0, 0, 0.8),
    0 3px 8px rgba(0, 0, 0, 0.6),
    0 0 20px rgba(0, 0, 0, 0.4);
  -webkit-text-stroke: 0.5px rgba(0, 0, 0, 0.3);
}

.tagline-text {
  color: #FFFFFF;
  text-shadow:
    1px 1px 3px rgba(0, 0, 0, 0.8),
    0 2px 6px rgba(0, 0, 0, 0.6),
    0 0 15px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.02em;
}
</style>
