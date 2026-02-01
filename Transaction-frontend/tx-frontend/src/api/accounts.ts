import client from "./client";
import type {
  AccountType,
  BankAccountResponse,
  UpiAccountResponse,
} from "./types";

export const addUpi = (userId: number, payload: { upiId: string }) =>
  client.post(`/api/accounts/upi/${userId}`, payload).then((r) => r.data);

export const addBank = (
  userId: number,
  payload: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
  }
) => client.post(`/api/accounts/bank/${userId}`, payload).then((r) => r.data);

export const deleteUpi = (upiId: number, userId: number) =>
  client.delete(`/api/accounts/upi/${upiId}/${userId}`).then((r) => r.data);

export const deleteBank = (bankId: number, userId: number) =>
  client.delete(`/api/accounts/bank/${bankId}/${userId}`).then((r) => r.data);

export const setPrimary = (
  userId: number,
  primaryId: number | string,
  accountType: AccountType
) =>
  client
    .put(`/api/accounts/set-primary/${userId}`, null, {
      params: { primaryId, accountType },
    })
    .then((r) => r.data);

export const getPrimary = (userId: number) =>
  client
    .get<{ id: number; accountType: AccountType } | null>(
      `/api/accounts/primary/${userId}`
    )
    .then((r) => r.data);

export const getBanks = (userId: number) =>
  client
    .get<BankAccountResponse[]>(`/api/accounts/banks/${userId}`)
    .then((r) => r.data);

export const getUpis = (userId: number) =>
  client
    .get<UpiAccountResponse[]>(`/api/accounts/upi/${userId}`)
    .then((r) => r.data);
