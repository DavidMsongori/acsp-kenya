
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";

import {
  LayoutDashboard,
  FileText,
  CalendarDays,
  BookOpen,
  UserRound,
  Settings,
  LogOut,
  ChevronRight,
  X,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";
import "./MemberSidebar.css";

const MemberSidebar = ({
  mobileOpen = false,
  onClose,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [loggingOut, setLoggingOut] = useState(false);

  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    "Individual Member";

  const closeSidebar = () => {
    if (onClose) onClose();
  };

  const handleLogout = async () => {
    if (loggingOut) return;

    try {
      setLoggingOut(true);

      await logout();

      toast.success("You have successfully signed out.");

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Unable to sign out. Please try again.");
      setLoggingOut(false);
    }
  };

  const mainNavigation = [
    {
      label: "Overview",
      path: "/individual/dashboard",
      icon: LayoutDashboard,
      end: true,
    },
    {
      label: "My Membership",
      path: "/individual/membership",
      icon: FileText,
    },
    {
      label: "Events",
      path: "/individual/events",
      icon: CalendarDays,
    },
    {
      label: "Programmes",
      path: "/individual/programmes",
      icon: BookOpen,
    },
  ];

  return (
    <>
      {mobileOpen && (
        <div
          className="member-sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`member-sidebar ${
          mobileOpen ? "mobile-open" : ""
        }`}
      >
        <div className="member-sidebar-brand">
          <div className="member-brand-logo">AC</div>

          <div className="member-brand-text">
            <h2>ACSP-Kenya</h2>
            <span>Individual Member Portal</span>
          </div>

          <button
            type="button"
            className="member-sidebar-close"
            onClick={closeSidebar}
            aria-label="Close navigation"
          >
            <X size={21} />
          </button>
        </div>

        <div className="member-sidebar-user">
          <div className="member-sidebar-user-avatar">
            {fullName.charAt(0).toUpperCase()}
          </div>

          <div className="member-sidebar-user-info">
            <strong>{fullName}</strong>
            <span>Individual Student Member</span>
          </div>
        </div>

        <div className="member-sidebar-content">
          <div className="member-sidebar-section">
            <span className="member-sidebar-section-label">
              MAIN MENU
            </span>

            <nav className="member-sidebar-navigation">
              {mainNavigation.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    onClick={closeSidebar}
                    className={({ isActive }) =>
                      `member-sidebar-link ${
                        isActive ? "active" : ""
                      }`
                    }
                  >
                    <Icon size={19} strokeWidth={1.9} />
                    <span>{item.label}</span>
                    <ChevronRight
                      size={15}
                      className="member-link-arrow"
                    />
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="member-sidebar-bottom">
          <NavLink
            to="/individual/profile"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `member-sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <UserRound size={19} />
            <span>My Profile</span>
          </NavLink>

          <NavLink
            to="/individual/settings"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `member-sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <Settings size={19} />
            <span>Account Settings</span>
          </NavLink>

          <button
            type="button"
            className="member-sidebar-logout"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <LogOut size={19} />
            <span>
              {loggingOut ? "Signing Out..." : "Sign Out"}
            </span>
          </button>

          <div className="member-sidebar-footer">
            <strong>ACSP-Kenya</strong>
            <span>Individual Member Portal © 2026</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default MemberSidebar;
