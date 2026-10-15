/**
 * GISTDA Flood Data API Endpoint
 *
 * This server-only endpoint fetches flood data from GISTDA STAC API
 * with caching to reduce API calls and improve performance.
 *
 * Security: GISTDA API token is kept server-side and never exposed to client.
 */

import type { GISTDAFloodResponse, CachedFloodData } from '~/types/gistda'

// In-memory cache (consider using Nitro storage for persistence)
const floodCache = new Map<string, CachedFloodData>()
const CACHE_TTL = 60 * 60 * 1000 // 1 hour in milliseconds

/**
 * GET /api/flood/gistda
 *
 * Fetches flood data from GISTDA or returns cached data if available.
 *
 * Returns:
 * - X-Cache: HIT (from cache), MISS (fresh fetch), or STALE (fallback cache)
 * - Cache-Control: public, max-age=3600 (browser can cache for 1 hour)
 */
export default defineEventHandler(async (event): Promise<GISTDAFloodResponse> => {
  const config = useRuntimeConfig(event)
  const token = config.gistdaApiToken

  // Validate token configuration
  if (!token) {
    throw createError({
      statusCode: 500,
      statusMessage: 'GISTDA API token not configured',
      message: 'Server configuration error: GISTDA_API_TOKEN environment variable is not set'
    })
  }

  // Check cache first
  const cacheKey = 'flood_data'
  const cached = floodCache.get(cacheKey)

  if (cached && Date.now() < cached.expiresAt) {
    // Cache hit - return cached data
    setResponseHeader(event, 'X-Cache', 'HIT')
    setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')
    return cached.data
  }

  // Fetch from GISTDA API
  try {
    console.log('[GISTDA] Fetching flood data from GISTDA API...')
    console.log('[GISTDA] Using token:', token.substring(0, 10) + '...' + token.substring(token.length - 5))

    const response = await $fetch<GISTDAFloodResponse>(
      'https://api-gateway.gistda.or.th/api/2.0/resources/stac/flood/collections/flood1day_r2/items/items_flood1day_r2',
      {
        headers: {
          'api_key': token,
          'Accept': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      }
    )

    console.log(`[GISTDA] Successfully fetched ${response.features?.length || 0} flood features`)

    // Update cache
    floodCache.set(cacheKey, {
      data: response,
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_TTL
    })

    // Set response headers
    setResponseHeader(event, 'X-Cache', 'MISS')
    setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')

    return response
  } catch (error: unknown) {
    console.error('[GISTDA] Failed to fetch from GISTDA API:', error)

    // Fallback to stale cache if available
    if (cached) {
      console.warn('[GISTDA] Using stale cache as fallback')
      setResponseHeader(event, 'X-Cache', 'STALE')
      setResponseHeader(event, 'Cache-Control', 'public, max-age=300') // 5 minutes for stale data
      return cached.data
    }

    // No cache available - throw error
    throw createError({
      statusCode: 502,
      statusMessage: 'Bad Gateway',
      message: 'Failed to fetch flood data from GISTDA and no cached data available'
    })
  }
})
