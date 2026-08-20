import { floodHazards, landslideHazards } from "./hazardData";
import type { RiskLevel } from "./hazardTypes";

export type PriorityLevel = "low" | "medium" | "high" | "extreme";

export type DistrictRisk = {
  district: string;
  floodRisk: RiskLevel | null;
  floodConfidence: number | null;
  landslideRisk: RiskLevel | null;
  landslideConfidence: number | null;
  populationExposed: number;
  priorityScore: number;
  priorityLevel: PriorityLevel;
  recommendedAction: string;
};

export type Alert = {
  id: string;
  district: string;
  hazardType: "flood" | "landslide" | "both";
  level: PriorityLevel;
  issuedAt: string;
  message: string;
  recommendedAction: string;
};

const riskWeight: Record<RiskLevel, number> = {
  low: 28,
  medium: 52,
  high: 76,
  extreme: 95,
};

// Rough, static population figures per district (mock, for showcase purposes only).
const populationByDistrict: Record<string, number> = {
  Colombo: 232000,
  Gampaha: 168000,
  Kalutara: 121000,
  Galle: 96000,
  Matara: 74000,
  Trincomalee: 61000,
  Batticaloa: 58000,
  Ampara: 52000,
  Mannar: 21000,
  Anuradhapura: 44000,
  "Nuwara Eliya": 47000,
  Badulla: 51000,
  Kandy: 88000,
  Ratnapura: 69000,
  Kegalle: 43000,
  Matale: 33000,
  Monaragala: 27000,
};

function priorityLevelFromScore(score: number): PriorityLevel {
  if (score >= 85) return "extreme";
  if (score >= 65) return "high";
  if (score >= 40) return "medium";
  return "low";
}

function recommendedActionFor(level: PriorityLevel, hasBoth: boolean): string {
  switch (level) {
    case "extreme":
      return hasBoth
        ? "Issue evacuation order; pre-position rescue teams and open shelters"
        : "Issue evacuation order for exposed low-lying/slope zones";
    case "high":
      return "Issue red alert; activate DDMC operations and stage response teams";
    case "medium":
      return "Issue amber advisory; monitor rainfall thresholds closely";
    default:
      return "Routine monitoring; no active alert required";
  }
}

function getOrCreate(districts: Map<string, DistrictRisk>, district: string): DistrictRisk {
  const existing = districts.get(district);
  if (existing) return existing;
  const created: DistrictRisk = {
    district,
    floodRisk: null,
    floodConfidence: null,
    landslideRisk: null,
    landslideConfidence: null,
    populationExposed: populationByDistrict[district] ?? 30000,
    priorityScore: 0,
    priorityLevel: "low",
    recommendedAction: "",
  };
  districts.set(district, created);
  return created;
}

function buildDistrictRisk(): DistrictRisk[] {
  const districts = new Map<string, DistrictRisk>();

  // Several districts have more than one feature of the same hazard type
  // (e.g. two flood zones along the same river) — keep the worse reading.
  floodHazards.features.forEach((f) => {
    const { district, riskLevel, confidence } = f.properties;
    const entry = getOrCreate(districts, district);
    if (!entry.floodRisk || riskWeight[riskLevel] > riskWeight[entry.floodRisk]) {
      entry.floodRisk = riskLevel;
      entry.floodConfidence = confidence;
    }
  });

  landslideHazards.features.forEach((f) => {
    const { district, riskLevel, confidence } = f.properties;
    const entry = getOrCreate(districts, district);
    if (!entry.landslideRisk || riskWeight[riskLevel] > riskWeight[entry.landslideRisk]) {
      entry.landslideRisk = riskLevel;
      entry.landslideConfidence = confidence;
    }
  });

  return Array.from(districts.values())
    .map((entry) => {
      const floodScore = entry.floodRisk ? riskWeight[entry.floodRisk] * (entry.floodConfidence ?? 1) : 0;
      const landslideScore = entry.landslideRisk
        ? riskWeight[entry.landslideRisk] * (entry.landslideConfidence ?? 1)
        : 0;
      const hasBoth = Boolean(entry.floodRisk && entry.landslideRisk);
      const cascadeBonus = hasBoth ? 8 : 0;
      const priorityScore = Math.min(100, Math.round(Math.max(floodScore, landslideScore) + cascadeBonus));
      const priorityLevel = priorityLevelFromScore(priorityScore);

      return {
        ...entry,
        priorityScore,
        priorityLevel,
        recommendedAction: recommendedActionFor(priorityLevel, hasBoth),
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

export const districtRisk: DistrictRisk[] = buildDistrictRisk();

export const alerts: Alert[] = districtRisk.slice(0, 6).map((entry, index) => {
  const hazardType: Alert["hazardType"] =
    entry.floodRisk && entry.landslideRisk ? "both" : entry.floodRisk ? "flood" : "landslide";
  const hoursAgo = index * 3 + 1;
  const issued = new Date("2026-08-19T14:30:00+05:30");
  issued.setHours(issued.getHours() - hoursAgo);

  return {
    id: `alert-${entry.district.toLowerCase().replace(/\s+/g, "-")}`,
    district: entry.district,
    hazardType,
    level: entry.priorityLevel,
    issuedAt: issued.toISOString(),
    message:
      hazardType === "both"
        ? `Compound flood and landslide risk detected in ${entry.district}.`
        : hazardType === "flood"
          ? `Rising flood risk detected across ${entry.district}.`
          : `Elevated slope-failure risk detected in ${entry.district}.`,
    recommendedAction: entry.recommendedAction,
  };
});

export const decisionSupportSummary = {
  activeAlerts: alerts.length,
  criticalDistricts: districtRisk.filter((d) => d.priorityLevel === "extreme" || d.priorityLevel === "high").length,
  populationAtRisk: districtRisk.reduce((sum, d) => sum + d.populationExposed, 0),
  avgConfidence:
    districtRisk.reduce((sum, d) => {
      const values = [d.floodConfidence, d.landslideConfidence].filter((v): v is number => v !== null);
      const avg = values.reduce((s, v) => s + v, 0) / (values.length || 1);
      return sum + avg;
    }, 0) / (districtRisk.length || 1),
};
