export interface Location {
  lat: number
  lng: number
}

export interface Address {
  province: string
  district: string
  subDistrict: string
  postalCode?: string
  fullAddress?: string
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface RiskAssessment {
  level: RiskLevel
  score: number
  reasons: string[]
  floodDistance?: number
  waterLevel?: number
}

export type FloodSeverity = 'NONE' | 'MINOR' | 'MODERATE' | 'SEVERE' | 'CRITICAL'

export type FloodDataSource = 'gistda' | 'user-report' | 'firebase'

export interface FloodArea {
  id: string
  location: Location
  severity: FloodSeverity
  waterLevel: number
  radius: number
  reportedAt: Date
  updatedAt: Date
  verified: boolean
  geometry?: import('./gistda').GeoJSONGeometry // Optional GeoJSON polygon for GISTDA data
  source?: FloodDataSource // Data source identifier
}

export interface FloodDataMetadata {
  lastUpdated: Date
  source: string
  itemCount: number
  coverage: string
}

export interface FloodReport {
  id: string
  userId: string
  location: Location
  address: Address
  severity: FloodSeverity
  waterLevel: number
  description: string
  images: string[]
  roadPassable: boolean
  verified: boolean
  likes: number
  createdAt: Date
  updatedAt: Date
}

export type EmergencyPlaceType = 'HOSPITAL' | 'POLICE' | 'FIRE_STATION' | 'SHELTER' | 'GAS_STATION'

export interface EmergencyPlace {
  id: string
  name: string
  type: EmergencyPlaceType
  location: Location
  address: Address
  phone?: string
  openingHours?: string
  capacity?: number
  distance?: number
}

export type VehicleType = 'CAR' | 'PICKUP' | 'SUV' | 'VAN'

export interface RoutePoint {
  location: Location
  address: string
  type: 'origin' | 'destination' | 'waypoint'
}

export interface RouteSegment {
  start: Location
  end: Location
  distance: number
  duration: number
  floodRisk: RiskLevel
  warnings: string[]
}

export interface Route {
  id: string
  origin: RoutePoint
  destination: RoutePoint
  segments: RouteSegment[]
  totalDistance: number
  totalDuration: number
  riskAssessment: RiskAssessment
  floodAreas: FloodArea[]
  avoidFloodZones: boolean
  vehicleType: VehicleType
  createdAt: Date
}

export type NotificationSeverity = 'INFO' | 'WARNING' | 'DANGER' | 'SUCCESS'

export interface Notification {
  id: string
  title: string
  message: string
  severity: NotificationSeverity
  location?: Location
  read: boolean
  createdAt: Date
}

export interface User {
  id: string
  email: string
  name?: string
  photoURL?: string
  role: 'USER' | 'ADMIN'
  savedLocations: SavedLocation[]
  createdAt: Date
}

export interface SavedLocation {
  id: string
  name: string
  location: Location
  address: Address
  type: 'HOME' | 'WORK' | 'OTHER'
}

export interface WeatherData {
  temperature: number
  humidity: number
  rainfall: number
  windSpeed: number
  description: string
  updatedAt: Date
}

// Water Station Types
export type WaterLevel = 'CRITICAL' | 'HIGH_RISK' | 'WATCH' | 'NORMAL'
export type WaterTrend = 'RISING' | 'FALLING' | 'STABLE'

export interface WaterStation {
  id: string
  name: string
  location: Location
  address: Address
  currentLevel: number // in meters
  criticalLevel: number // threshold for critical warning
  highRiskLevel: number // threshold for high risk warning
  watchLevel: number // threshold for watch warning
  normalLevel: number // normal water level
  waterLevel: WaterLevel
  trend: WaterTrend
  updatedAt: Date
  province: string
  district: string
  active: boolean
}

// Rainfall Data Types
export interface RainfallData {
  id: string
  timestamp: Date
  amount: number // in millimeters
  location: Location
  stationName?: string
}

export interface RainfallHistory {
  hourly: RainfallData[] // last 24 hours
  lastUpdated: Date
}

// Official Links Types
export type OfficialLinkCategory = 'WATER' | 'WEATHER' | 'DISASTER' | 'IRRIGATION' | 'EMERGENCY'

export interface OfficialLink {
  id: string
  name: string
  nameEn: string
  description: string
  url: string
  category: OfficialLinkCategory
  icon?: string
  order: number
}

// Theme Types
export type Theme = 'light' | 'dark' | 'system'

export interface ThemePreference {
  theme: Theme
  systemPreference?: 'light' | 'dark'
}
