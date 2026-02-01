import { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import { login } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { useUIStore } from "../store/uiStore";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const nav = useNavigate();
  const { showToast } = useUIStore();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone) || !password) {
      showToast("Enter valid phone and password", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await login({ phoneNumber: phone, password });
      setAuth(res.token, res.userId);
      const { role } = useAuthStore.getState();
      showToast("Welcome back!", "success");
      if (role === "ROLE_ADMIN")
        nav("/app/admin/transactions", { replace: true });
      else nav("/app/user/home", { replace: true });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{ maxWidth: 420, margin: "80px auto" }}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <Input
          label="Phone number"
          value={phone}
          onChange={setPhone}
          placeholder="10-digit phone"
        />
        <Input
          label="Password"
          value={password}
          onChange={setPassword}
          type="password"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </div>
  );
}
