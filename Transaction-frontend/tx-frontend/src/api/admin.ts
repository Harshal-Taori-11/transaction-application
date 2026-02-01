import client from "./client";
import type { TransactionOutput } from "./types";

export const updateRate = (rate: number) =>
  client.put("/api/admin/rate", null, { params: { rate } }).then((r) => r.data);

export const getAllTransactions = () =>
  client
    .get<TransactionOutput[]>("/api/admin/transactions")
    .then((r) => r.data);

export const approveBuy = (id: number) =>
  client.put(`/api/admin/approveBuy/${id}`).then((r) => r.data);

export const approveSell = (id: number, paymentId: string) =>
  client
    .put(`/api/admin/approveSell/${id}`, null, { params: { paymentId } })
    .then((r) => r.data);

export const failTransaction = (id: number) =>
  client.put(`/api/admin/fail/${id}`).then((r) => r.data);
