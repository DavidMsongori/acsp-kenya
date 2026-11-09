
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";

import {
  LayoutDashboard,
  FileText,
  Building2,
  Users,
  ShieldCheck,
  ClipboardList,
  Megaphone,
  CalendarDays,
  Settings,
  LogOut,
  ChevronRight,
  X,
  BriefcaseBusiness,
  FolderKanban,
  Mail,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";
import "./AdminSidebar.css";

const AdminSidebar = ({
  mobileOpen = false,
  onClose,
}) => {
  const { user, roles, logout } = useAuth();
  const navigate = useNavigate();

  const [loggingOut, setLoggingOut] = useState(false);

  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    "Administrator";

  const isSuperAdmin = roles.includes("super_admin");

  const adminNavigation = [
    {
      label: "Overview",
      path: "/nec",
      icon: LayoutDashboard,
      end: true,
    },
    {
      label: "President Applications",
      path: "/nec/applications",
      icon: FileText,
    },
    {
      label: "County Associations",
      path: "/nec/associations",
      icon: Building2,
    },
        ...(isSuperAdmin
      ? [
          {
            label: "National Secretariat",
            path: "/nec/secretariat",
            icon: BriefcaseBusiness,
          },
        ]
      : []),
    {
      label: "Members",
      path: "/admin/members",
      icon: Users,
    },
    {
      label: "NEC Workstations",
      path: "/admin/workstations",
      icon: BriefcaseBusiness,
    },
    {
      label: "Announcements",
      path: "/admin/news",
      icon: Megaphone,
    },
    {
  label: "Contact Messages",
  path: "/admin/contact",
  icon: Mail,
},
    {
      label: "Events & Programmes",
      path: "/admin/events",
      icon: CalendarDays,
    },
        {
      label: "National Programmes",
      path: "/admin/programmes",
      icon: FolderKanban,
    },
  ];

  const systemNavigation = [
    {
      label: "Audit Logs",
      path: "/admin/audit-logs",
      icon: ClipboardList,
    },
    ...(isSuperAdmin
      ? [
          {
            label: "Admin Management",
            path: "/admin/administrators",
            icon: ShieldCheck,
          },
          {
            label: "System Settings",
            path: "/admin/settings",
            icon: Settings,
          },
        ]
      : []),
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
      console.error("Admin logout error:", error);
      toast.error("Unable to sign out. Please try again.");
      setLoggingOut(false);
    }
  };

  const renderNavigation = (items) =>
    items.map((item) => {
      const Icon = item.icon;

      return (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          onClick={closeSidebar}
          className={({ isActive }) =>
            `admin-sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <Icon size={19} strokeWidth={1.9} />
          <span>{item.label}</span>
          <ChevronRight
            size={15}
            className="admin-link-arrow"
          />
        </NavLink>
      );
    });

  return (
    <>
      {mobileOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`admin-sidebar ${
          mobileOpen ? "mobile-open" : ""
        }`}
      >
        <div className="admin-sidebar-brand">
          <div className="admin-brand-logo">AC</div>

          <div className="admin-brand-text">
            <h2>ACSP-Kenya</h2>
            <span>Administration Portal</span>
          </div>

          <button
            type="button"
            className="admin-sidebar-close"
            onClick={closeSidebar}
            aria-label="Close navigation"
          >
            <X size={21} />
          </button>
        </div>

        <div className="admin-sidebar-user">
          <div className="admin-sidebar-user-avatar">
            {fullName.charAt(0).toUpperCase()}
          </div>

          <div className="admin-sidebar-user-info">
            <strong>{fullName}</strong>
            <span>
              {isSuperAdmin
                ? "Super Administrator"
                : "NEC Administrator"}
            </span>
          </div>
        </div>

        <div className="admin-sidebar-content">
          <div className="admin-sidebar-section">
            <span className="admin-sidebar-section-label">
              PLATFORM MANAGEMENT
            </span>

            <nav className="admin-sidebar-navigation">
              {renderNavigation(adminNavigation)}
            </nav>
          </div>

          <div className="admin-sidebar-section">
            <span className="admin-sidebar-section-label">
              SYSTEM & SECURITY
            </span>

            <nav className="admin-sidebar-navigation">
              {renderNavigation(systemNavigation)}
            </nav>
          </div>
        </div>

        <div className="admin-sidebar-bottom">
          <NavLink
            to="/admin/profile"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `admin-sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <Settings size={19} />
            <span>My Profile</span>
          </NavLink>

          <button
            type="button"
            className="admin-sidebar-logout"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <LogOut size={19} />
            <span>
              {loggingOut ? "Signing Out..." : "Sign Out"}
            </span>
          </button>

          <div className="admin-sidebar-footer">
            <strong>ACSP-Kenya</strong>
            <span>Administration Portal © 2026</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
