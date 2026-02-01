import { useQuery } from "@tanstack/react-query";
import { getTokens, getRate } from "../../api/user";
import { useAuthStore } from "../../store/authStore";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";

function Home() {
  const { userId } = useAuthStore();
  const nav = useNavigate();

  const { data: tokens } = useQuery<number>({
    queryKey: ["tokens", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) throw new Error("Missing user id");
      return getTokens(userId);
    },
  });

  const { data: rate } = useQuery<number>({
    queryKey: ["rate"],
    queryFn: getRate,
  });

  return (
    <div className="section">
      <div className="grid-2">
        <Card>
          <div style={{ fontSize: 14, color: "#6B7280" }}>Your Tokens</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            {tokens !== undefined ? String(tokens) : "—"}
          </div>
        </Card>
        <Card>
          <div style={{ fontSize: 14, color: "#6B7280" }}>
            Current Token Rate
          </div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            {rate !== undefined ? String(rate) : "—"}
          </div>
        </Card>
      </div>
      <div className="row" style={{ marginTop: 12 }}>
        <Button onClick={() => nav("/app/user/buy")}>Buy Tokens</Button>
        <Button variant="secondary" onClick={() => nav("/app/user/sell")}>
          Sell Tokens
        </Button>
      </div>
    </div>
  );
}
export default Home;
