import type { PriorityLevel } from "../../lib/decisionSupportData";

const statusColor: Record<PriorityLevel, string> = {
  low: "var(--status-good)",
  medium: "var(--status-warning)",
  high: "var(--status-serious)",
  extreme: "var(--status-critical)",
};

const statusLabel: Record<PriorityLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  extreme: "Extreme",
};

export function PriorityBarChart({
  data,
}: {
  data: { label: string; score: number; level: PriorityLevel }[];
}) {
  const max = 100;

  return (
    <div>
      <div className="chart-legend">
        {(Object.keys(statusLabel) as PriorityLevel[]).map((level) => (
          <span className="chart-legend-item" key={level}>
            <span className="chart-legend-dot" style={{ background: statusColor[level] }} />
            {statusLabel[level]}
          </span>
        ))}
      </div>
      <div className="chart-rows">
        {data.map((row) => (
          <div className="chart-row" key={row.label}>
            <span className="chart-row-label" title={row.label}>
              {row.label}
            </span>
            <span className="chart-track">
              <span
                className="chart-fill"
                style={{ width: `${(row.score / max) * 100}%`, background: statusColor[row.level] }}
                title={`${row.label}: priority score ${row.score}`}
              />
            </span>
            <span className="chart-value">{row.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const sequentialSteps = ["var(--seq-100)", "var(--seq-250)", "var(--seq-400)", "var(--seq-550)", "var(--seq-650)"];

function sequentialStepFor(percent: number) {
  const index = Math.min(sequentialSteps.length - 1, Math.floor((percent / 100) * sequentialSteps.length));
  return sequentialSteps[index];
}

export function OccupancyBarChart({
  data,
}: {
  data: { label: string; capacity: number; occupied: number }[];
}) {
  return (
    <div className="chart-rows">
      {data.map((row) => {
        const percent = Math.round((row.occupied / row.capacity) * 100);
        return (
          <div className="chart-row" key={row.label}>
            <span className="chart-row-label" title={row.label}>
              {row.label}
            </span>
            <span className="chart-track">
              <span
                className="chart-fill"
                style={{ width: `${percent}%`, background: sequentialStepFor(percent) }}
                title={`${row.label}: ${row.occupied} of ${row.capacity} occupied (${percent}%)`}
              />
            </span>
            <span className="chart-value">{percent}%</span>
          </div>
        );
      })}
    </div>
  );
}
