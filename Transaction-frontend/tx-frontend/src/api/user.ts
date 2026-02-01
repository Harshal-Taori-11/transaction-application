import client from "./client";
import type { UserProfileResponse } from "./types";

export const getTokens = (userId: number) =>
  client.get<number>(`/api/user/${userId}/tokens`).then((r) => r.data);

export const getRate = () =>
  client.get<number>("/api/user/rate").then((r) => r.data);

export const getProfile = (userId: number) =>
  client
    .get<UserProfileResponse>("/api/user/profile", { params: { userId } })
    .then((r) => r.data);

export const updateProfile = (
  userId: number,
  data: { name?: string; email?: string }
) =>
  client
    .patch<UserProfileResponse>("/api/user/profile", data, {
      params: { userId },
    })
    .then((r) => r.data);
