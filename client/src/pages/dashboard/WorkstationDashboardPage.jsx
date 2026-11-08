
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  Users,
  CalendarDays,
  BarChart3,
  Settings,
  BriefcaseBusiness,
  Clock3,
} from "lucide-react";

import WorkstationDashboardLayout from
  "../../components/layouts/workstation/WorkstationDashboardLayout";

import "./WorkstationDashboardPage.css";

const WorkstationDashboardPage = () => {
  const overviewCards = [
    {
      title: "My Assignments",
      description: "View and manage responsibilities assigned to your workstation.",
      icon: ClipboardList,
    },
    {
      title: "Reports & Submissions",
      description: "Access official reports, submissions and work updates.",
      icon: FileText,
    },
    {
      title: "NEC Officials",
      description: "View relevant national executive leadership information.",
      icon: Users,
    },
    {
      title: "Meetings & Calendar",
      description: "Keep track of scheduled meetings and important activities.",
      icon: CalendarDays,
    },
    {
      title: "Performance & Progress",
      description: "Monitor activities, progress and institutional performance.",
      icon: BarChart3,
    },
    {
      title: "Workstation Settings",
      description: "Access your workstation preferences and account settings.",
      icon: Settings,
    },
  ];

  const statistics = [
    {
      title: "Assigned Tasks",
      value: "—",
      icon: ClipboardList,
    },
    {
      title: "Pending Activities",
      value: "—",
      icon: Clock3,
    },
    {
      title: "Submitted Reports",
      value: "—",
      icon: FileText,
    },
    {
      title: "Workstation Members",
      value: "—",
      icon: Users,
    },
  ];

  return (
    <WorkstationDashboardLayout
      title="My Workstation"
      subtitle="Your ACSP-Kenya national leadership workspace."
    >
      <div className="workstation-page">

        {/* Welcome Section */}
        <section className="workstation-welcome">
          <div className="workstation-welcome-content">
            <div className="workstation-welcome-label">
              <span />
              NATIONAL EXECUTIVE COUNCIL
            </div>

            <h1>Welcome to Your Workstation</h1>

            <p>
              Your central workspace for coordinating responsibilities,
              accessing institutional resources and supporting the
              operations of the Association of County Students Presidents
              - Kenya.
            </p>
          </div>
        </section>

        {/* Setup Notice */}
        <div className="workstation-notice">
          <div className="workstation-notice-icon">
            <BriefcaseBusiness size={21} />
          </div>

          <div className="workstation-notice-content">
            <h3>Workstation Setup</h3>
            <p>
              The ACSP-Kenya Workstation environment is being established.
              Its operational structure, responsibilities and access
              permissions will be configured in the next development
              phase.
            </p>
          </div>
        </div>

        {/* Statistics */}
        <section className="workstation-statistics">
          {statistics.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <div className="workstation-stat-card" key={index}>
                <div className="workstation-stat-icon">
                  <Icon size={22} />
                </div>

                <div className="workstation-stat-info">
                  <h3>{stat.title}</h3>
                  <strong>{stat.value}</strong>
                </div>
              </div>
            );
          })}
        </section>

        {/* Workspace Overview */}
        <section className="workstation-section">
          <div className="workstation-section-header">
            <div className="workstation-section-heading">
              <h2>Workspace Overview</h2>
              <p>
                Your central access point for national leadership
                activities and institutional resources.
              </p>
            </div>

            <span className="workstation-section-badge">
              INITIAL PLACEHOLDER
            </span>
          </div>

          <div className="workstation-grid">
            {overviewCards.map((card, index) => {
              const Icon = card.icon;

              return (
                <div className="workstation-card" key={index}>
                  <div className="workstation-card-top">
                    <div className="workstation-card-icon">
                      <Icon size={22} />
                    </div>

                    <span className="workstation-card-status">
                      Coming Soon
                    </span>
                  </div>

                  <h3>{card.title}</h3>

                  <p>{card.description}</p>

                  <div className="workstation-card-footer">
                    <span>ACSP-Kenya</span>
                    <strong>Not configured</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Empty Workspace */}
        <section className="workstation-section">
          <div className="workstation-section-heading">
            <h2>My Workstation Activity</h2>
            <p>
              Your activities and updates will appear here once the
              workstation operations are configured.
            </p>
          </div>

          <div className="workstation-placeholder">
            <div className="workstation-placeholder-icon">
              <LayoutDashboard size={28} />
            </div>

            <h3>Your workspace is being prepared</h3>

            <p>
              No workstation activities are available yet. This section
              will display relevant information once the NEC workstation
              system is operational.
            </p>
          </div>
        </section>

      </div>
    </WorkstationDashboardLayout>
  );
};

export default WorkstationDashboardPage;
