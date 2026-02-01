export default function Tabs({
  tabs,
  value,
  onChange,
}: {
  tabs: { key: string; label: string }[];
  value: string;
  onChange: (k: string) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        borderBottom: "1px solid #E5E7EB",
        marginBottom: 16,
        flexWrap: "wrap",
      }}
    >
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          style={{
            padding: "8px 12px",
            border: "none",
            borderBottom:
              value === t.key ? "3px solid #1F4B99" : "3px solid transparent",
            background: "transparent",
            cursor: "pointer",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
