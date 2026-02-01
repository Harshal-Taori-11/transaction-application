export type Role = "ROLE_USER" | "ROLE_ADMIN";
export type AccountType = "BANK" | "UPI";
export type TxType = "BUY" | "SELL";
export type TxStatus = "PENDING" | "COMPLETED" | "REJECTED";

export interface AuthResponse {
  message: string;
  userId: number;
  token: string;
}

export interface UserProfileResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  token: number;
}

export interface BankAccountResponse {
  id: number;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: "BANK";
}

export interface UpiAccountResponse {
  id: number;
  upiId: string;
  accountType: "UPI";
}

export interface TransactionOutput {
  id: number;
  paymentId: string;
  amount: number;
  tokens: number;
  rate: number;
  type: TxType;
  status: TxStatus;
  createdAt: string;
  userId: number;
}
