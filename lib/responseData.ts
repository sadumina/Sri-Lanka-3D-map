import { districtRisk } from "./decisionSupportData";

export type ResourceType = "Rescue Boats" | "Ambulances" | "Shelters" | "Supply Stock";

export type ResourceRecord = {
  id: string;
  district: string;
  type: ResourceType;
  unit: string;
  available: number;
  deployed: number;
};

export type DispatchStatus = "En Route" | "Deployed" | "Standby" | "Returning";

export type Dispatch = {
  id: string;
  district: string;
  resource: string;
  team: string;
  status: DispatchStatus;
  eta: string;
};

export type RouteStatus = "Clear" | "Congested" | "Blocked";

export type EvacuationRoute = {
  id: string;
  name: string;
  district: string;
  status: RouteStatus;
  note: string;
};

export type Shelter = {
  id: string;
  name: string;
  district: string;
  capacity: number;
  occupied: number;
};

const priorityDistricts = districtRisk.slice(0, 8).map((d) => d.district);

function slug(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

export const resources: ResourceRecord[] = priorityDistricts.flatMap((district, index) => {
  const boats = 4 + ((index * 2) % 7);
  const boatsDeployed = Math.min(boats, Math.round(boats * (0.25 + (index % 4) * 0.15)));
  const ambulances = 6 + ((index * 3) % 9);
  const ambulancesDeployed = Math.min(ambulances, Math.round(ambulances * (0.2 + (index % 3) * 0.2)));
  const shelters = 3 + (index % 5);
  const sheltersDeployed = Math.min(shelters, Math.round(shelters * (0.3 + (index % 2) * 0.25)));
  const supply = 800 + index * 140;
  const supplyDeployed = Math.round(supply * (0.15 + (index % 4) * 0.12));

  return [
    { id: `${slug(district)}-boats`, district, type: "Rescue Boats", unit: "boats", available: boats - boatsDeployed, deployed: boatsDeployed },
    { id: `${slug(district)}-ambulances`, district, type: "Ambulances", unit: "units", available: ambulances - ambulancesDeployed, deployed: ambulancesDeployed },
    { id: `${slug(district)}-shelters`, district, type: "Shelters", unit: "sites", available: shelters - sheltersDeployed, deployed: sheltersDeployed },
    { id: `${slug(district)}-supply`, district, type: "Supply Stock", unit: "kg", available: supply - supplyDeployed, deployed: supplyDeployed },
  ] as ResourceRecord[];
});

const dispatchStatuses: DispatchStatus[] = ["En Route", "Deployed", "Standby", "Returning"];
const teams = ["Rescue Team Alpha", "Rescue Team Bravo", "DDMC Field Unit", "Medical Response Unit", "Water Rescue Unit"];

export const dispatches: Dispatch[] = priorityDistricts.slice(0, 6).map((district, index) => ({
  id: `dispatch-${slug(district)}`,
  district,
  resource: index % 2 === 0 ? "Rescue Boat + Crew" : "Ambulance + Medical Team",
  team: teams[index % teams.length],
  status: dispatchStatuses[index % dispatchStatuses.length],
  eta: index % 4 === 3 ? "On site" : `${12 + index * 6} min`,
}));

const routeStatuses: RouteStatus[] = ["Clear", "Congested", "Blocked"];

export const evacuationRoutes: EvacuationRoute[] = priorityDistricts.slice(0, 7).map((district, index) => {
  const status = routeStatuses[index % routeStatuses.length];
  return {
    id: `route-${slug(district)}`,
    name: `${district} Evacuation Corridor ${String.fromCharCode(65 + (index % 3))}`,
    district,
    status,
    note:
      status === "Blocked"
        ? "Rerouting via secondary road; avoid this corridor"
        : status === "Congested"
          ? "Heavy traffic reported; expect delays"
          : "Route open, moving normally",
  };
});

export const shelters: Shelter[] = priorityDistricts.slice(0, 8).map((district, index) => {
  const capacity = 200 + index * 45;
  const occupied = Math.round(capacity * (0.2 + ((index * 17) % 70) / 100));
  return {
    id: `shelter-${slug(district)}`,
    name: `${district} Community Shelter`,
    district,
    capacity,
    occupied: Math.min(capacity, occupied),
  };
});

export const responseSummary = {
  activeDispatches: dispatches.filter((d) => d.status === "En Route" || d.status === "Deployed").length,
  blockedRoutes: evacuationRoutes.filter((r) => r.status === "Blocked").length,
  shelterCapacity: shelters.reduce((sum, s) => sum + s.capacity, 0),
  shelterOccupied: shelters.reduce((sum, s) => sum + s.occupied, 0),
};
