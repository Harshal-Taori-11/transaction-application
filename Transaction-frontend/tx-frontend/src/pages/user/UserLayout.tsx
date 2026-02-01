import { Outlet, NavLink } from "react-router-dom";
import TopBar from "../../components/TopBar";

function UserLayout() {
  return (
    <div>
      <TopBar />
      <div className="container">
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <NavLink to="/app/user/home">Home</NavLink>
          <NavLink to="/app/user/accounts">Accounts</NavLink>
          <NavLink to="/app/user/transactions">Transactions</NavLink>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
export default UserLayout;
