import type { LucideIcon } from "lucide-react";

export default function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  revealIndex,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  revealIndex?: number;
}) {
  return (
    <div
      className="stat-card reveal"
      style={revealIndex !== undefined ? ({ "--reveal-i": revealIndex } as React.CSSProperties) : undefined}
    >
      <div className="stat-card-label">
        <Icon size={15} aria-hidden />
        {label}
      </div>
      <div className="stat-card-value">{value}</div>
      {sub ? <div className="stat-card-sub">{sub}</div> : null}
    </div>
  );
}
