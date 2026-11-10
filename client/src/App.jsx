
import { Routes, Route, Link } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicLayout from "./components/common/PublicLayout";

import HomePage from "./pages/public/HomePage";
import About from "./pages/public/About";
import MissionVision from "./pages/public/MissionVision";
import FocusAreas from "./pages/public/FocusAreas";
import WhereWeWork from "./pages/public/WhereWeWork";
import CountyDetailsPage from "./pages/public/CountyDetailsPage.jsx";
import ProgramsPage from "./pages/public/ProgramsPage";
import ActivityPage from "./pages/public/ActivityPage";
import LeadershipPage from "./pages/public/LeadershipPage";
import EventsPage from "./pages/public/EventsPage";
import NewsPage from "./pages/public/NewsPage";
import ContactPage from "./pages/public/ContactPage";
import TimelinePage from "./pages/public/TimelinePage";
import JoinPage from "./pages/public/JoinPage.jsx";

import RegisterPage from "./pages/auth/RegisterPage";
import LoginPage from "./pages/auth/LoginPage";
import IndividualRegisterPage from "./pages/auth/IndividualRegisterPage";


import DashboardPage from "./pages/dashboard/DashboardPage";
import AssociationPage from "./pages/association/AssociationPage";
import AssociationMembersPage from "./pages/association/AssociationMembersPage";
import AssociationAnnouncementsPage from "./pages/association/AssociationAnnouncementsPage";
import AssociationEventsPage from "./pages/association/AssociationEventsPage";
import AssociationAccountPage from "./pages/association/AssociationAccountPage";
import NecDashboardPage from "./pages/dashboard/NecDashboardPage";
import WorkstationDashboardPage from "./pages/dashboard/WorkstationDashboardPage";
import ProgrammesDashboardPage from "./pages/dashboard/ProgrammesDashboardPage";
import MembersManagementPage from "./pages/dashboard/MembersManagementPage";
import EventsManagementPage from "./pages/dashboard/EventsManagementPage";
import NewsManagementPage from "./pages/dashboard/NewsManagementPage";
import ContactManagementPage from "./pages/dashboard/ContactManagementPage";
import AuditLogsPage from "./pages/dashboard/AuditLogsPage";
import AdministratorManagementPage from "./pages/dashboard/AdministratorsManagementPage";
import SystemSettingsPage from "./pages/dashboard/SystemSettingsPage";
import AdminProfilePage from "./pages/dashboard/AdminProfilePage";

import MemberDashboardPage from "./pages/member/MemberDashboardPage";
import IndividualApplicationPage from "./pages/member/IndividualApplicationPage";

import ApplicationPage from "./pages/application/ApplicationPage";


function NotFoundPage() {
  return (
    <main>
      <h1>404 - Page Not Found</h1>
      <Link to="/">Return Home</Link>
    </main>
  );
}

function App() {
  return (
    <Routes>
      {/* PUBLIC WEBSITE */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/mission-vision" element={<MissionVision />} />
        <Route path="/focus-areas" element={<FocusAreas />} />
        <Route path="/where-we-work" element={<WhereWeWork />} />
        <Route path="/where-we-work/:countyCode" element={<CountyDetailsPage />}/>
        <Route path="/programs" element={<ProgramsPage />} />
        <Route path="/activities" element={<ActivityPage />} />
        <Route path="/leadership" element={<LeadershipPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/join" element={<JoinPage />} /> 

        </Route>



      {/* AUTHENTICATION */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/individual/register" element={<IndividualRegisterPage />} />
    
<Route
  element={<ProtectedRoute />}
>
  <Route path="/individual/application" element={<IndividualApplicationPage />}/>
</Route>


      {/* COUNTY PRESIDENT DASHBOARD */}
<Route
  element={
    <ProtectedRoute allowedRoles={["county_president"]} />
  }
>
  <Route path="/dashboard" element={<DashboardPage />} />
  <Route path="/application" element={<ApplicationPage />} />
  <Route path="/association" element={<AssociationPage />} />
  <Route path="/association/members" element={<AssociationMembersPage />} />
  <Route path="/association/announcements" element={<AssociationAnnouncementsPage />} />
  <Route path="/association/events" element={<AssociationEventsPage />} />
  <Route path="/association/profile" element={<AssociationAccountPage />} />
</Route>

            {/* INDIVIDUAL STUDENT MEMBER DASHBOARD */}
      <Route
        element={
          <ProtectedRoute
            allowedRoles={["individual_member"]}
            redirectTo="/individual/application"
          />
        }
      >
        <Route path="/individual/dashboard" element={<MemberDashboardPage />} />

      </Route> 

      {/* NEC AND ADMIN DASHBOARDS */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["super_admin", "nec_admin"]} />
        }
      >
        <Route path="/nec" element={<NecDashboardPage />} />
        <Route path="/nec/applications" element={<NecDashboardPage />} />
        <Route path="/nec/associations" element={<NecDashboardPage />} />

        <Route path="/admin/workstations"  element={<WorkstationDashboardPage />} />
        <Route path="/admin/programmes" element={<ProgrammesDashboardPage />} />
        <Route path="/admin/members" element={<MembersManagementPage />} />
        <Route path="/admin/events" element={<EventsManagementPage />} />
        <Route path="/admin/news" element={<NewsManagementPage />} />
        <Route path="/admin/contact" element={<ContactManagementPage />} />
        <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
        <Route path="/admin/administrators" element={<AdministratorManagementPage />} />
        <Route path="/admin/settings" element={<SystemSettingsPage />} />
        <Route path="/admin/profile" element={<AdminProfilePage />} />
      </Route>

            {/* SUPER ADMIN ONLY */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["super_admin"]} />
        }
      >
        <Route
          path="/nec/secretariat"
          element={<NecDashboardPage />}
        />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
