import { create } from "zustand";

type ToastType = "info" | "success" | "error";
type Toast = { id: number; message: string; type: ToastType };

export const useUIStore = create<{
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: number) => void;
}>((set, get) => ({
  toasts: [],
  showToast: (message, type = "info") => {
    const id = Date.now() + Math.random();
    set({ toasts: [...get().toasts, { id, message, type }] });
    setTimeout(() => get().removeToast(id), 4000);
  },
  removeToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));
