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
  rotationDeg = 0,
  points = 34,
): GeoJSON.Position[] {
  const rotation = (rotationDeg * Math.PI) / 180;
  const coordinates: GeoJSON.Position[] = [];
  for (let index = 0; index < points; index += 1) {
    const angle = (Math.PI * 2 * index) / points;
    const x = Math.cos(angle) * radiusLon;
    const y = Math.sin(angle) * radiusLat;
    coordinates.push([
      Number((centerLon + x * Math.cos(rotation) - y * Math.sin(rotation)).toFixed(5)),
      Number((centerLat + x * Math.sin(rotation) + y * Math.cos(rotation)).toFixed(5)),
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
  rotationDeg = 0,
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
      coordinates: [ellipsePolygon(centerLon, centerLat, radiusLon, radiusLat, rotationDeg)],
    },
  };
}

// Kelani River, mouth (Colombo) -> upper catchment (Kitulgala, Kegalle district).
const kelaniRiverPath: GeoJSON.Position[] = [
  [79.87, 6.96],
  [79.93, 6.97],
  [80.06, 6.95],
  [80.14, 6.9],
  [80.28, 6.94],
  [80.42, 6.99],
];

// Kalu River, mouth (Kalutara) -> upper catchment (Kalawana, Ratnapura district).
const kaluRiverPath: GeoJSON.Position[] = [
  [79.96, 6.58],
  [80.1, 6.58],
  [80.24, 6.62],
  [80.4, 6.68],
  [80.46, 6.6],
];

export const riverPaths: { name: "Kelani" | "Kalu"; positions: GeoJSON.Position[] }[] = [
  { name: "Kelani", positions: kelaniRiverPath },
  { name: "Kalu", positions: kaluRiverPath },
];

export const floodHazards: HazardCollection = {
  type: "FeatureCollection",
  features: [
    // Kelani River corridor
    feature(
      { hazardType: "flood", riskLevel: "extreme", district: "Colombo", locality: "Kelani River Mouth – Colombo", river: "Kelani" },
      79.88,
      6.95,
      0.14,
      0.07,
      20,
    ),
    feature(
      { hazardType: "flood", riskLevel: "high", district: "Gampaha", locality: "Biyagama – Kelani Valley", river: "Kelani" },
      80.02,
      6.95,
      0.13,
      0.06,
      10,
    ),
    feature(
      { hazardType: "flood", riskLevel: "high", district: "Colombo", locality: "Hanwella – Kelani River", river: "Kelani" },
      80.14,
      6.9,
      0.12,
      0.06,
      -15,
    ),
    feature(
      { hazardType: "flood", riskLevel: "medium", district: "Kegalle", locality: "Kitulgala – Upper Kelani", river: "Kelani" },
      80.4,
      6.99,
      0.13,
      0.07,
      35,
    ),
    // Kalu River corridor
    feature(
      { hazardType: "flood", riskLevel: "extreme", district: "Kalutara", locality: "Kalu River Mouth – Kalutara", river: "Kalu" },
      79.98,
      6.58,
      0.14,
      0.07,
      5,
    ),
    feature(
      { hazardType: "flood", riskLevel: "high", district: "Kalutara", locality: "Horana – Kalu River", river: "Kalu" },
      80.1,
      6.58,
      0.12,
      0.06,
      15,
    ),
    feature(
      { hazardType: "flood", riskLevel: "extreme", district: "Ratnapura", locality: "Ratnapura Town – Kalu River", river: "Kalu" },
      80.4,
      6.68,
      0.14,
      0.08,
      -25,
    ),
    feature(
      { hazardType: "flood", riskLevel: "medium", district: "Ratnapura", locality: "Kalawana – Upper Kalu", river: "Kalu" },
      80.46,
      6.6,
      0.12,
      0.07,
      -40,
    ),
  ],
};

export const landslideHazards: HazardCollection = {
  type: "FeatureCollection",
  features: [
    feature(
      { hazardType: "landslide", riskLevel: "high", district: "Nuwara Eliya", locality: "Kothmale" },
      80.6,
      7.05,
      0.09,
      0.06,
      35,
    ),
    feature(
      { hazardType: "landslide", riskLevel: "extreme", district: "Nuwara Eliya", locality: "Ambagamuwa" },
      80.58,
      6.9,
      0.08,
      0.07,
      -20,
    ),
    feature(
      { hazardType: "landslide", riskLevel: "medium", district: "Nuwara Eliya", locality: "Walapane" },
      80.85,
      6.95,
      0.07,
      0.08,
      10,
    ),
  ],
};

export const districtLabels = [
  { name: "Kothmale", lon: 80.6, lat: 7.05, note: "Landslide DS division — Kotmale/Ramboda" },
  { name: "Ambagamuwa", lon: 80.58, lat: 6.9, note: "Landslide DS division — Hatton/Watawala" },
  { name: "Walapane", lon: 80.85, lat: 6.95, note: "Landslide DS division — Ohiya border" },
  { name: "Colombo", lon: 79.88, lat: 6.95, note: "Kelani River flood mouth" },
  { name: "Kalutara", lon: 79.98, lat: 6.58, note: "Kalu River flood mouth" },
  { name: "Ratnapura", lon: 80.4, lat: 6.68, note: "Kalu River flood city" },
];
