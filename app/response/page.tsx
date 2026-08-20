import { Ban, CircleCheck, HeartPulse, Home, LifeBuoy, Package, Radio, Route, TriangleAlert } from "lucide-react";
import StatCard from "../../components/ui/StatCard";
import { OccupancyBarChart } from "../../components/ui/BarChart";
import {
  dispatches,
  evacuationRoutes,
  resources,
  responseSummary,
  shelters,
  type ResourceType,
} from "../../lib/responseData";

const resourceIcon: Record<ResourceType, typeof LifeBuoy> = {
  "Rescue Boats": LifeBuoy,
  Ambulances: HeartPulse,
  Shelters: Home,
  "Supply Stock": Package,
};

const routeStatusIcon = {
  Clear: CircleCheck,
  Congested: TriangleAlert,
  Blocked: Ban,
};

const routeStatusClass = {
  Clear: "badge-low",
  Congested: "badge-medium",
  Blocked: "badge-extreme",
};

function aggregateByType() {
  const totals = new Map<ResourceType, { available: number; deployed: number; unit: string }>();
  resources.forEach((r) => {
    const current = totals.get(r.type) ?? { available: 0, deployed: 0, unit: r.unit };
    totals.set(r.type, {
      available: current.available + r.available,
      deployed: current.deployed + r.deployed,
      unit: r.unit,
    });
  });
  return Array.from(totals.entries());
}

export default function ResponsePage() {
  const totalsByType = aggregateByType();
  const occupancyData = shelters.map((s) => ({ label: s.district, capacity: s.capacity, occupied: s.occupied }));
  const shelterOccupancyPct = Math.round((responseSummary.shelterOccupied / responseSummary.shelterCapacity) * 100);

  return (
    <div className="site">
      <main className="site-main">
        <section className="section-tight">
          <div className="container">
            <p className="eyebrow-site">Emergency Response</p>
            <h1 className="h2-site" style={{ fontSize: "clamp(1.7rem, 3.4vw, 2.4rem)" }}>
              Resource Coordination & Dispatch
            </h1>
            <p className="lede" style={{ fontSize: "1rem" }}>
              Live availability of rescue boats, ambulances, shelters, and supplies against active
              dispatches and evacuation route status — converting prioritised alerts into coordinated
              action.
            </p>

            <div className="stat-grid" style={{ marginTop: 28 }}>
              <StatCard
                icon={Radio}
                label="Active dispatches"
                value={String(responseSummary.activeDispatches)}
                revealIndex={0}
              />
              <StatCard icon={Ban} label="Blocked routes" value={String(responseSummary.blockedRoutes)} revealIndex={1} />
              <StatCard
                icon={Home}
                label="Shelter occupancy"
                value={`${shelterOccupancyPct}%`}
                sub={`${responseSummary.shelterOccupied.toLocaleString()} of ${responseSummary.shelterCapacity.toLocaleString()} beds`}
                revealIndex={2}
              />
              <StatCard icon={LifeBuoy} label="Districts covered" value={String(shelters.length)} revealIndex={3} />
            </div>
          </div>
        </section>

        <section className="section-tight">
          <div className="container">
            <div className="section-head" style={{ marginBottom: 14 }}>
              <div>
                <h2 className="h2-site" style={{ fontSize: "1.15rem" }}>
                  Resource inventory
                </h2>
                <p>Totals across all covered districts, available vs. currently deployed.</p>
              </div>
            </div>
            <div className="resource-grid">
              {totalsByType.map(([type, totals], i) => {
                const Icon = resourceIcon[type];
                const total = totals.available + totals.deployed;
                const pct = total > 0 ? Math.round((totals.deployed / total) * 100) : 0;
                return (
                  <div className="resource-card reveal" style={{ "--reveal-i": i } as React.CSSProperties} key={type}>
                    <div className="resource-card-head">
                      <Icon size={15} aria-hidden />
                      {type}
                    </div>
                    <div className="resource-bar-track">
                      <div className="resource-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="resource-card-nums">
                      <span>
                        <strong>{totals.available}</strong> available
                      </span>
                      <span>
                        <strong>{totals.deployed}</strong> deployed {totals.unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section-tight">
          <div className="container">
            <div className="split-grid">
              <div className="card card-pad reveal">
                <div className="section-head" style={{ marginBottom: 4 }}>
                  <div>
                    <h2 className="h2-site" style={{ fontSize: "1.15rem" }}>
                      Active dispatches
                    </h2>
                  </div>
                </div>
                {dispatches.map((d, i) => (
                  <div className="list-item reveal" style={{ "--reveal-i": i } as React.CSSProperties} key={d.id}>
                    <span className="list-item-icon">
                      <Radio size={16} aria-hidden />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="list-item-title">
                        {d.district}
                        <span className="badge badge-medium">
                          <span className="badge-dot" aria-hidden />
                          {d.status}
                        </span>
                      </div>
                      <div className="list-item-meta">
                        {d.resource} · {d.team}
                      </div>
                    </div>
                    <span className="list-item-time">{d.eta}</span>
                  </div>
                ))}
              </div>

              <div className="card card-pad reveal" style={{ "--reveal-i": 1 } as React.CSSProperties}>
                <div className="section-head" style={{ marginBottom: 4 }}>
                  <div>
                    <h2 className="h2-site" style={{ fontSize: "1.15rem" }}>
                      <Route size={17} aria-hidden style={{ verticalAlign: -2, marginRight: 6 }} />
                      Evacuation routes
                    </h2>
                  </div>
                </div>
                {evacuationRoutes.map((r, i) => {
                  const Icon = routeStatusIcon[r.status];
                  return (
                    <div className="list-item reveal" style={{ "--reveal-i": i } as React.CSSProperties} key={r.id}>
                      <span className="list-item-icon">
                        <Icon size={16} aria-hidden />
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="list-item-title">
                          {r.name}
                          <span className={`badge ${routeStatusClass[r.status]}`}>
                            <span className="badge-dot" aria-hidden />
                            {r.status}
                          </span>
                        </div>
                        <div className="list-item-meta">{r.note}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="card card-pad reveal">
              <div className="section-head" style={{ marginBottom: 14 }}>
                <div>
                  <h2 className="h2-site" style={{ fontSize: "1.15rem" }}>
                    Shelter occupancy by district
                  </h2>
                  <p>Occupied capacity as a share of total shelter beds available.</p>
                </div>
              </div>
              <OccupancyBarChart data={occupancyData} />
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          Static prototype — dispatch, route, and shelter figures shown here are mock, illustrative
          data.
        </div>
      </footer>
    </div>
  );
}
