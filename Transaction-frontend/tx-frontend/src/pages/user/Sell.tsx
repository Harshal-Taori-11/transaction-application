import { useEffect, useState } from "react";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { getTokens } from "../../api/user";
import { sellTokens } from "../../api/transactions";
import { getPrimary } from "../../api/accounts";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { isPositiveInt } from "../../utils/validators";
import { useUIStore } from "../../store/uiStore";

export default function Sell() {
  const [tokens, setTokens] = useState("");
  const [balance, setBalance] = useState<number>(0);
  const [hasPrimary, setHasPrimary] = useState(false);
  const { userId } = useAuthStore();
  const nav = useNavigate();
  const { showToast } = useUIStore();

  useEffect(() => {
    if (!userId) return;
    getTokens(userId).then(setBalance);
    getPrimary(userId).then((p) => setHasPrimary(Boolean(p && (p as any).id)));
  }, [userId]);

  const submit = async () => {
    if (!isPositiveInt(tokens)) {
      showToast("Enter a valid positive integer for tokens", "error");
      return;
    }
    if (Number(tokens) > balance) {
      showToast("Cannot sell more tokens than balance", "error");
      return;
    }
    if (!hasPrimary) {
      showToast("Set a primary account before selling", "error");
      return;
    }
    await sellTokens(userId!, { tokens: Number(tokens) });
    showToast("Sell request created", "success");
    nav("/app/user/transactions");
  };

  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 720 }}>
      <Card>
        <h3 style={{ marginTop: 0 }}>Sell Tokens</h3>
        <div style={{ color: "#6B7280", marginBottom: 8 }}>
          Balance: {balance}
        </div>
        <Input label="Tokens to sell" value={tokens} onChange={setTokens} />
        <div style={{ display: "flex", gap: 8 }}>
          <Button onClick={submit}>Done</Button>
          <Button variant="secondary" onClick={() => nav("/app/user/home")}>
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}
