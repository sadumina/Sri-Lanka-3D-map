# Sri Lanka 3D Hazard Map

Cinematic CesiumJS prototype for showcasing predicted flood and landslide areas in Sri Lanka.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Cesium Ion

Create `.env.local` and add:

```env
NEXT_PUBLIC_CESIUM_ION_TOKEN=your_token_here
```

The app runs without a token, but Cesium ion terrain is enabled when the token is present.

For a research/demo showcase, the free Cesium ion Community plan is enough to get high-quality
streamed terrain and imagery within its usage limits. You only need a paid plan later if the map
becomes a commercial/public product with higher traffic or support needs.

## Google Photorealistic 3D Tiles

For the highest-quality free demo path, create `.env.local` and add:

```env
NEXT_PUBLIC_GOOGLE_MAPS_3D_API_KEY=your_google_maps_key_here
```

Then enable **Map Tiles API** in Google Cloud for that key. Google Photorealistic 3D Tiles require
billing to be enabled on the Google Cloud project even when free monthly credits/allowances cover
your demo usage. Restrict the key to your localhost/deployment domain and the Map Tiles API.

The app uses Google 3D when this key is present and falls back to Cesium terrain otherwise.

## Replace Demo Data

The dummy layers live in `lib/hazardData.ts`. Replace `floodHazards` and `landslideHazards` with GeoJSON FeatureCollections that keep these properties:

```ts
type HazardProperties = {
  hazardType: "flood" | "landslide";
  riskLevel: "low" | "medium" | "high" | "extreme";
  confidence: number;
  district: string;
  scenario: string;
};
```

The demo data is not suitable for operational decisions.
