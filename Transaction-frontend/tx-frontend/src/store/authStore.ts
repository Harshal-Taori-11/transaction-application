import { create } from "zustand";
import { decodeJwt } from "../utils/jwt";
import type { Role } from "../api/types";

type AuthState = {
  token: string | null;
  userId: number | null;
  role: Role | null;
  exp: number;
  setAuth: (token: string, userId: number) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userId: null,
  role: null,
  exp: 0,
  setAuth: (token, userId) => {
    const payload = decodeJwt(token);
    const roles = Array.isArray(payload?.role) ? payload.role : [];
    const role = (roles && roles.length ? roles[0] : null) as Role | null;
    const exp = payload?.exp || Math.floor(Date.now() / 1000) + 3600;
    const auth = { token, userId, role, exp };
    localStorage.setItem("auth", JSON.stringify(auth));
    set(auth);
  },
  clear: () => {
    localStorage.removeItem("auth");
    set({ token: null, userId: null, role: null, exp: 0 });
  },
}));

export const initAuthFromStorage = () => {
  const raw = localStorage.getItem("auth");
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.exp * 1000 < Date.now()) {
      localStorage.removeItem("auth");
      return;
    }
    useAuthStore.setState(parsed);
  } catch (err) {
    console.warn("Failed to parse auth from storage, clearing it.", err);
    localStorage.removeItem("auth");
  }
};

export const logoutSilently = () => useAuthStore.getState().clear();
export const getAuth = () => useAuthStore.getState();
export const isAuthed = () => {
  const { token, exp } = useAuthStore.getState();
  return Boolean(token && exp * 1000 > Date.now());
};
export const hasRole = (role: Role) => useAuthStore.getState().role === role;
