# Google Maps Platform Setup

TANGROD uses Google Maps Platform as the primary map engine for displaying flood information with satellite imagery and 3D views.

## Prerequisites

1. **Google Cloud Platform Account**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Required APIs**

   Navigate to **APIs & Services > Library** and enable:
   - **Maps JavaScript API** (Required)
   - **Geocoding API** (For address lookup)
   - **Routes API** or **Directions API** (For routing)
   - **Places API** (For emergency places search)
   - **Maps 3D API** (Optional, for 3D visualization)

## Get API Key

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > API Key**
3. Copy the API key

### Secure Your API Key (Important!)

1. Click on your API key to edit
2. Under **Application restrictions**, select:
   - **HTTP referrers (web sites)**
   - Add your domain(s):
     ```
     localhost:3000/*
     yourdomain.com/*
     *.yourdomain.com/*
     ```

3. Under **API restrictions**, select:
   - **Restrict key**
   - Select only the APIs you enabled above

## Configure TANGROD

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your Google Maps API key:
   ```env
   NUXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
   ```

3. **NEVER commit `.env` to version control!**
   - The `.env` file is already in `.gitignore`
   - Only commit `.env.example` with placeholder values

## Features Available

### Map Modes
- **Standard** (Roadmap) - Traditional map view
- **Satellite** (Default) - High-resolution satellite imagery
- **Hybrid** - Satellite with road labels
- **Terrain** - Topographic map

### 3D View
- Enable 3D mode for Google Earth-like experience
- Tilt and rotate the map
- View buildings and terrain in 3D

### Flood Overlay
- Flood areas displayed with color-coded severity
- Clickable markers with detailed information
- Real-time updates

### Emergency Places
- Hospitals (🏥)
- Police Stations (🚓)
- Fire Stations (🚒)
- Shelters (🏠)
- Gas Stations (⛽)

### Route Planning
- Calculate routes with flood risk assessment
- Alternative route suggestions
- Avoid flood zones

## Architecture

```
services/
├── googleMapsService.ts    # Core Google Maps integration
├── geocodingService.ts     # Address ↔ Location conversion
├── routesService.ts        # Route calculation & flood detection
└── placesService.ts        # Emergency places search

components/map/
└── GoogleMap.vue           # Main map component

pages/
└── map.vue                 # Map page with controls
```

## API Usage & Costs

Google Maps Platform has a **$200 monthly credit**. Typical usage for TANGROD:

- **Maps JavaScript API**: $7 per 1,000 loads
- **Geocoding API**: $5 per 1,000 requests
- **Directions API**: $5 per 1,000 requests
- **Places API**: $17 per 1,000 requests

**Estimated monthly cost for 10,000 users**: ~$50-100 (well within free tier)

## Security Notes

1. **Content Security Policy (CSP)**
   - Already configured in `nuxt.config.ts`
   - Allows only necessary Google Maps domains

2. **API Key Restrictions**
   - Always restrict by HTTP referrer
   - Limit to specific APIs
   - Monitor usage in Google Cloud Console

3. **Rate Limiting**
   - Implement rate limiting for production
   - Cache geocoding results
   - Batch requests when possible

## Troubleshooting

### Map not loading
1. Check browser console for errors
2. Verify API key is correct in `.env`
3. Ensure APIs are enabled in Google Cloud Console
4. Check HTTP referrer restrictions

### "This page can't load Google Maps correctly"
- API key is invalid or restricted
- Check billing is enabled in Google Cloud Console
- Required API not enabled

### CSP Errors
- Check `nuxt.config.ts` CSP configuration
- Ensure all Google Maps domains are whitelisted

## Development vs Production

### Development
```env
NUXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_dev_api_key
```
- Use separate API key for development
- Restrict to `localhost:3000`

### Production
```env
NUXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_prod_api_key
```
- Use separate API key for production
- Restrict to your production domain
- Enable billing alerts
- Monitor usage dashboard

## References

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Maps JavaScript API Guide](https://developers.google.com/maps/documentation/javascript)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)
- [Pricing Calculator](https://mapsplatform.google.com/pricing/)
