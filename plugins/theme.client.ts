import { useThemeStore } from '~/stores/theme'

export default defineNuxtPlugin(() => {
  const themeStore = useThemeStore()

  // Initialize theme when app starts
  themeStore.initialize()
})
