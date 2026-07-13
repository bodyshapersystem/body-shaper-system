const COLORS = ["#5C1A1F", "#B08968", "#7A8B6F", "#C4A24A", "#8A7F74", "#2B2622"];

export default function RevenueDonut({ entries, total }: { entries: [string, number][]; total: number }) {
  if (entries.length === 0 || total === 0) {
    return <p className="dash-empty">No revenue recorded yet.</p>;
  }

  let cumulativePercent = 0;
  const gradientStops = entries
    .map(([, amount], i) => {
      const percent = (amount / total) * 100;
      const start = cumulativePercent;
      cumulativePercent += percent;
      return `${COLORS[i % COLORS.length]} ${start}% ${cumulativePercent}%`;
    })
    .join(", ");

  return (
    <div className="analytics-donut-wrap">
      <div className="analytics-donut" style={{ background: `conic-gradient(${gradientStops})` }}>
        <div className="analytics-donut-inner">
          <strong>${(total / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
          <span>total</span>
        </div>
      </div>
      <div className="analytics-donut-legend">
        {entries.map(([label, amount], i) => (
          <div key={label} className="analytics-donut-legend-row">
            <span className="analytics-donut-dot" style={{ background: COLORS[i % COLORS.length] }} />
            <span style={{ flex: 1 }}>{label}</span>
            <span className="pay-history-meta">{Math.round((amount / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
