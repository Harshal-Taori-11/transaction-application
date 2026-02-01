import axios from "axios";
import { useAuthStore, logoutSilently } from "../store/authStore";
import { useUIStore } from "../store/uiStore";

const client = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 15000,
});

client.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (error) => {
    const { showToast } = useUIStore.getState();
    const status = error?.response?.status;
    const message =
      error?.response?.data?.message ||
      error?.response?.data ||
      "Something went wrong";
    if (status === 401) {
      logoutSilently();
      showToast("Session expired. Please login again.", "error");
    } else {
      showToast(String(message), "error");
    }
    return Promise.reject(error);
  }
);

export default client;
