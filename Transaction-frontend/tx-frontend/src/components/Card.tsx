export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #E5E7EB",
        borderRadius: 10,
        padding: 16,
      }}
    >
      {children}
    </div>
  );
}
