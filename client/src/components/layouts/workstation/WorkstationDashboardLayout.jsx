
import { useState } from "react";
import { Outlet } from "react-router-dom";

import WorkstationTopBar from "./WorkstationTopBar";
import WorkstationSidebar from "./WorkstationSidebar";

import "./WorkstationDashboardLayout.css";

const WorkstationDashboardLayout = ({
  title = "My WorkStation",
  subtitle = "Your ACSP-Kenya national leadership workspace.",
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
    <div className="workstation-dashboard-layout">
      <WorkstationSidebar
        mobileOpen={mobileOpen}
        onClose={closeMobileMenu}
      />

      <div className="workstation-dashboard-main">
        <WorkstationTopBar
          title={title}
          subtitle={subtitle}
          onMenuToggle={toggleMobileMenu}
        />

        <main className="workstation-dashboard-content">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default WorkstationDashboardLayout;
