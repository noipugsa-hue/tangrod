/**
 * Google Maps API Key Endpoint
 *
 * Server-only endpoint that provides Google Maps API key to client
 * Keeps the key out of the bundle while still allowing client-side usage
 */

export default defineEventHandler((event): { apiKey: string } => {
  const config = useRuntimeConfig(event)
  const apiKey = config.googleMapsApiKey

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Google Maps API key is not configured'
    })
  }

  return {
    apiKey
  }
})
