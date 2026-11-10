
import { Menu, UserCircle } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

import "./MemberTopBar.css";

const MemberTopBar = ({
  title = "Overview",
  subtitle = "Welcome to your ACSP-Kenya Individual Member Portal.",
  onMenuToggle,
}) => {
  const { user } = useAuth();

  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    "Individual Member";

  const firstName = fullName.split(" ")[0];

  return (
    <header className="member-topbar">
      <div className="member-topbar-left">
        <button
          type="button"
          className="member-mobile-menu"
          onClick={onMenuToggle}
          aria-label="Toggle navigation"
        >
          <Menu size={23} />
        </button>

        <div className="member-page-heading">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="member-topbar-actions">
        <div className="member-user-profile">
          <div className="member-user-avatar">
            <UserCircle size={27} />
          </div>

          <div className="member-user-details">
            <strong>{fullName}</strong>
            <span>{firstName}'s Account</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MemberTopBar;
