<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-bottom z-50 transition-colors">
    <div class="flex items-center justify-around h-16 max-w-screen-xl mx-auto">
      <NuxtLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center justify-center flex-1 h-full transition-colors"
        :class="isActive(item.path) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
      >
        <component
          :is="item.icon"
          class="w-6 h-6"
          :class="isActive(item.path) ? 'stroke-2' : 'stroke-1.5'"
        />
        <span class="text-xs mt-1 font-medium">{{ item.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { HomeIcon, MapIcon, ArrowPathIcon, ExclamationTriangleIcon, CloudIcon, BeakerIcon } from '@heroicons/vue/24/outline'

const route = useRoute()

const navItems = [
  {
    path: '/',
    label: 'หน้าหลัก',
    icon: HomeIcon
  },
  {
    path: '/map',
    label: 'แผนที่',
    icon: MapIcon
  },
  {
    path: '/water-levels',
    label: 'ระดับน้ำ',
    icon: BeakerIcon
  },
  {
    path: '/radar',
    label: 'เรดาร์',
    icon: CloudIcon
  },
  {
    path: '/emergency',
    label: 'ฉุกเฉิน',
    icon: ExclamationTriangleIcon
  }
]

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
