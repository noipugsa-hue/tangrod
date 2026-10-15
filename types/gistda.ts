/**
 * GISTDA Flood STAC API Type Definitions
 *
 * GISTDA (Geo-Informatics and Space Technology Development Agency) provides
 * satellite flood mapping data via STAC (SpatioTemporal Asset Catalog) API.
 */

/**
 * GeoJSON Geometry types
 */
export interface GeoJSONGeometry {
  type: 'Polygon' | 'MultiPolygon' | 'Point' | 'LineString' | 'MultiLineString' | 'MultiPoint'
  coordinates: number[] | number[][] | number[][][] | number[][][][]
}

/**
 * STAC Asset metadata
 */
export interface STACAsset {
  href: string
  type?: string
  title?: string
  roles?: string[]
}

/**
 * STAC Link for pagination and relationships
 */
export interface STACLink {
  rel: string
  href: string
  type?: string
  title?: string
}

/**
 * Individual GISTDA flood feature (STAC Item)
 */
export interface GISTDAFloodFeature {
  type: 'Feature'
  id: string
  geometry: GeoJSONGeometry
  properties: {
    datetime?: string
    'eo:cloud_cover'?: number
    gsd?: number
    platform?: string
    instruments?: string[]
    [key: string]: unknown
  }
  assets?: Record<string, STACAsset>
  bbox?: [number, number, number, number] // [minLng, minLat, maxLng, maxLat]
}

/**
 * GISTDA Flood API Response (STAC Feature Collection)
 */
export interface GISTDAFloodResponse {
  type: 'FeatureCollection'
  features: GISTDAFloodFeature[]
  links?: STACLink[]
  timeStamp?: string
  numberMatched?: number
  numberReturned?: number
}

/**
 * Cached flood data with expiration
 */
export interface CachedFloodData {
  data: GISTDAFloodResponse
  timestamp: number
  expiresAt: number
}
