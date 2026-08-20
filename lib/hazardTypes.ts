export type HazardType = "flood" | "landslide";
export type RiskLevel = "low" | "medium" | "high" | "extreme";

export type HazardProperties = {
  hazardType: HazardType;
  riskLevel: RiskLevel;
  confidence: number;
  district: string;
  scenario: string;
  /** Specific place name (DS division, town, river stretch) shown on the map. */
  locality?: string;
  /** Set on flood features generated from a river corridor. */
  river?: "Kelani" | "Kalu";
};

export type HazardFeature = GeoJSON.Feature<GeoJSON.Polygon, HazardProperties>;
export type HazardCollection = GeoJSON.FeatureCollection<GeoJSON.Polygon, HazardProperties>;
