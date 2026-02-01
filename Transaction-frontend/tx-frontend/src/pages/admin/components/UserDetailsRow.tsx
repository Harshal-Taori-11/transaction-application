import { useEffect, useMemo, useState } from "react";
import { getProfile } from "../../../api/user";
import { getPrimary, getBanks, getUpis } from "../../../api/accounts";
import type {
  AccountType,
  BankAccountResponse,
  UpiAccountResponse,
} from "../../../api/types";

type PrimaryDetail =
  | ({ accountType: "BANK" } & BankAccountResponse)
  | ({ accountType: "UPI" } & UpiAccountResponse);

export default function UserDetailsRow({ userId }: { userId: number }) {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [primary, setPrimary] = useState<{
    id: number;
    accountType: AccountType;
  } | null>(null);
  const [primaryDetail, setPrimaryDetail] = useState<PrimaryDetail | null>(
    null
  );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [p, pa] = await Promise.all([
          getProfile(userId),
          getPrimary(userId),
        ]);
        if (!active) return;
        setName(p.name || "");
        setEmail(p.email || "");
        setPrimary(pa ?? null);

        if (pa && pa.id && pa.accountType) {
          if (pa.accountType === "BANK") {
            const banks = await getBanks(userId);
            if (!active) return;
            const b = (banks || []).find((bk) => bk.id === pa.id);
            setPrimaryDetail(
              b ? ({ accountType: "BANK", ...b } as PrimaryDetail) : null
            );
          } else if (pa.accountType === "UPI") {
            const upis = await getUpis(userId);
            if (!active) return;
            const u = (upis || []).find((up) => up.id === pa.id);
            setPrimaryDetail(
              u ? ({ accountType: "UPI", ...u } as PrimaryDetail) : null
            );
          }
        } else {
          setPrimaryDetail(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [userId]);

  const accountBlock = useMemo(() => {
    if (!primary || !primaryDetail) {
      return <div style={{ color: "#6B7280" }}>—</div>;
    }

    if (primaryDetail.accountType === "UPI") {
      // Single line: label/value; wraps to its own line on small widths naturally
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            columnGap: 8,
            rowGap: 4,
            alignItems: "center",
          }}
        >
          <b>UPI ID:-</b>
          <span>{primaryDetail.upiId}</span>
        </div>
      );
    }

    // BANK:
    // Desktop (>=768px): one-line, equally spaced label/value pairs
    // Mobile (<768px): gracefully stacks into 3 rows (each row is label + value)
    return (
      <div>
        {/* Desktop: single line */}
        <div
          style={{
            display: "none",
            gridTemplateColumns: "auto 1fr auto 1fr auto 1fr",
            columnGap: 12,
            rowGap: 6,
            alignItems: "center",
          }}
          className="bank-inline"
        >
          <b>Account number:-</b>
          <span>{primaryDetail.accountNumber}</span>
          <b>IFSC code:-</b>
          <span>{primaryDetail.ifscCode}</span>
          <b>Account holder name:-</b>
          <span>{primaryDetail.accountHolderName}</span>
        </div>

        {/* Mobile fallback: 3 rows */}
        <div
          className="bank-stacked"
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            columnGap: 8,
            rowGap: 6,
            alignItems: "center",
          }}
        >
          <b>Account number:-</b>
          <span>{primaryDetail.accountNumber}</span>
          <b>IFSC code:-</b>
          <span>{primaryDetail.ifscCode}</span>
          <b>Account holder name:-</b>
          <span>{primaryDetail.accountHolderName}</span>
        </div>

        <style>
          {`
            @media (min-width: 768px) {
              .bank-inline { display: grid !important; }
              .bank-stacked { display: none !important; }
            }
          `}
        </style>
      </div>
    );
  }, [primary, primaryDetail]);

  if (loading) {
    return (
      <div style={{ padding: "8px 0", color: "#6B7280" }}>
        Loading user details...
      </div>
    );
  }

  return (
    <div style={{ padding: "8px 0", color: "#111827" }}>
      <div style={{ marginBottom: 8 }}>
        <b>Username and email:-</b>{" "}
        <span style={{ marginLeft: 6 }}>
          {name || "—"}
          {email ? ` (${email})` : ""}
        </span>
      </div>

      <div style={{ marginBottom: 6 }}>
        <b>Primary account details:-</b>
      </div>

      {accountBlock}
    </div>
  );
}
