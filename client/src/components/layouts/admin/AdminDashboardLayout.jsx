
import { useState } from "react";
import { Outlet } from "react-router-dom";

import AdminTopBar from "./AdminTopBar";
import AdminSidebar from "./AdminSidebar";

import "./AdminDashboardLayout.css";

const AdminDashboardLayout = ({
  title = "Admin Dashboard",
  subtitle = "Manage the ACSP-Kenya national platform.",
  children,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileOpen((current) => !current);
  };

  return (
    <div className="admin-dashboard-layout">
      <AdminSidebar
        mobileOpen={mobileOpen}
        onClose={closeMobileMenu}
      />

      <div className="admin-dashboard-main">
        <AdminTopBar
          title={title}
          subtitle={subtitle}
          onMenuToggle={toggleMobileMenu}
        />

        <main className="admin-dashboard-content">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
