import client from "./client";
import type { AuthResponse } from "./types";

export const signup = (data: {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
}) => client.post<AuthResponse>("/auth/signup", data).then((r) => r.data);

export const login = (data: { phoneNumber: string; password: string }) =>
  client.post<AuthResponse>("/auth/login", data).then((r) => r.data);
