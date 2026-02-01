import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveBuy,
  approveSell,
  failTransaction,
  getAllTransactions,
} from "../../api/admin";
import Tabs from "../../components/Tabs";
import Pagination from "../../components/Pagination";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import EmptyState from "../../components/EmptyState";
import { useUIStore } from "../../store/uiStore";
import type { TransactionOutput } from "../../api/types";
import UserDetailsRow from "./components/UserDetailsRow";

function Pending() {
  const { data: txs = [] } = useQuery<TransactionOutput[]>({
    queryKey: ["adminTx"],
    queryFn: getAllTransactions,
  });

  const [typeTab, setTypeTab] = useState<"BUY" | "SELL">("BUY");
  const [page, setPage] = useState(1);
  const perPage = 20;
  const [sellModal, setSellModal] = useState<{
    open: boolean;
    id: number | null;
  }>({ open: false, id: null });
  const [paymentId, setPaymentId] = useState("");
  const [openRows, setOpenRows] = useState<Record<number, boolean>>({});
  const qc = useQueryClient();
  const { showToast } = useUIStore();

  const pending = useMemo(
    () => txs.filter((t) => t.status === "PENDING" && t.type === typeTab),
    [txs, typeTab]
  );

  const pageRows = pending.slice((page - 1) * perPage, page * perPage);

  const toggleRow = (id: number) => {
    setOpenRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const onApproveBuy = async (id: number) => {
    await approveBuy(id);
    await qc.invalidateQueries({ queryKey: ["adminTx"] });
    showToast("Transaction approved", "success");
  };

  const onApproveSell = async () => {
    if (!sellModal.id) return;
    await approveSell(sellModal.id, paymentId);
    setSellModal({ open: false, id: null });
    setPaymentId("");
    await qc.invalidateQueries({ queryKey: ["adminTx"] });
    showToast("Transaction approved", "success");
  };

  const onFail = async (id: number) => {
    await failTransaction(id);
    await qc.invalidateQueries({ queryKey: ["adminTx"] });
    showToast("Transaction marked failed", "success");
  };

  return (
    <div>
      <Tabs
        tabs={[
          { key: "BUY", label: "Buy" },
          { key: "SELL", label: "Sell" },
        ]}
        value={typeTab}
        onChange={(k) => {
          setTypeTab(k as "BUY" | "SELL");
          setPage(1);
        }}
      />

      {pending.length === 0 ? (
        <EmptyState title="No pending transactions" />
      ) : (
        <>
          <div className="table-wrap">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: 10,
                      borderBottom: "1px solid #E5E7EB",
                      color: "#6B7280",
                    }}
                  >
                    Payment ID
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: 10,
                      borderBottom: "1px solid #E5E7EB",
                      color: "#6B7280",
                    }}
                  >
                    Tokens
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: 10,
                      borderBottom: "1px solid #E5E7EB",
                      color: "#6B7280",
                    }}
                  >
                    Amount
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: 10,
                      borderBottom: "1px solid #E5E7EB",
                      color: "#6B7280",
                    }}
                  >
                    Rate
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: 10,
                      borderBottom: "1px solid #E5E7EB",
                      color: "#6B7280",
                    }}
                  >
                    Actions
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: 10,
                      borderBottom: "1px solid #E5E7EB",
                      color: "#6B7280",
                    }}
                  >
                    User details
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((t) => (
                  <>
                    <tr key={t.id}>
                      <td
                        style={{
                          padding: 10,
                          borderBottom: "1px solid #F3F4F6",
                        }}
                      >
                        {t.paymentId || "—"}
                      </td>
                      <td
                        style={{
                          padding: 10,
                          borderBottom: "1px solid #F3F4F6",
                        }}
                      >
                        {String(t.tokens)}
                      </td>
                      <td
                        style={{
                          padding: 10,
                          borderBottom: "1px solid #F3F4F6",
                        }}
                      >
                        {t.amount.toFixed(2)}
                      </td>
                      <td
                        style={{
                          padding: 10,
                          borderBottom: "1px solid #F3F4F6",
                        }}
                      >
                        {String(t.rate)}
                      </td>
                      <td
                        style={{
                          padding: 10,
                          borderBottom: "1px solid #F3F4F6",
                        }}
                      >
                        <div style={{ display: "flex", gap: 8 }}>
                          {t.type === "BUY" ? (
                            <Button onClick={() => onApproveBuy(t.id)}>
                              Approve
                            </Button>
                          ) : (
                            <Button
                              onClick={() =>
                                setSellModal({ open: true, id: t.id })
                              }
                            >
                              Approve
                            </Button>
                          )}
                          <Button variant="danger" onClick={() => onFail(t.id)}>
                            Fail
                          </Button>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: 10,
                          borderBottom: "1px solid #F3F4F6",
                        }}
                      >
                        <button
                          onClick={() => toggleRow(t.id)}
                          style={{
                            border: "none",
                            background: "transparent",
                            color: "#1F4B99",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                          aria-expanded={openRows[t.id] ? "true" : "false"}
                          aria-controls={`user-details-${t.id}`}
                        >
                          {openRows[t.id] ? "▼ Hide details" : "▼ User details"}
                        </button>
                      </td>
                    </tr>
                    {openRows[t.id] && (
                      <tr key={`${t.id}-details`}>
                        <td
                          id={`user-details-${t.id}`}
                          colSpan={6}
                          style={{
                            padding: "10px 10px",
                            background: "#FAFAFA",
                            borderBottom: "1px solid #F3F4F6",
                          }}
                        >
                          <UserDetailsRow
                            userId={t.userId as unknown as number}
                          />
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            total={pending.length}
            perPage={perPage}
            onChange={setPage}
          />
        </>
      )}

      <Modal
        open={sellModal.open}
        onClose={() => setSellModal({ open: false, id: null })}
        title="Enter Payment ID"
      >
        <Input
          label="Payment ID (bank reference)"
          value={paymentId}
          onChange={setPaymentId}
        />
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button
            variant="secondary"
            onClick={() => setSellModal({ open: false, id: null })}
          >
            Cancel
          </Button>
          <Button onClick={onApproveSell}>Approve</Button>
        </div>
      </Modal>
    </div>
  );
}
export default Pending;
