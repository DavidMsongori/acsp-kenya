
import { Bell, Menu, UserCircle } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import "./WorkstationTopBar.css";

const WorkstationTopBar = ({
  title = "My WorkStation",
  subtitle = "Your ACSP-Kenya national leadership workspace.",
  onMenuToggle,
}) => {
  const { user } = useAuth();

  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    "NEC Member";

  return (
    <header className="workstation-topbar">
      <div className="workstation-topbar-left">
        <button
          type="button"
          className="workstation-mobile-menu"
          onClick={onMenuToggle}
          aria-label="Toggle navigation"
        >
          <Menu size={23} />
        </button>

        <div className="workstation-page-heading">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="workstation-topbar-actions">
        <button
          type="button"
          className="workstation-notification-button"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={21} />
          <span className="workstation-notification-dot" />
        </button>

        <div className="workstation-topbar-divider" />

        <div className="workstation-user-profile">
          <div className="workstation-user-avatar">
            <UserCircle size={27} />
          </div>

          <div className="workstation-user-details">
            <strong>{fullName}</strong>
            <span>National Executive Member</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default WorkstationTopBar;
