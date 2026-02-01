import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { APP_NAME, SLOGAN } from "../constants/app";

export default function Landing() {
  const nav = useNavigate();
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#F9FAFB",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ marginBottom: 8 }}>{APP_NAME}</h1>
        <p style={{ marginBottom: 24, color: "#6B7280" }}>{SLOGAN}</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Button onClick={() => nav("/login")}>Login</Button>
          <Button variant="secondary" onClick={() => nav("/signup")}>
            Sign up
          </Button>
        </div>
      </div>
    </div>
  );
}
