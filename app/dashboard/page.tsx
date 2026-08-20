import { AlertTriangle, Gauge, LayoutDashboard, Siren, Users } from "lucide-react";
import StatCard from "../../components/ui/StatCard";
import RiskBadge from "../../components/ui/RiskBadge";
import { PriorityBarChart } from "../../components/ui/BarChart";
import { alerts, decisionSupportSummary, districtRisk } from "../../lib/decisionSupportData";

function formatPopulation(value: number) {
  return value.toLocaleString("en-US");
}

function formatTimeAgo(iso: string) {
  const hours = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 36e5));
  if (hours <= 0) return "just now";
  if (hours === 1) return "1 hour ago";
  return `${hours} hours ago`;
}

export default function DashboardPage() {
  const topDistricts = districtRisk.slice(0, 8).map((d) => ({
    label: d.district,
    score: d.priorityScore,
    level: d.priorityLevel,
  }));

  return (
    <div className="site">
      <main className="site-main">
        <section className="section-tight">
          <div className="container">
            <p className="eyebrow-site">Decision Support</p>
            <h1 className="h2-site" style={{ fontSize: "clamp(1.7rem, 3.4vw, 2.4rem)" }}>
              Early Warning & Priority Risk Overview
            </h1>
            <p className="lede" style={{ fontSize: "1rem" }}>
              Joint flood and landslide probabilities, population exposure, and infrastructure
              accessibility combined into a single priority score per district, translated into
              graded alerts with recommended actions.
            </p>

            <div className="stat-grid" style={{ marginTop: 28 }}>
              <StatCard
                icon={Siren}
                label="Active alerts"
                value={String(decisionSupportSummary.activeAlerts)}
                revealIndex={0}
              />
              <StatCard
                icon={AlertTriangle}
                label="Critical-risk districts"
                value={String(decisionSupportSummary.criticalDistricts)}
                revealIndex={1}
              />
              <StatCard
                icon={Users}
                label="Population exposed"
                value={formatPopulation(decisionSupportSummary.populationAtRisk)}
                revealIndex={2}
              />
              <StatCard
                icon={Gauge}
                label="Avg. model confidence"
                value={`${Math.round(decisionSupportSummary.avgConfidence * 100)}%`}
                revealIndex={3}
              />
            </div>
          </div>
        </section>

        <section className="section-tight">
          <div className="container">
            <div className="split-grid">
              <div className="card card-pad reveal">
                <div className="section-head" style={{ marginBottom: 14 }}>
                  <div>
                    <h2 className="h2-site" style={{ fontSize: "1.15rem" }}>
                      Joint risk priority by district
                    </h2>
                    <p style={{ margin: "4px 0 0" }}>Higher score = higher combined flood + landslide priority</p>
                  </div>
                </div>
                <PriorityBarChart data={topDistricts} />
              </div>

              <div className="card card-pad reveal" style={{ "--reveal-i": 1 } as React.CSSProperties}>
                <div className="section-head" style={{ marginBottom: 4 }}>
                  <div>
                    <h2 className="h2-site" style={{ fontSize: "1.15rem" }}>
                      <LayoutDashboard size={17} aria-hidden style={{ verticalAlign: -2, marginRight: 6 }} />
                      Issued alerts
                    </h2>
                  </div>
                </div>
                {alerts.map((alert, i) => (
                  <div className="list-item reveal" style={{ "--reveal-i": i } as React.CSSProperties} key={alert.id}>
                    <span className="list-item-icon">
                      <Siren size={16} aria-hidden />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="list-item-title">
                        {alert.district}
                        <RiskBadge level={alert.level} />
                      </div>
                      <div className="list-item-meta">{alert.message}</div>
                      <div className="list-item-meta" style={{ color: "var(--site-accent-strong)", fontWeight: 600 }}>
                        {alert.recommendedAction}
                      </div>
                    </div>
                    <span className="list-item-time">{formatTimeAgo(alert.issuedAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-head">
              <div>
                <h2 className="h2-site">District risk register</h2>
                <p>Full breakdown of flood and landslide exposure feeding the priority score above.</p>
              </div>
            </div>
            <div className="table-wrap reveal">
              <table className="table">
                <thead>
                  <tr>
                    <th>District</th>
                    <th>Flood risk</th>
                    <th>Landslide risk</th>
                    <th>Population exposed</th>
                    <th>Priority score</th>
                    <th>Recommended action</th>
                  </tr>
                </thead>
                <tbody>
                  {districtRisk.map((d) => (
                    <tr key={d.district}>
                      <td style={{ fontWeight: 700 }}>{d.district}</td>
                      <td>{d.floodRisk ? <RiskBadge level={d.floodRisk} /> : <span style={{ color: "var(--site-muted)" }}>—</span>}</td>
                      <td>
                        {d.landslideRisk ? (
                          <RiskBadge level={d.landslideRisk} />
                        ) : (
                          <span style={{ color: "var(--site-muted)" }}>—</span>
                        )}
                      </td>
                      <td className="table-num">{formatPopulation(d.populationExposed)}</td>
                      <td className="table-num">{d.priorityScore}</td>
                      <td style={{ color: "var(--site-text-secondary)" }}>{d.recommendedAction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          Static prototype — risk scores and alerts shown here are mock, illustrative data.
        </div>
      </footer>
    </div>
  );
}
