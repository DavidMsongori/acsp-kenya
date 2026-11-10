
import { useState } from "react";
import { Outlet } from "react-router-dom";

import MemberSidebar from "./MemberSidebar";
import MemberTopBar from "./MemberTopBar";

import "./MemberDashboardLayout.css";

const MemberDashboardLayout = ({
  title = "Overview",
  subtitle = "Welcome to your ACSP-Kenya Individual Member Portal.",
  children,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileMenu = () => setMobileOpen(false);

  const toggleMobileMenu = () => {
    setMobileOpen((current) => !current);
  };

  return (
    <div className="member-dashboard-layout">
      <MemberSidebar
        mobileOpen={mobileOpen}
        onClose={closeMobileMenu}
      />

      <div className="member-dashboard-main">
        <MemberTopBar
          title={title}
          subtitle={subtitle}
          onMenuToggle={toggleMobileMenu}
        />

        <main className="member-dashboard-content">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default MemberDashboardLayout;
