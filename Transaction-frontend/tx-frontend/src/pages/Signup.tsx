import { useState } from "react";
import { isEmail, isPhone10 } from "../utils/validators";
import Input from "../components/Input";
import Button from "../components/Button";
import { signup } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { useUIStore } from "../store/uiStore";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { setAuth } = useAuthStore();
  const nav = useNavigate();
  const { showToast } = useUIStore();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !name.trim() ||
      !isEmail(email) ||
      !isPhone10(phone) ||
      password.length < 6
    ) {
      showToast(
        "Please provide valid name, email, phone, and password",
        "error"
      );
      return;
    }
    setLoading(true);
    try {
      const res = await signup({ name, email, phoneNumber: phone, password });
      setAuth(res.token, res.userId);
      showToast("Account created", "success");
      nav("/app/user/home");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "60px auto" }}>
      <h2>Sign up</h2>
      <form onSubmit={submit}>
        <Input label="Name" value={name} onChange={setName} />
        <Input label="Email" value={email} onChange={setEmail} />
        <Input label="Phone" value={phone} onChange={setPhone} />
        <Input
          label="Password"
          value={password}
          onChange={setPassword}
          type="password"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create account"}
        </Button>
      </form>
    </div>
  );
}
