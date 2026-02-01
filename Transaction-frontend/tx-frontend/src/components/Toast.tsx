import { useUIStore } from "../store/uiStore";
import { colors } from "../constants/theme";

export default function Toast() {
  const { toasts, removeToast } = useUIStore();
  if (!toasts.length) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        zIndex: 100,
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => removeToast(t.id)}
          style={{
            background:
              t.type === "error"
                ? colors.danger
                : t.type === "success"
                ? colors.success
                : colors.primary,
            color: "white",
            padding: "10px 14px",
            borderRadius: 8,
            cursor: "pointer",
            minWidth: 260,
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
