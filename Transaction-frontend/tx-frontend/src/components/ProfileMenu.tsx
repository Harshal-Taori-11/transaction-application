import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const { clear } = useAuthStore();
  const nav = useNavigate();
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          border: "none",
          background: "transparent",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Profile ▾
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "100%",
            background: "white",
            border: "1px solid #E5E7EB",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <button
            onClick={() => {
              setOpen(false);
              nav("/profile");
            }}
            style={{
              display: "block",
              padding: "8px 12px",
              width: 160,
              border: "none",
              background: "white",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            Profile
          </button>
          <button
            onClick={() => {
              clear();
              nav("/");
            }}
            style={{
              display: "block",
              padding: "8px 12px",
              width: 160,
              border: "none",
              background: "white",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
