// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false, // Disable SSR for client-side only app

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vite-pwa/nuxt'
  ],

  app: {
    head: {
      title: 'ทางรอด - TANGROD',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'รู้ก่อนมุ่ง เลี่ยงจุดเสี่ยง ถึงที่หมายปลอดภัย - ตรวจสอบสถานการณ์น้ำท่วม ประเมินความเสี่ยง และวางแผนเส้นทางปลอดภัย' },
        { name: 'theme-color', content: '#1E40AF' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  css: [],

  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.js'
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'ทางรอด - TANGROD',
      short_name: 'TANGROD',
      description: 'รู้ก่อนมุ่ง เลี่ยงจุดเสี่ยง ถึงที่หมายปลอดภัย',
      theme_color: '#1E40AF',
      background_color: '#ffffff',
      icons: [
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      navigateFallback: null
    },
    disable: process.env.NODE_ENV === 'development',
    devOptions: {
      enabled: false
    }
  },

  runtimeConfig: {
    // Private keys (server-only, never exposed to client)
    gistdaApiToken: process.env.GISTDA_API_TOKEN || '',
    weatherApiKey: process.env.NUXT_WEATHER_API_KEY || '',
    googleMapsApiKey: process.env.NUXT_GOOGLE_MAPS_API_KEY || '',

    // Public keys (exposed to client)
    public: {
      firebaseApiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY || '',
      firebaseAuthDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
      firebaseProjectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID || '',
      firebaseStorageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
      firebaseMessagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
      firebaseAppId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID || '',
      firebaseMeasurementId: process.env.NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ''
    }
  },

  // Security headers for Google Maps Platform
  nitro: {
    routeRules: {
      '/**': {
        headers: {
          'Content-Security-Policy': [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://maps.gstatic.com https://www.googletagmanager.com https://apis.google.com https://accounts.google.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
            "img-src 'self' data: blob: https: https://maps.googleapis.com https://maps.gstatic.com *.googleapis.com *.ggpht.com https://www.googletagmanager.com",
            "font-src 'self' data: https://fonts.gstatic.com",
            "connect-src 'self' https://maps.googleapis.com https://*.googleapis.com https://www.google-analytics.com https://www.googletagmanager.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.firebaseio.com https://api.openweathermap.org https://api-gateway.gistda.or.th https://nominatim.openstreetmap.org",
            "frame-src 'self' https://accounts.google.com https://*.firebaseapp.com",
            "worker-src 'self' blob:"
          ].join('; ')
        }
      }
    }
  }
})
