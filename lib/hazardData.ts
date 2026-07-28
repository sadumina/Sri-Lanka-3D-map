import type { HazardCollection, HazardFeature, HazardProperties, RiskLevel } from "./hazardTypes";

const scenario = "demo-2026-cinematic";

const riskConfidence: Record<RiskLevel, number> = {
  low: 0.58,
  medium: 0.7,
  high: 0.82,
  extreme: 0.92,
};

function ellipsePolygon(
  centerLon: number,
  centerLat: number,
  radiusLon: number,
  radiusLat: number,
  points = 34,
): GeoJSON.Position[] {
  const coordinates: GeoJSON.Position[] = [];
  for (let index = 0; index < points; index += 1) {
    const angle = (Math.PI * 2 * index) / points;
    coordinates.push([
      Number((centerLon + Math.cos(angle) * radiusLon).toFixed(5)),
      Number((centerLat + Math.sin(angle) * radiusLat).toFixed(5)),
    ]);
  }
  coordinates.push(coordinates[0]);
  return coordinates;
}

function feature(
  properties: Omit<HazardProperties, "confidence" | "scenario"> & { confidence?: number },
  centerLon: number,
  centerLat: number,
  radiusLon: number,
  radiusLat: number,
): HazardFeature {
  return {
    type: "Feature",
    properties: {
      ...properties,
      confidence: properties.confidence ?? riskConfidence[properties.riskLevel],
      scenario,
    },
    geometry: {
      type: "Polygon",
      coordinates: [ellipsePolygon(centerLon, centerLat, radiusLon, radiusLat)],
    },
  };
}

export const floodHazards: HazardCollection = {
  type: "FeatureCollection",
  features: [
    feature({ hazardType: "flood", riskLevel: "extreme", district: "Colombo" }, 79.9, 6.9, 0.18, 0.12),
    feature({ hazardType: "flood", riskLevel: "high", district: "Gampaha" }, 80.02, 7.08, 0.21, 0.14),
    feature({ hazardType: "flood", riskLevel: "high", district: "Kalutara" }, 80.05, 6.58, 0.22, 0.13),
    feature({ hazardType: "flood", riskLevel: "medium", district: "Galle" }, 80.22, 6.08, 0.2, 0.1),
    feature({ hazardType: "flood", riskLevel: "medium", district: "Matara" }, 80.55, 5.96, 0.22, 0.1),
    feature({ hazardType: "flood", riskLevel: "high", district: "Trincomalee" }, 81.18, 8.58, 0.25, 0.18),
    feature({ hazardType: "flood", riskLevel: "medium", district: "Batticaloa" }, 81.55, 7.72, 0.2, 0.26),
    feature({ hazardType: "flood", riskLevel: "high", district: "Ampara" }, 81.68, 7.22, 0.22, 0.2),
    feature({ hazardType: "flood", riskLevel: "medium", district: "Mannar" }, 80.02, 8.92, 0.24, 0.16),
    feature({ hazardType: "flood", riskLevel: "low", district: "Anuradhapura" }, 80.45, 8.28, 0.23, 0.16),
  ],
};

export const landslideHazards: HazardCollection = {
  type: "FeatureCollection",
  features: [
    feature({ hazardType: "landslide", riskLevel: "extreme", district: "Nuwara Eliya" }, 80.78, 6.96, 0.18, 0.16),
    feature({ hazardType: "landslide", riskLevel: "extreme", district: "Badulla" }, 81.02, 6.82, 0.18, 0.14),
    feature({ hazardType: "landslide", riskLevel: "high", district: "Kandy" }, 80.64, 7.3, 0.18, 0.14),
    feature({ hazardType: "landslide", riskLevel: "high", district: "Ratnapura" }, 80.42, 6.7, 0.2, 0.16),
    feature({ hazardType: "landslide", riskLevel: "high", district: "Kegalle" }, 80.34, 7.24, 0.16, 0.12),
    feature({ hazardType: "landslide", riskLevel: "medium", district: "Matale" }, 80.68, 7.56, 0.17, 0.15),
    feature({ hazardType: "landslide", riskLevel: "medium", district: "Monaragala" }, 81.22, 6.88, 0.18, 0.13),
    feature({ hazardType: "landslide", riskLevel: "medium", district: "Kalutara" }, 80.22, 6.62, 0.16, 0.1),
    feature({ hazardType: "landslide", riskLevel: "low", district: "Galle" }, 80.32, 6.22, 0.15, 0.09),
  ],
};

export const districtLabels = [
  { name: "Colombo", lon: 79.86, lat: 6.93, note: "Urban flood exposure" },
  { name: "Kandy", lon: 80.64, lat: 7.29, note: "Highland instability" },
  { name: "Nuwara Eliya", lon: 80.77, lat: 6.97, note: "Extreme slope signal" },
  { name: "Ratnapura", lon: 80.4, lat: 6.68, note: "Rainfall-linked risk" },
  { name: "Batticaloa", lon: 81.7, lat: 7.72, note: "Coastal flood corridor" },
  { name: "Trincomalee", lon: 81.23, lat: 8.59, note: "Eastern flood basin" },
];
