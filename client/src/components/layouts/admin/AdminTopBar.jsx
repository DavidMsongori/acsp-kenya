
import { Bell, Menu, UserCircle } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import "./AdminTopBar.css";

const AdminTopBar = ({
  title = "Admin Dashboard",
  subtitle = "Manage the ACSP-Kenya national platform.",
  onMenuToggle,
}) => {
  const { user } = useAuth();

  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    "Administrator";

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-left">
        <button
          type="button"
          className="admin-mobile-menu"
          onClick={onMenuToggle}
          aria-label="Toggle navigation"
        >
          <Menu size={23} />
        </button>

        <div className="admin-page-heading">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="admin-topbar-actions">
        <button
          type="button"
          className="admin-notification-button"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={21} />
          <span className="admin-notification-dot" />
        </button>

        <div className="admin-topbar-divider" />

        <div className="admin-user-profile">
          <div className="admin-user-avatar">
            <UserCircle size={27} />
          </div>

          <div className="admin-user-details">
            <strong>{fullName}</strong>
            <span>Platform Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminTopBar;
