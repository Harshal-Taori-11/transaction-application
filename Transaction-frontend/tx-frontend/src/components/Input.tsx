export default function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  size = "md", // 'sm' | 'md'
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  size?: "sm" | "md";
}) {
  const height = size === "sm" ? 36 : 40;
  const padV = size === "sm" ? 8 : 10;
  const fontSize = size === "sm" ? 14 : 15;

  return (
    <label style={{ display: "block", marginBottom: 10 }}>
      <div style={{ marginBottom: 6, fontSize: 13, color: "#374151" }}>
        {label}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        required={required}
        style={{
          width: "100%",
          height,
          padding: `${padV}px 12px`,
          borderRadius: 8,
          border: "1px solid #E5E7EB",
          fontSize,
          lineHeight: 1.3,
          background: "white",
        }}
      />
    </label>
  );
}
