import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import UserLayout from "./pages/user/UserLayout";
import Home from "./pages/user/Home";
import Accounts from "./pages/user/Accounts";
import UserTransactions from "./pages/user/Transactions";
import Buy from "./pages/user/Buy";
import Sell from "./pages/user/Sell";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminTransactions from "./pages/admin/Transactions";
import Pending from "./pages/admin/Pending";
import { getAuth, hasRole, isAuthed } from "./store/authStore";

const Protected = ({ children }: { children: React.ReactElement }) => {
  const auth = getAuth();
  if (!auth || !auth.token || auth.exp * 1000 < Date.now()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const RoleRoute = ({
  role,
  children,
}: {
  role: "ROLE_USER" | "ROLE_ADMIN";
  children: React.ReactElement;
}) => {
  if (!isAuthed() || !hasRole(role)) return <Navigate to="/login" replace />;
  return children;
};

const router = createBrowserRouter([
  { path: "/", element: <Landing /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  {
    path: "/profile",
    element: (
      <Protected>
        <Profile />
      </Protected>
    ),
  },
  {
    path: "/app/user",
    element: (
      <Protected>
        <RoleRoute role="ROLE_USER">
          <UserLayout />
        </RoleRoute>
      </Protected>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: "home", element: <Home /> },
      { path: "accounts", element: <Accounts /> },
      { path: "transactions", element: <UserTransactions /> },
      { path: "buy", element: <Buy /> },
      { path: "sell", element: <Sell /> },
    ],
  },
  {
    path: "/app/admin",
    element: (
      <Protected>
        <RoleRoute role="ROLE_ADMIN">
          <AdminLayout />
        </RoleRoute>
      </Protected>
    ),
    children: [
      { index: true, element: <AdminTransactions /> },
      { path: "transactions", element: <AdminTransactions /> },
      { path: "pending", element: <Pending /> },
    ],
  },
]);
export default router;
