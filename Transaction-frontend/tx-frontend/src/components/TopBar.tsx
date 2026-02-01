import { APP_NAME } from "../constants/app";
import ProfileMenu from "./ProfileMenu";
import { colors } from "../constants/theme";

export default function TopBar() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 12px",
        background: "white",
        borderBottom: `1px solid ${colors.border}`,
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div
        style={{ fontWeight: 800, color: colors.primary, userSelect: "none" }}
      >
        {APP_NAME}
      </div>
      <ProfileMenu />
    </div>
  );
}
