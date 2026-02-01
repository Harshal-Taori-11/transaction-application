import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../api/user";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";
import { useAuthStore } from "../store/authStore";
import { useUIStore } from "../store/uiStore";
import { isEmail } from "../utils/validators";
import { useNavigate } from "react-router-dom";

function Profile() {
  const { userId } = useAuthStore();
  const { showToast } = useUIStore();
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState(0);

  useEffect(() => {
    (async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const p = await getProfile(userId);
        setName(p.name);
        setEmail(p.email);
        setPhone(p.phone);
        setToken(p.token || 0);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const save = async () => {
    if (!isEmail(email) || !name.trim()) {
      showToast("Enter valid name and email", "error");
      return;
    }
    if (!userId) return;
    await updateProfile(userId, { name, email });
    showToast("Profile updated", "success");
  };

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  return (
    <div className="section" style={{ maxWidth: 600, margin: "24px auto" }}>
      <div style={{ marginBottom: 12 }}>
        <button
          onClick={() => nav(-1)}
          style={{
            background: "transparent",
            border: "none",
            color: "#1F4B99",
            fontWeight: 600,
            cursor: "pointer",
            padding: 0,
          }}
        >
          ← Back
        </button>
      </div>
      <Card>
        <h3 style={{ marginTop: 0 }}>Profile</h3>
        <div className="grid-2">
          <Input label="Name" value={name} onChange={setName} size="sm" />
          <Input label="Email" value={email} onChange={setEmail} size="sm" />
          <Input label="Phone" value={phone} onChange={() => {}} size="sm" />
          <Input
            label="Token Balance"
            value={String(token)}
            onChange={() => {}}
            size="sm"
          />
        </div>
        <div className="row" style={{ marginTop: 12, flexWrap: "wrap" }}>
          <Button onClick={save}>Save changes</Button>
          <Button variant="secondary" onClick={() => nav(-1)}>
            Go back
          </Button>
        </div>
      </Card>
    </div>
  );
}
export default Profile;
