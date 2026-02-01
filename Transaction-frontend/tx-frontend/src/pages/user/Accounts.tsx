import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addBank,
  addUpi,
  deleteBank,
  deleteUpi,
  getBanks,
  getPrimary,
  getUpis,
  setPrimary,
} from "../../api/accounts";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import { useAuthStore } from "../../store/authStore";
import { basicSanitize } from "../../utils/sanitize";
import type {
  AccountType,
  BankAccountResponse,
  UpiAccountResponse,
} from "../../api/types";
import EmptyState from "../../components/EmptyState";

type BankItem = BankAccountResponse & { type: AccountType };
type UpiItem = UpiAccountResponse & { type: AccountType };
type Item = BankItem | UpiItem;

function Accounts() {
  const { userId } = useAuthStore();
  const qc = useQueryClient();

  const banksQ = useQuery({
    queryKey: ["banks", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) throw new Error("Missing user id");
      return getBanks(userId);
    },
  });

  const upisQ = useQuery({
    queryKey: ["upis", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) throw new Error("Missing user id");
      return getUpis(userId);
    },
  });

  const primaryQ = useQuery({
    queryKey: ["primary", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) throw new Error("Missing user id");
      return getPrimary(userId);
    },
  });

  const [showAddBank, setShowAddBank] = useState(false);
  const [showAddUpi, setShowAddUpi] = useState(false);

  const items: Item[] = useMemo(() => {
    const b: BankItem[] = (banksQ.data ?? []).map((a) => ({
      ...a,
      type: "BANK" as AccountType,
    }));
    const u: UpiItem[] = (upisQ.data ?? []).map((a) => ({
      ...a,
      type: "UPI" as AccountType,
    }));
    return [...b, ...u];
  }, [banksQ.data, upisQ.data]);

  const totalCount = items.length;
  const primaryId = (primaryQ.data as any)?.id;
  const primaryType = (primaryQ.data as any)?.accountType as
    | AccountType
    | undefined;

  const onSetPrimary = async (id: number, type: AccountType) => {
    await setPrimary(userId!, id, type);
    await qc.invalidateQueries({ queryKey: ["primary", userId] });
  };

  const onDelete = async (item: Item) => {
    if (totalCount <= 1) return;
    if (item.type === "BANK") await deleteBank(item.id, userId!);
    else await deleteUpi(item.id, userId!);
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["banks", userId] }),
      qc.invalidateQueries({ queryKey: ["upis", userId] }),
      qc.invalidateQueries({ queryKey: ["primary", userId] }),
    ]);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <Button onClick={() => setShowAddUpi(true)}>Add UPI</Button>
        <Button variant="secondary" onClick={() => setShowAddBank(true)}>
          Add Bank
        </Button>
      </div>

      <Card>
        {items.length === 0 ? (
          <EmptyState
            title="No accounts yet"
            desc="Add a UPI or bank account to get started."
          />
        ) : (
          <div>
            {items.map((it) => (
              <div
                key={`${it.type}-${it.id}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: "1px solid #F3F4F6",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>
                    {it.type === "BANK"
                      ? (it as BankItem).accountHolderName
                      : (it as UpiItem).upiId}
                  </div>
                  <div style={{ color: "#6B7280", fontSize: 13 }}>
                    {it.type === "BANK"
                      ? `A/C ${(it as BankItem).accountNumber} -  IFSC ${
                          (it as BankItem).ifscCode
                        }`
                      : "UPI"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {primaryId === it.id && primaryType === it.type ? (
                    <span
                      style={{
                        fontSize: 12,
                        padding: "2px 8px",
                        border: "1px solid #E5E7EB",
                        borderRadius: 16,
                      }}
                    >
                      Primary
                    </span>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() => onSetPrimary(it.id, it.type)}
                    >
                      Set Primary
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    disabled={totalCount <= 1}
                    onClick={() => onDelete(it)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <AddUpiModal
        open={showAddUpi}
        onClose={() => setShowAddUpi(false)}
        userId={userId!}
      />
      <AddBankModal
        open={showAddBank}
        onClose={() => setShowAddBank(false)}
        userId={userId!}
      />
    </div>
  );
}

function AddUpiModal({
  open,
  onClose,
  userId,
}: {
  open: boolean;
  onClose: () => void;
  userId: number;
}) {
  const [upi, setUpi] = useState("");
  const qc = useQueryClient();
  const save = async () => {
    const v = basicSanitize(upi);
    if (!v) return onClose();
    await addUpi(userId, { upiId: v });
    await qc.invalidateQueries({ queryKey: ["upis", userId] });
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title="Add UPI">
      <Input label="UPI ID" value={upi} onChange={setUpi} />
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={save}>Save</Button>
      </div>
    </Modal>
  );
}

function AddBankModal({
  open,
  onClose,
  userId,
}: {
  open: boolean;
  onClose: () => void;
  userId: number;
}) {
  const [name, setName] = useState("");
  const [acc, setAcc] = useState("");
  const [ifsc, setIfsc] = useState("");
  const qc = useQueryClient();
  const save = async () => {
    const payload = {
      accountHolderName: basicSanitize(name),
      accountNumber: basicSanitize(acc),
      ifscCode: basicSanitize(ifsc),
    };
    if (
      !payload.accountHolderName ||
      !payload.accountNumber ||
      !payload.ifscCode
    )
      return onClose();
    await addBank(userId, payload);
    await qc.invalidateQueries({ queryKey: ["banks", userId] });
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title="Add Bank">
      <Input label="Account holder name" value={name} onChange={setName} />
      <Input label="Account number" value={acc} onChange={setAcc} />
      <Input label="IFSC" value={ifsc} onChange={setIfsc} />
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={save}>Save</Button>
      </div>
    </Modal>
  );
}
export default Accounts;
