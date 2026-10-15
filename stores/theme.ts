import { defineStore } from 'pinia'
import type { Theme } from '~/types'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    currentTheme: 'light' as Theme,
    systemPreference: null as 'light' | 'dark' | null
  }),

  getters: {
    isDark: (state) => {
      if (state.currentTheme === 'system') {
        return state.systemPreference === 'dark'
      }
      return state.currentTheme === 'dark'
    },

    isLight: (state) => {
      if (state.currentTheme === 'system') {
        return state.systemPreference === 'light'
      }
      return state.currentTheme === 'light'
    },

    effectiveTheme: (state) => {
      if (state.currentTheme === 'system') {
        return state.systemPreference || 'light'
      }
      return state.currentTheme
    }
  },

  actions: {
    initialize() {
      if (!process.client) return

      console.log('[Theme] Initializing theme store...')

      // Load saved theme from localStorage
      const savedTheme = localStorage.getItem('theme') as Theme
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        this.currentTheme = savedTheme
        console.log('[Theme] Loaded saved theme:', savedTheme)
      } else {
        console.log('[Theme] No saved theme, using default: light')
      }

      // Detect system preference
      this.detectSystemPreference()

      // Listen for system preference changes
      this.watchSystemPreference()

      // Apply theme
      this.applyTheme()
      console.log('[Theme] Theme initialized:', this.effectiveTheme)
    },

    detectSystemPreference() {
      if (!process.client) return

      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
      this.systemPreference = prefersDark.matches ? 'dark' : 'light'
    },

    watchSystemPreference() {
      if (!process.client) return

      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
      prefersDark.addEventListener('change', (e) => {
        this.systemPreference = e.matches ? 'dark' : 'light'
        if (this.currentTheme === 'system') {
          this.applyTheme()
        }
      })
    },

    setTheme(theme: Theme) {
      console.log('[Theme] Setting theme to:', theme)
      this.currentTheme = theme

      // Save to localStorage
      if (process.client) {
        localStorage.setItem('theme', theme)
        console.log('[Theme] Saved to localStorage')
      }

      // Apply theme
      this.applyTheme()
    },

    toggleTheme() {
      const newTheme = this.currentTheme === 'system'
        ? (this.systemPreference === 'dark' ? 'light' : 'dark')
        : (this.currentTheme === 'dark' ? 'light' : 'dark')

      console.log('[Theme] Toggling theme from', this.currentTheme, 'to', newTheme)
      this.setTheme(newTheme)
    },

    applyTheme() {
      if (!process.client) return

      const htmlElement = document.documentElement
      const shouldBeDark = this.isDark

      console.log('[Theme] Applying theme, isDark:', shouldBeDark)
      console.log('[Theme] HTML classes before:', htmlElement.classList.toString())

      if (shouldBeDark) {
        htmlElement.classList.add('dark')
      } else {
        htmlElement.classList.remove('dark')
      }

      console.log('[Theme] HTML classes after:', htmlElement.classList.toString())

      // Update meta theme-color
      const metaThemeColor = document.querySelector('meta[name="theme-color"]')
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', shouldBeDark ? '#1E293B' : '#1E40AF')
        console.log('[Theme] Updated meta theme-color')
      }
    }
  }
})
