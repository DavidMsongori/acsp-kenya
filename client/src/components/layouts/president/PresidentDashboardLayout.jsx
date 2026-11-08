
import { useState } from "react";
import { Outlet } from "react-router-dom";

import PresidentTopBar from "./PresidentTopBar";
import PresidentSidebar from "./PresidentSidebar";

import "./PresidentDashboardLayout.css";

const PresidentDashboardLayout = ({
  title = "Dashboard",
  subtitle = "Welcome to your ACSP-Kenya President Portal.",
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
    <div className="president-dashboard-layout">
      <PresidentSidebar
        mobileOpen={mobileOpen}
        onClose={closeMobileMenu}
      />

      <div className="president-dashboard-main">
        <PresidentTopBar
          title={title}
          subtitle={subtitle}
          onMenuToggle={toggleMobileMenu}
        />

        <main className="president-dashboard-content">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default PresidentDashboardLayout;
