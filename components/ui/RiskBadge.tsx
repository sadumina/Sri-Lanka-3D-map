import { AlertTriangle, CircleAlert, Flame, ShieldCheck } from "lucide-react";
import type { RiskLevel } from "../../lib/hazardTypes";

const levelMeta: Record<RiskLevel, { label: string; icon: typeof ShieldCheck }> = {
  low: { label: "Low", icon: ShieldCheck },
  medium: { label: "Medium", icon: CircleAlert },
  high: { label: "High", icon: AlertTriangle },
  extreme: { label: "Extreme", icon: Flame },
};

export default function RiskBadge({ level, label }: { level: RiskLevel; label?: string }) {
  const meta = levelMeta[level];
  const Icon = meta.icon;

  return (
    <span className={`badge badge-${level}`}>
      <span className="badge-dot" aria-hidden />
      <Icon size={12} aria-hidden />
      {label ?? meta.label}
    </span>
  );
}
