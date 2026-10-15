<template>
  <div class="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-700 to-blue-600 dark:from-gray-800 dark:to-gray-900 shadow-lg transition-colors">
    <!-- Status Bar Space (for iOS notch) -->
    <div class="h-safe-top"></div>

    <!-- Header Content -->
    <div class="flex items-center justify-between px-4 py-3">
      <!-- Menu Button -->
      <button
        @click="$emit('menu-click')"
        class="p-2 -ml-2 text-white hover:bg-white/10 rounded-lg transition-colors"
      >
        <Bars3Icon class="w-6 h-6" />
      </button>

      <!-- Logo -->
      <div class="flex-1 flex flex-col items-center">
        <div class="text-white font-black text-xl tracking-wide" style="font-family: 'Noto Sans Thai', sans-serif;">
          ทางรอด
        </div>
        <div class="text-white/80 text-xs font-medium tracking-wider">
          TANGROD
        </div>
      </div>

      <!-- Right Actions -->
      <div class="flex items-center gap-1 -mr-2">
        <!-- Theme Toggle -->
        <button
          @click="toggleTheme"
          class="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          :title="isDark ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'"
        >
          <SunIcon v-if="isDark" class="w-5 h-5" />
          <MoonIcon v-else class="w-5 h-5" />
        </button>

        <!-- Notification Button -->
        <button
          @click="$emit('notification-click')"
          class="p-2 text-white hover:bg-white/10 rounded-lg transition-colors relative"
        >
          <BellIcon class="w-6 h-6" />
          <!-- Notification Badge -->
          <span
            v-if="notificationCount > 0"
            class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-blue-700"
          ></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bars3Icon, BellIcon, SunIcon, MoonIcon } from '@heroicons/vue/24/outline'
import { useThemeStore } from '~/stores/theme'

defineProps<{
  notificationCount?: number
}>()

defineEmits<{
  'menu-click': []
  'notification-click': []
}>()

const themeStore = useThemeStore()

const isDark = computed(() => themeStore.isDark)

const toggleTheme = () => {
  themeStore.toggleTheme()
}
</script>

<style scoped>
/* Safe area for iOS notch */
.h-safe-top {
  height: env(safe-area-inset-top, 0);
}
</style>
