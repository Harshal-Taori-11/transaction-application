import { useEffect, useState } from "react";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { ADMIN_BANK } from "../../constants/bankDetails";
import { getRate } from "../../api/user";
import { buyTokens } from "../../api/transactions";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { isPositiveInt } from "../../utils/validators";
import { useUIStore } from "../../store/uiStore";

function Buy() {
  const [tokens, setTokens] = useState("");
  const [rate, setRate] = useState<number | undefined>(undefined);
  const [paymentId, setPaymentId] = useState(""); // new state
  const { userId } = useAuthStore();
  const nav = useNavigate();
  const { showToast } = useUIStore();

  useEffect(() => {
    getRate().then(setRate);
  }, []);

  const amount = rate && isPositiveInt(tokens) ? Number(tokens) * rate : 0;

  const submit = async () => {
    if (!rate || !isPositiveInt(tokens)) {
      showToast("Enter a valid positive integer for tokens", "error");
      return;
    }
    if (!paymentId.trim()) {
      showToast("Payment ID is required", "error");
      return;
    }
    await buyTokens(userId!, {
      amount: Number(amount.toFixed(2)),
      rate,
      paymentId: paymentId.trim(),
    });
    showToast("Buy request created", "success");
    nav("/app/user/transactions");
  };

  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 720 }}>
      <Card>
        <h3 style={{ marginTop: 0 }}>Admin Bank Details</h3>
        <div>{ADMIN_BANK.accountHolderName}</div>
        <div>{ADMIN_BANK.bankName}</div>
        <div>A/C: {ADMIN_BANK.accountNumber}</div>
        <div>IFSC: {ADMIN_BANK.ifscCode}</div>
        {ADMIN_BANK.note && (
          <div style={{ color: "#6B7280", marginTop: 8 }}>
            {ADMIN_BANK.note}
          </div>
        )}
      </Card>
      <Card>
        <h3 style={{ marginTop: 0 }}>Buy Tokens</h3>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <Input
            label="Current Rate"
            value={rate ? String(rate) : ""}
            onChange={() => {}}
          />
          <Input label="Tokens to buy" value={tokens} onChange={setTokens} />
          <Input
            label="Amount to pay"
            value={amount ? amount.toFixed(2) : ""}
            onChange={() => {}}
          />
          <Input
            label="Payment ID (bank reference)"
            value={paymentId}
            onChange={setPaymentId}
          />
        </div>
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <Button onClick={submit}>Done</Button>
          <Button variant="secondary" onClick={() => nav("/app/user/home")}>
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}
export default Buy;
