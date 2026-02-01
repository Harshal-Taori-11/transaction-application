import { Outlet, NavLink } from "react-router-dom";
import TopBar from "../../components/TopBar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getRate } from "../../api/user";
import { updateRate } from "../../api/admin";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { useUIStore } from "../../store/uiStore";
import React from "react";

function AdminLayout() {
  const { data: rate } = useQuery({ queryKey: ["rate"], queryFn: getRate });
  const qc = useQueryClient();
  const { showToast } = useUIStore();
  const [r, setR] = React.useState(rate ? String(rate) : "");
  React.useEffect(() => {
    if (rate !== undefined) setR(String(rate));
  }, [rate]);

  const save = async () => {
    const n = Number(r);
    if (isNaN(n) || n <= 0) {
      showToast("Enter valid rate", "error");
      return;
    }
    await updateRate(n);
    await qc.invalidateQueries({ queryKey: ["rate"] });
    showToast("Rate updated", "success");
  };

  return (
    <div>
      <TopBar />
      <div className="container">
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "flex-end",
            marginBottom: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ minWidth: 220, flex: "1 1 220px" }}>
            <Input label="Current token rate" value={r} onChange={setR} />
          </div>
          <Button onClick={save}>Update rate</Button>
        </div>
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <NavLink to="/app/admin/transactions">Transactions</NavLink>
          <NavLink to="/app/admin/pending">Pending</NavLink>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
export default AdminLayout;
