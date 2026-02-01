import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserTransactions } from "../../api/transactions";
import { useAuthStore } from "../../store/authStore";
import Tabs from "../../components/Tabs";
import Table from "../../components/Table";
import Pagination from "../../components/Pagination";
import { mapStatus } from "../../utils/format";
import { formatIST } from "../../utils/time";
import EmptyState from "../../components/EmptyState";
import type { TransactionOutput } from "../../api/types";

function UserTransactions() {
  const { userId } = useAuthStore();
  const { data: txs = [] } = useQuery<TransactionOutput[]>({
    queryKey: ["userTx", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) throw new Error("Missing user id");
      return getUserTransactions(userId);
    },
  });

  const [statusTab, setStatusTab] = useState<
    "Successful" | "Pending" | "Failed"
  >("Pending");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = useMemo(() => {
    return txs.filter((t) => {
      const mapped = mapStatus(t.status as any);
      return mapped === statusTab;
    });
  }, [txs, statusTab]);

  const pageRows = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      <Tabs
        tabs={[
          { key: "Pending", label: "Pending" },
          { key: "Successful", label: "Successful" },
          { key: "Failed", label: "Failed" },
        ]}
        value={statusTab}
        onChange={(k) => {
          setStatusTab(k as "Successful" | "Pending" | "Failed");
          setPage(1);
        }}
      />

      {filtered.length === 0 ? (
        <EmptyState title="No transactions" />
      ) : (
        <>
          <Table
            headers={[
              "Payment ID",
              "Type",
              "Status",
              "Tokens",
              "Amount",
              "Rate",
              "Created at",
            ]}
            rows={pageRows.map((t) => [
              t.paymentId || "—",
              t.type,
              mapStatus(t.status),
              String(t.tokens),
              t.amount.toFixed(2),
              String(t.rate),
              formatIST(t.createdAt),
            ])}
          />
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
export default UserTransactions;
