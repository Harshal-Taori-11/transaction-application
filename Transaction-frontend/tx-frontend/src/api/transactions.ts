import client from "./client";
import type { TransactionOutput } from "./types";

export const buyTokens = (
  userId: number,
  payload: { amount: number; rate: number; paymentId: string }
) =>
  client.post(`/api/transactions/buy/${userId}`, payload).then((r) => r.data);

export const sellTokens = (userId: number, payload: { tokens: number }) =>
  client.post(`/api/transactions/sell/${userId}`, payload).then((r) => r.data);

export const getUserTransactions = (userId: number) =>
  client
    .get<TransactionOutput[]>(`/api/transactions/user/${userId}`)
    .then((r) => r.data);
