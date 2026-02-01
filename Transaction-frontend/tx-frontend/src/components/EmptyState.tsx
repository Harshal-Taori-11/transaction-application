export default function EmptyState({
  title,
  desc,
}: {
  title: string;
  desc?: string;
}) {
  return (
    <div style={{ padding: 24, textAlign: "center", color: "#6B7280" }}>
      <div style={{ fontWeight: 600 }}>{title}</div>
      {desc && <div style={{ marginTop: 6 }}>{desc}</div>}
    </div>
  );
}
