import Link from "next/link";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  LayoutDashboard,
  Mountain,
  Radar,
  Radio,
  Siren,
  Users,
  Waves,
} from "lucide-react";
import { decisionSupportSummary } from "../lib/decisionSupportData";
import { responseSummary } from "../lib/responseData";

const pillars = [
  {
    href: "/map",
    icon: Waves,
    title: "Flood Risk Mapping",
    copy: "AI-driven flood severity and impact assessment fused from river levels, DEM, land use, and satellite imagery, rendered as a live 3D hazard map.",
    cta: "Open the 3D map",
    accent: "#0e7490",
    tint: "#e3f8fb",
  },
  {
    href: "/map",
    icon: Mountain,
    title: "Landslide Risk Mapping",
    copy: "Rainfall-threshold triggered landslide probability modelling across slope, soil, and human-factor layers, mapped down to village level.",
    cta: "Open the 3D map",
    accent: "#b45309",
    tint: "#fef3e2",
  },
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    title: "Decision Support",
    copy: "Joint flood + landslide risk scoring, population exposure, and infrastructure-aware prioritisation translated into graded, explainable alerts.",
    cta: "View the dashboard",
    accent: "#4f46e5",
    tint: "#eceafd",
  },
  {
    href: "/response",
    icon: AlertOctagon,
    title: "Emergency Response",
    copy: "Real-time resource visibility, priority dispatch queueing, and hazard-aware evacuation routing for DDMC coordinators.",
    cta: "View response coordination",
    accent: "#d03b3b",
    tint: "#fbe4e4",
  },
];

function formatPopulation(value: number) {
  return `${(value / 1000).toFixed(0)}k+`;
}

// Simplified coastal trace of Sri Lanka (Point Pedro round the east coast to
// Dondra Head and back up the west coast), projected to a 260x400 viewBox.
const sriLankaSilhouette =
  "M 40.3,14 L 58.2,29.3 L 70.4,35 L 89.2,39.8 L 107.9,52.2 L 132.3,66.5 L 154.9,97 L 171.8,132.3 " +
  "L 189.6,163.8 L 200.9,189.5 L 215.9,214.3 L 228.1,242.9 L 230,273.4 L 228.1,297.3 L 211.2,325.9 " +
  "L 199,343.1 L 178.4,357.4 L 148.3,368.8 L 131.4,376.5 L 111.7,386 L 95.7,381.2 L 76.9,375.5 " +
  "L 65.7,365 L 54.4,332.6 L 52.5,323 L 42.2,289.7 L 41.3,263 L 37.5,227.7 L 37.5,192.4 L 40.3,184.7 " +
  "L 30,154.2 L 32.8,125.6 L 46.9,94.1 L 51.6,73.1 L 45,63.6 L 37.5,39.8 Z";

const heroMarkers = [
  { label: "Nuwara Eliya landslide corridor", x: 128.6, y: 285.8, color: "#b45309" },
  { label: "Kelani River / Colombo flood corridor", x: 53.5, y: 287.8, color: "#0e7490" },
  { label: "Kalu River / Ratnapura flood corridor", x: 93.8, y: 313.5, color: "#0e7490" },
];

export default function HomePage() {
  return (
    <div className="site">
      <main className="site-main">
        <section className="hero">
          <div className="container">
            <div className="hero-copy">
              <span className="eyebrow-badge reveal">
                <span className="live-dot" aria-hidden />
                IDMRES · Research Prototype · Static Showcase
              </span>
              <h1 className="h1-site reveal" style={{ "--reveal-i": 1 } as React.CSSProperties}>
                Integrated Flood & Landslide Risk Assessment and Response System for Sri Lanka
              </h1>
              <p className="lede reveal" style={{ "--reveal-i": 2 } as React.CSSProperties}>
                Sri Lanka&apos;s flood and landslide risk data is scattered across agencies and largely
                reactive. This prototype fuses flood impact assessment, landslide prediction, decision
                support, and emergency response coordination into a single platform — so authorities and
                citizens can see hazards, priorities, and available resources in one place.
              </p>
              <div className="hero-actions reveal" style={{ "--reveal-i": 3 } as React.CSSProperties}>
                <Link href="/map" className="btn btn-primary">
                  Explore the 3D map <ArrowRight size={16} aria-hidden />
                </Link>
                <Link href="/dashboard" className="btn btn-secondary">
                  View decision support
                </Link>
              </div>

              <div className="hero-stats reveal" style={{ "--reveal-i": 4 } as React.CSSProperties}>
                <div className="hero-stat">
                  <span className="hero-stat-icon">
                    <Siren size={16} aria-hidden />
                  </span>
                  <div>
                    <strong>{decisionSupportSummary.activeAlerts}</strong>
                    <span>Active alerts</span>
                  </div>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-icon">
                    <AlertTriangle size={16} aria-hidden />
                  </span>
                  <div>
                    <strong>{decisionSupportSummary.criticalDistricts}</strong>
                    <span>Critical-risk districts</span>
                  </div>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-icon">
                    <Users size={16} aria-hidden />
                  </span>
                  <div>
                    <strong>{formatPopulation(decisionSupportSummary.populationAtRisk)}</strong>
                    <span>Population exposed</span>
                  </div>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-icon">
                    <Radio size={16} aria-hidden />
                  </span>
                  <div>
                    <strong>{responseSummary.activeDispatches}</strong>
                    <span>Active dispatches</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="hero-visual reveal" style={{ "--reveal-i": 2 } as React.CSSProperties} aria-hidden="true">
              <div className="hero-visual-glow" />
              <div className="hero-visual-radar">
                <span />
                <span />
              </div>
              <div className="hero-visual-float">
                <svg className="hero-map-svg" viewBox="0 0 260 400">
                  <defs>
                    <linearGradient id="heroMapFill" x1="0" y1="0" x2="1" y2="1">
                      <stop className="hero-map-stop-a" offset="0%" />
                      <stop className="hero-map-stop-b" offset="100%" />
                    </linearGradient>
                  </defs>
                  <path className="hero-map-outline" d={sriLankaSilhouette} fill="url(#heroMapFill)" />
                  {heroMarkers.map((marker, i) => (
                    <g key={marker.label} style={{ "--marker-i": i } as React.CSSProperties} color={marker.color}>
                      <circle className="hero-marker-ring" cx={marker.x} cy={marker.y} r={9} />
                      <circle className="hero-marker-dot" cx={marker.x} cy={marker.y} r={4.2} fill="currentColor" />
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-head">
              <div>
                <p className="eyebrow-site">Four systems, one platform</p>
                <h2 className="h2-site">What this prototype demonstrates</h2>
              </div>
            </div>
            <div className="pillar-grid">
              {pillars.map(({ href, icon: Icon, title, copy, cta, accent, tint }, i) => (
                <Link
                  href={href}
                  className="pillar-card reveal"
                  key={title}
                  style={
                    {
                      "--reveal-i": i,
                      "--pillar-accent": accent,
                      "--pillar-tint": tint,
                    } as React.CSSProperties
                  }
                >
                  <span className="pillar-icon">
                    <Icon size={20} aria-hidden />
                  </span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                  <span className="pillar-link">
                    {cta} <ArrowRight size={14} aria-hidden />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section-tight">
          <div className="container">
            <div className="card card-pad why-card reveal">
              <span
                className="pillar-icon"
                style={
                  {
                    "--pillar-accent": "var(--status-warning)",
                    "--pillar-tint": "var(--status-warning-tint)",
                  } as React.CSSProperties
                }
              >
                <Radar size={20} aria-hidden />
              </span>
              <div>
                <h3 style={{ margin: "4px 0 8px" }}>Why an integrated platform</h3>
                <p className="body-copy">
                  Existing systems from the DMC, Department of Meteorology, and NBRO operate
                  independently and focus on single hazards. Response remains largely reactive, relying
                  on manual coordination rather than real-time risk analysis. This showcase demonstrates
                  how combining multi-hazard prediction with decision support and resource coordination
                  can reduce response time and improve preparedness for districts like Ratnapura,
                  Kegalle, Badulla, and Nuwara Eliya.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          Static prototype for supervisor and user feedback — all figures shown are illustrative mock
          data, not live measurements or operational guidance.
        </div>
      </footer>
    </div>
  );
}
