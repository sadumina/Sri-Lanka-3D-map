export type HazardType = "flood" | "landslide";
export type RiskLevel = "low" | "medium" | "high" | "extreme";

export type HazardProperties = {
  hazardType: HazardType;
  riskLevel: RiskLevel;
  confidence: number;
  district: string;
  scenario: string;
};

export type HazardFeature = GeoJSON.Feature<GeoJSON.Polygon, HazardProperties>;
export type HazardCollection = GeoJSON.FeatureCollection<GeoJSON.Polygon, HazardProperties>;
