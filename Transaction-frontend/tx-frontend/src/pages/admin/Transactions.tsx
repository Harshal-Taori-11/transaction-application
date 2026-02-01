import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllTransactions } from "../../api/admin";
import Tabs from "../../components/Tabs";
import Pagination from "../../components/Pagination";
import { mapStatus } from "../../utils/format";
import { formatIST } from "../../utils/time";
import EmptyState from "../../components/EmptyState";
import type { TransactionOutput } from "../../api/types";
import UserDetailsRow from "./components/UserDetailsRow";

function AdminTransactions() {
  const { data: txs = [] } = useQuery<TransactionOutput[]>({
    queryKey: ["adminTx"],
    queryFn: getAllTransactions,
  });
  const [typeTab, setTypeTab] = useState<"BUY" | "SELL">("BUY");
  const [page, setPage] = useState(1);
  const [openRows, setOpenRows] = useState<Record<number, boolean>>({});
  const perPage = 20;

  const filtered = useMemo(() => {
    return txs.filter(
      (t) =>
        t.type === typeTab &&
        (t.status === "COMPLETED" || t.status === "REJECTED")
    );
  }, [txs, typeTab]);

  const pageRows = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleRow = (id: number) => {
    setOpenRows((prev) => ({ ...prev, [id]: !prev[id] }));
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
          setTypeTab(k as any);
          setPage(1);
        }}
      />
      {filtered.length === 0 ? (
        <EmptyState title="No transactions" />
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
                    Status
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
                    Created at
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
                        {mapStatus(t.status)}
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
                        {formatIST(t.createdAt)}
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
                          colSpan={7}
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
            total={filtered.length}
            perPage={perPage}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}
export default AdminTransactions;
