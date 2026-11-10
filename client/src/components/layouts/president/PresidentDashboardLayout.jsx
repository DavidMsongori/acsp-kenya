
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import toast from "react-hot-toast";

import PresidentTopBar from "./PresidentTopBar";
import PresidentSidebar from "./PresidentSidebar";

import { getMyApplication } from "../../../services/application.service";

import "./PresidentDashboardLayout.css";

const PresidentDashboardLayout = ({
  title = "Dashboard",
  subtitle = "Welcome to your ACSP-Kenya President Portal.",
  children,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [application, setApplication] = useState(null);
  const [applicationLoading, setApplicationLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchApplication = async () => {
      try {
        const response = await getMyApplication();

        if (mounted) {
          setApplication(
            response.hasApplication ? response.application : null
          );
        }
      } catch (error) {
        console.error("Application loading error:", error);

        if (mounted) {
          toast.error("Unable to load your association status.");
        }
      } finally {
        if (mounted) {
          setApplicationLoading(false);
        }
      }
    };

    fetchApplication();

    return () => {
      mounted = false;
    };
  }, []);

  const association = application?.county_associations;

  const isAssociationApproved =
    application?.application_status === "approved" &&
    association?.verification_status === "verified";

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
        application={application}
        applicationLoading={applicationLoading}
        isAssociationApproved={isAssociationApproved}
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
