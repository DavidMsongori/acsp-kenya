
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";

import {
  LayoutDashboard,
  BriefcaseBusiness,
  FileText,
  ClipboardList,
  CalendarDays,
  Megaphone,
  Users,
  FolderOpen,
  Settings,
  LogOut,
  ChevronRight,
  X,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";
import "./WorkstationSidebar.css";

const WorkstationSidebar = ({
  mobileOpen = false,
  onClose,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [loggingOut, setLoggingOut] = useState(false);

  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    "NEC Member";

  const navigationGroups = [
    {
      heading: "MY WORKSPACE",
      items: [
        {
          label: "Overview",
          path: "/workstation",
          icon: LayoutDashboard,
          end: true,
        },
        {
          label: "My Portfolio",
          path: "/workstation/portfolio",
          icon: BriefcaseBusiness,
        },
        {
          label: "My Reports",
          path: "/workstation/reports",
          icon: FileText,
        },
        {
          label: "Work Plans",
          path: "/workstation/work-plans",
          icon: ClipboardList,
        },
        {
          label: "Programmes & Activities",
          path: "/workstation/programmes",
          icon: CalendarDays,
        },
      ],
    },
    {
      heading: "NATIONAL ENGAGEMENT",
      items: [
        {
          label: "Announcements",
          path: "/workstation/announcements",
          icon: Megaphone,
        },
        {
          label: "Committees",
          path: "/workstation/committees",
          icon: Users,
        },
        {
          label: "Documents",
          path: "/workstation/documents",
          icon: FolderOpen,
        },
      ],
    },
  ];

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
      console.error("WorkStation logout error:", error);

      toast.error("Unable to sign out. Please try again.");
      setLoggingOut(false);
    }
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="workstation-sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`workstation-sidebar ${
          mobileOpen ? "mobile-open" : ""
        }`}
      >
        <div className="workstation-sidebar-brand">
          <div className="workstation-brand-logo">AC</div>

          <div className="workstation-brand-text">
            <h2>ACSP-Kenya</h2>
            <span>NEC WorkStation</span>
          </div>

          <button
            type="button"
            className="workstation-sidebar-close"
            onClick={closeSidebar}
            aria-label="Close navigation"
          >
            <X size={21} />
          </button>
        </div>

        <div className="workstation-sidebar-user">
          <div className="workstation-sidebar-user-avatar">
            {fullName.charAt(0).toUpperCase()}
          </div>

          <div className="workstation-sidebar-user-info">
            <strong>{fullName}</strong>
            <span>National Executive Member</span>
          </div>
        </div>

        <div className="workstation-sidebar-content">
          {navigationGroups.map((group) => (
            <div
              className="workstation-sidebar-section"
              key={group.heading}
            >
              <span className="workstation-sidebar-section-label">
                {group.heading}
              </span>

              <nav className="workstation-sidebar-navigation">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      onClick={closeSidebar}
                      className={({ isActive }) =>
                        `workstation-sidebar-link ${
                          isActive ? "active" : ""
                        }`
                      }
                    >
                      <Icon size={19} strokeWidth={1.9} />

                      <span>{item.label}</span>

                      <ChevronRight
                        size={15}
                        className="workstation-link-arrow"
                      />
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className="workstation-sidebar-bottom">
          <NavLink
            to="/workstation/profile"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `workstation-sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <Settings size={19} />
            <span>My Profile</span>
          </NavLink>

          <button
            type="button"
            className="workstation-sidebar-logout"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <LogOut size={19} />
            <span>
              {loggingOut ? "Signing Out..." : "Sign Out"}
            </span>
          </button>

          <div className="workstation-sidebar-footer">
            <strong>ACSP-Kenya</strong>
            <span>NEC WorkStation © 2026</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default WorkstationSidebar;
