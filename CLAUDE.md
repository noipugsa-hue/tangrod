# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TANGROD (ทางรอด) is a flood monitoring and route planning Progressive Web App built with Nuxt 4, Vue 3, and Firebase. The app helps users check flood conditions, assess risk levels, plan safe routes, and report flood incidents in Thailand.

## Development Commands

```bash
# Development
pnpm install              # Install dependencies
pnpm dev                  # Start dev server (http://localhost:3000)

# Build
pnpm build                # Build for production
pnpm preview              # Preview production build
pnpm generate             # Generate static site

# Database
pnpm seed                 # Seed Firestore with sample data (runs scripts/seedFirestore.ts)
```

## Architecture

### App Configuration

The app is configured as a **client-side only application** (`ssr: false` in nuxt.config.ts):
- No server-side rendering (SSR) - all pages render in the browser
- Geolocation, maps, and Firebase all require client-side execution
- Always check `process.client` before using browser APIs
- Routes are pre-rendered at build time with `pnpm generate`

### State Management (Pinia Stores)

The app uses three main Pinia stores located in `stores/`:

1. **Location Store** (`stores/location.ts`)
   - Manages user's current location using Geolocation API
   - Performs reverse geocoding via Nominatim (OpenStreetMap) API
   - Converts lat/lng to Thai addresses (province, district, subDistrict)
   - State: `currentLocation`, `currentAddress`, `loading`, `error`, `permissionDenied`

2. **Risk Store** (`stores/risk.ts`)
   - Calculates flood risk assessment based on proximity to flood areas
   - Uses Haversine formula to calculate distances between locations
   - Risk algorithm: Score 0-100, levels LOW/MEDIUM/HIGH/CRITICAL
   - Risk decreases based on distance and severity of nearby floods
   - State: `currentRisk`, `floodAreas`, `loading`

3. **Auth Store** (`stores/auth.ts`)
   - Handles Firebase Authentication (Email/Password and Google Sign-in)
   - Manages user session and profile data

### Firebase Integration

Firebase is initialized in `plugins/firebase.client.ts` and provides:
- **Authentication**: Email/Password + Google Sign-in
- **Firestore**: Real-time database for reports, flood areas, emergency places
- **Storage**: Image uploads for flood reports
- **Analytics**: User behavior tracking

The `FirebaseService` class (`services/firebaseService.ts`) wraps Firestore operations:
- CRUD for flood reports (`floodReports` collection)
- CRUD for flood areas (`floodAreas` collection)
- CRUD for emergency places (`emergencyPlaces` collection)
- Real-time updates via Firestore snapshots

Access via composable: `const firebaseService = useFirebaseService()`

### Database Schema

See `FIRESTORE_SCHEMA.md` for complete Firestore collections structure.

Key collections:
- `floodReports`: User-submitted flood reports with location, severity, water level, images
- `floodAreas`: Verified flood zones with radius and severity
- `emergencyPlaces`: Hospitals, shelters, police stations, etc.
- `users`: Extended user profiles beyond Firebase Auth
- `notifications`: System-wide alerts and warnings

Security Rules allow:
- Anyone can READ all flood data
- Anyone can CREATE flood reports (including guests)
- Only report owners or admins can UPDATE/DELETE reports
- Only admins can manage floodAreas and emergencyPlaces

### Map Integration

The app uses **dual mapping libraries**:

1. **Leaflet + OpenStreetMap** (display and visualization)
   - Map component: `components/map/LeafletMap.vue`
   - Displays flood areas with color-coded severity (blue → yellow → orange → red)
   - Shows user location marker
   - Leaflet CSS is imported globally in `nuxt.config.ts`

2. **Google Maps API** (routing and geocoding)
   - Service: `services/googleMapsService.ts` - Dynamic library loader
   - Service: `services/routesService.ts` - Route calculation with flood detection
   - Service: `services/geocodingService.ts` - Address lookup
   - Service: `services/placesService.ts` - Place search
   - API key configured in `.env` and accessed via `useRuntimeConfig().public.googleMapsApiKey`
   - Dynamically loaded via Google Maps Loader to reduce initial bundle size
   - Content Security Policy configured in `nuxt.config.ts` to allow Google Maps resources

### TypeScript Types

All types are centralized in `types/index.ts`:
- Core types: `Location`, `Address`, `FloodSeverity`, `RiskLevel`
- Domain models: `FloodReport`, `FloodArea`, `EmergencyPlace`, `Route`
- User types: `User`, `SavedLocation`
- Supporting types: `Notification`, `WeatherData`, `VehicleType`

Always import types from `~/types` and use them for type safety.

### Environment Configuration

Firebase and API keys are configured via `nuxt.config.ts` runtimeConfig:
- Keys are loaded from `.env` file (see `.env.example`)
- Access via `useRuntimeConfig().public.*`
- Firebase project: `inbound-analogy-409510`
- Region: `asia-southeast1` (Singapore)

### PWA Configuration

PWA is configured in `nuxt.config.ts` using `@vite-pwa/nuxt`:
- Auto-updates via service worker
- Offline support
- Install to home screen
- PWA is DISABLED in dev mode to reduce warnings
- Icons should be placed in `public/` as `pwa-192x192.png` and `pwa-512x512.png`

### Routing & Pages

Nuxt 4 auto-routing from `pages/` directory:
- `/` - Home page with current location risk assessment
- `/map` - Interactive flood map
- `/route` - Route planning with flood avoidance
- `/report` - Feed of user-submitted flood reports
- `/report/create` - Submit new flood report
- `/emergency` - Emergency contacts and shelters
- `/profile` - User profile and settings
- `/admin` - Admin dashboard (role-based access)

Bottom navigation component: `components/layout/BottomNavigation.vue`

### Composables Layer

Composables provide reusable logic and are auto-imported by Nuxt:

1. **useGeolocation** (`composables/useGeolocation.ts`)
   - Wrapper for browser Geolocation API
   - Returns reactive location, loading, error states
   - Handles permission denied errors with Thai error messages

2. **useRouteCalculation** (`composables/useRouteCalculation.ts`)
   - Calculates routes using Google Maps Directions API
   - Assesses flood risk for each route by checking polyline against flood areas
   - Sorts routes by safety (risk level) then duration
   - Provides formatting utilities for distance/duration display

3. **useFirebaseService** (`composables/` - implied)
   - Access to FirebaseService singleton
   - Used throughout the app for Firestore operations

### Service Layer

Services are organized in `services/` and follow a class-based pattern:

**Google Maps Services:**
- `googleMapsService.ts` - Core loader for Google Maps libraries
- `routesService.ts` - Route calculation with flood area intersection detection
- `geocodingService.ts` - Address to coordinates and reverse geocoding
- `placesService.ts` - Place search and autocomplete

**Firebase Services:**
- `firebaseService.ts` - Firestore CRUD operations for all collections

**Utility Services:**
- `storageService.ts` - Firebase Storage for image uploads
- `notificationService.ts` - In-app notifications
- `weatherService.ts` - Weather data integration

All services are exported as composables (e.g., `useRoutesService()`) for easy consumption in components.

## Key Development Patterns

### Working with Location

```typescript
// Get current location
const locationStore = useLocationStore()
await locationStore.getCurrentLocation() // Returns Location | null
const location = locationStore.currentLocation
const address = locationStore.currentAddress

// Handle permission errors
if (locationStore.permissionDenied) {
  // Show permission prompt
}
```

### Risk Assessment

```typescript
// Calculate risk for a location
const riskStore = useRiskStore()
await riskStore.assessRisk(location)
const risk = riskStore.currentRisk // { level, score, reasons, floodDistance }
const color = riskStore.riskColor // 'success' | 'warning' | 'danger'
const label = riskStore.riskLabel // Thai text
```

### Firebase Service Usage

```typescript
// Create a flood report
const firebaseService = useFirebaseService()
const reportId = await firebaseService.createFloodReport({
  userId: user.id || 'guest',
  location: { lat: 13.7563, lng: 100.5018 },
  address: locationStore.currentAddress!,
  severity: 'MODERATE',
  waterLevel: 30,
  description: 'น้ำท่วมสูงประมาณ 30 ซม.',
  images: [],
  roadPassable: true,
  verified: false,
  likes: 0
})

// Get recent reports
const reports = await firebaseService.getFloodReports(20)
```

### Distance Calculation

Use the Haversine formula implementation in `stores/risk.ts`:

```typescript
const riskStore = useRiskStore()
const distance = riskStore.calculateDistance(locationA, locationB) // km
```

### Route Calculation with Flood Detection

```typescript
// Calculate multiple alternative routes
const routeCalc = useRouteCalculation()
const routes = await routeCalc.calculateRoute(
  origin,
  destination,
  'CAR',
  true // avoidFloodZones
)

// Each route includes risk assessment
routes.forEach(route => {
  console.log(route.name) // 'เส้นทางที่แนะนำ', 'เส้นทางทางเลือก 1', etc.
  console.log(route.riskAssessment.level) // 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  console.log(route.floodAreasOnRoute) // Array of FloodArea that intersect route
  console.log(routeCalc.formatDistance(route.distance)) // '5.2 กม.'
  console.log(routeCalc.formatDuration(route.duration)) // '15 นาที'
})
```

### Working with Google Maps

```typescript
// Load Google Maps libraries dynamically
const mapsService = useGoogleMapsService()
await mapsService.loadGoogleMaps(['places', 'routes', 'marker'])

// Now Google Maps API is available
const map = new google.maps.Map(...)
```

## Important Notes

### Client-Side Only Features

Many features require browser APIs and must check `process.client`:
- Geolocation API
- Leaflet map rendering
- Firebase Analytics
- Local storage

Always wrap browser-only code:
```typescript
if (!process.client) return

// Browser-only code here
```

### Thai Language

The app is entirely in Thai language. When adding new features:
- All user-facing text should be in Thai
- Use Thai province/district names from reverse geocoding
- Format dates/numbers according to Thai locale

### Performance Considerations

- Firestore queries use pagination (`limit(50)` default)
- Map should lazy-load flood areas to avoid rendering thousands of markers
- Risk assessment runs client-side to avoid API costs
- Use Firestore indexes for common queries (see `FIRESTORE_SCHEMA.md`)

### Mock Data

The app works without Firebase using mock data from `utils/seedData.ts`. This allows:
- Local development without Firebase setup
- Testing UI without real data
- Demonstrations without API costs

To populate Firebase, run: `pnpm seed`

## Common Gotchas

1. **SSR Disabled**: The app runs client-side only (`ssr: false`). All code executes in the browser.
2. **Leaflet CSS**: Must be imported globally in `nuxt.config.ts`, not in component
3. **Timestamp Conversion**: Firestore Timestamps must be converted to Date objects when reading
4. **Auto-routing**: Page names in `pages/` directory determine routes automatically
5. **Firebase Client Plugin**: Only runs on client-side (`.client.ts` suffix)
6. **PWA Warnings**: PWA dev warnings are normal, disabled via `devOptions.enabled: false`
7. **Google Maps Loader**: Always use `useGoogleMapsService()` to load libraries before accessing `google.maps` API
8. **Route Risk Calculation**: Routes are evaluated by checking if polyline points intersect flood area radii using Haversine distance
9. **Service Pattern**: Services are classes exported as composable functions (e.g., `new RoutesService()` wrapped in `useRoutesService()`)
10. **Content Security Policy**: CSP headers in `nuxt.config.ts` are configured to allow Google Maps, fonts, and analytics - modify carefully

## Firebase Setup

For a new Firebase instance, follow `QUICKSTART.md`:
1. Enable Firestore Database in `asia-southeast1`
2. Enable Authentication (Email/Password + Google)
3. Apply Security Rules from `FIRESTORE_SCHEMA.md`
4. Add `localhost` to authorized domains
5. Run `pnpm seed` to populate sample data

## Related Documentation

- `README.md` - Full project overview and feature list
- `QUICKSTART.md` - Step-by-step Firebase setup guide
- `FIRESTORE_SCHEMA.md` - Complete database schema and security rules
- [Nuxt 4 Docs](https://nuxt.com/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Leaflet Docs](https://leafletjs.com/)
