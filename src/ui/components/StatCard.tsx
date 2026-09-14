export function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="stat-card">
      <div className="stat-card-key text-muted">{label}</div>
      <div className="stat-card-value">{value}</div>
      {sub ? <div className="stat-card-sub text-muted">{sub}</div> : null}
    </div>
  );
}
