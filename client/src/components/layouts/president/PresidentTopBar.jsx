
import { Bell, Menu, UserCircle } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import "./PresidentTopBar.css";

const PresidentTopBar = ({
  title = "Dashboard",
  subtitle = "Welcome to your ACSP-Kenya President Portal.",
  onMenuToggle,
}) => {
  const { user } = useAuth();

  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    "County President";

  const firstName = fullName.split(" ")[0];

  return (
    <header className="president-topbar">
      <div className="president-topbar-left">
        <button
          type="button"
          className="president-mobile-menu"
          onClick={onMenuToggle}
          aria-label="Toggle navigation"
        >
          <Menu size={23} />
        </button>

        <div className="president-page-heading">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="president-topbar-actions">
        <button
          type="button"
          className="president-notification-button"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={21} />
          <span className="president-notification-dot" />
        </button>

        <div className="president-topbar-divider" />

        <div className="president-user-profile">
          <div className="president-user-avatar">
            <UserCircle size={27} />
          </div>

          <div className="president-user-details">
            <strong>{fullName}</strong>
            <span>{firstName}'s Account</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PresidentTopBar;
