
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

import RegisterPage from "./pages/auth/RegisterPage";
import LoginPage from "./pages/auth/LoginPage";

import DashboardPage from "./pages/dashboard/DashboardPage";
import NecDashboardPage from "./pages/dashboard/NecDashboardPage";
import WorkstationDashboardPage from "./pages/dashboard/WorkstationDashboardPage";
import ProgrammesDashboardPage from "./pages/dashboard/ProgrammesDashboardPage";

import ApplicationPage from "./pages/application/ApplicationPage";

function PublicPlaceholderPage({ title }) {
  return (
    <main>
      <h1>{title}</h1>
      <p>This section is currently being developed.</p>
    </main>
  );
}

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


        <Route
          path="/news"
          element={<PublicPlaceholderPage title="News & Updates" />}
        />

        <Route
          path="/leadership"
          element={<PublicPlaceholderPage title="Our Leadership" />}
        />

        <Route
          path="/timeline"
          element={<PublicPlaceholderPage title="Our Timeline" />}
        />

        

        <Route
          path="/events"
          element={<PublicPlaceholderPage title="Events" />}
        />

        <Route
          path="/contact"
          element={<PublicPlaceholderPage title="Contact Us" />}
        />
      </Route>

      {/* AUTHENTICATION */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* COUNTY PRESIDENT DASHBOARD */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/application" element={<ApplicationPage />} />
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
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
