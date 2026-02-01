import { useEffect } from "react";
import { initAuthFromStorage } from "./store/authStore";
import { Outlet } from "react-router-dom";

export default function App() {
  useEffect(() => {
    initAuthFromStorage();
  }, []);
  return <Outlet />;
}
