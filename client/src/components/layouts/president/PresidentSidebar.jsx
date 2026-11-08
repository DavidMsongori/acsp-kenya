
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";

import {
  LayoutDashboard,
  FileText,
  Building2,
  Users,
  ClipboardList,
  CalendarDays,
  Megaphone,
  Settings,
  LogOut,
  ChevronRight,
  X,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";
import "./PresidentSidebar.css";

const PresidentSidebar = ({
  mobileOpen = false,
  onClose,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [loggingOut, setLoggingOut] = useState(false);

  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    "County President";

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
      path: "/dashboard",
      icon: LayoutDashboard,
      end: true,
    },
    {
      label: "My Application",
      path: "/application",
      icon: FileText,
    },
    {
      label: "My County Association",
      path: "/association",
      icon: Building2,
    },
    {
      label: "Association Members",
      path: "/association/members",
      icon: Users,
    },
    {
      label: "Reports",
      path: "/association/reports",
      icon: ClipboardList,
    },
    {
      label: "Programmes & Activities",
      path: "/association/programmes",
      icon: CalendarDays,
    },
  ];

  const communicationNavigation = [
    {
      label: "Announcements",
      path: "/announcements",
      icon: Megaphone,
    },
    {
      label: "Events",
      path: "/events",
      icon: CalendarDays,
    },
  ];

  return (
    <>
      {mobileOpen && (
        <div
          className="president-sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`president-sidebar ${
          mobileOpen ? "mobile-open" : ""
        }`}
      >
        <div className="president-sidebar-brand">
          <div className="president-brand-logo">
            AC
          </div>

          <div className="president-brand-text">
            <h2>ACSP-Kenya</h2>
            <span>President Portal</span>
          </div>

          <button
            type="button"
            className="president-sidebar-close"
            onClick={closeSidebar}
            aria-label="Close navigation"
          >
            <X size={21} />
          </button>
        </div>

        <div className="president-sidebar-user">
          <div className="president-sidebar-user-avatar">
            {fullName.charAt(0).toUpperCase()}
          </div>

          <div className="president-sidebar-user-info">
            <strong>{fullName}</strong>
            <span>County President Portal</span>
          </div>
        </div>

        <div className="president-sidebar-content">
          <div className="president-sidebar-section">
            <span className="president-sidebar-section-label">
              MAIN MENU
            </span>

            <nav className="president-sidebar-navigation">
              {mainNavigation.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    onClick={closeSidebar}
                    className={({ isActive }) =>
                      `president-sidebar-link ${
                        isActive ? "active" : ""
                      }`
                    }
                  >
                    <Icon size={19} strokeWidth={1.9} />

                    <span>{item.label}</span>

                    <ChevronRight
                      size={15}
                      className="president-link-arrow"
                    />
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="president-sidebar-section">
            <span className="president-sidebar-section-label">
              COMMUNICATION
            </span>

            <nav className="president-sidebar-navigation">
              {communicationNavigation.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={closeSidebar}
                    className={({ isActive }) =>
                      `president-sidebar-link ${
                        isActive ? "active" : ""
                      }`
                    }
                  >
                    <Icon size={19} strokeWidth={1.9} />

                    <span>{item.label}</span>

                    <ChevronRight
                      size={15}
                      className="president-link-arrow"
                    />
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="president-sidebar-bottom">
          <NavLink
            to="/account"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `president-sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <Settings size={19} />
            <span>Account Settings</span>
          </NavLink>

          <button
            type="button"
            className="president-sidebar-logout"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <LogOut size={19} />
            <span>
              {loggingOut ? "Signing Out..." : "Sign Out"}
            </span>
          </button>

          <div className="president-sidebar-footer">
            <strong>ACSP-Kenya</strong>
            <span>President Portal © 2026</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default PresidentSidebar;
