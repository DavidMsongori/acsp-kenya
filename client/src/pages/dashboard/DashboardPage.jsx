
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  FileText,
  UserCircle,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getMyApplication } from "../../services/application.service";

import PresidentDashboardLayout from "../../components/layouts/president/PresidentDashboardLayout";

import "./DashboardPage.css";

const formatStatus = (status) => {
  if (!status) return "Not Available";

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const getStatusClass = (status) => {
  if (status === "approved" || status === "verified") {
    return "approved";
  }

  if (status === "rejected") {
    return "rejected";
  }

  return "pending";
};

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loadingApplication, setLoadingApplication] = useState(true);
  const [applicationError, setApplicationError] = useState(false);

  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    "ACSP-Kenya Member";

  const firstName = fullName.split(" ")[0];

  // ==========================================
  // Fetch Applicant's Application
  // ==========================================

  const fetchApplication = async () => {
    try {
      setLoadingApplication(true);
      setApplicationError(false);

      const response = await getMyApplication();

      setApplication(
        response.hasApplication ? response.application : null
      );
    } catch (error) {
      console.error("Application loading error:", error);

      setApplicationError(true);
      toast.error("Unable to retrieve your application details.");
    } finally {
      setLoadingApplication(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, []);

  // ==========================================
  // Application Information
  // ==========================================

  const applicationStatus = application?.application_status;

  const association = application?.county_associations;

  const associationVerification =
    association?.verification_status;

  const county = association?.counties;

  const hasApplication = Boolean(application);

  return (
    <PresidentDashboardLayout
      title="Dashboard"
      subtitle="Welcome to your ACSP-Kenya President Portal."
    >
      <div className="dashboard-content">

        {/* Welcome Banner */}
        <section className="welcome-banner">
          <div>
            <span className="welcome-eyebrow">
              ASSOCIATION OF COUNTY STUDENTS PRESIDENTS
            </span>

            <h2>Welcome back, {firstName}!</h2>

            <p>
              Your leadership journey with ACSP-Kenya starts here.
              Manage your membership and follow your County
              Association President application.
            </p>
          </div>

          <div className="welcome-icon">
            <ShieldCheck size={76} strokeWidth={1.2} />
          </div>
        </section>

        {/* Overview Cards */}
        <section className="dashboard-overview">

          <div className="overview-card">
            <div className="overview-card-icon blue">
              <UserCircle size={22} />
            </div>

            <div>
              <span>Account Status</span>
              <h3>Active</h3>
              <small>Your account is registered</small>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-card-icon orange">
              <FileText size={22} />
            </div>

            <div>
              <span>Application</span>

              <h3>
                {loadingApplication
                  ? "Loading..."
                  : applicationError
                  ? "Unavailable"
                  : hasApplication
                  ? formatStatus(applicationStatus)
                  : "Not Started"}
              </h3>

              <small>County presidency application</small>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-card-icon green">
              <ShieldCheck size={22} />
            </div>

            <div>
              <span>Association Verification</span>

              <h3>
                {loadingApplication
                  ? "Loading..."
                  : applicationError
                  ? "Unavailable"
                  : hasApplication
                  ? formatStatus(associationVerification)
                  : "Not Submitted"}
              </h3>

              <small>NEC association verification</small>
            </div>
          </div>

        </section>

        {/* Application Section */}
        <section
          className="application-section"
          id="application"
        >
          <div className="section-heading">
            <div>
              <h2>County President Application</h2>

              <p>
                View and manage your County Association
                President application.
              </p>
            </div>

            {!loadingApplication &&
              !applicationError &&
              hasApplication && (
                <span
                  className={`status-badge ${getStatusClass(
                    applicationStatus
                  )}`}
                >
                  {formatStatus(applicationStatus)}
                </span>
              )}
          </div>

          {loadingApplication ? (
            <div className="application-empty-state">
              <h3>Loading your application...</h3>

              <p>
                Please wait while we retrieve your application details.
              </p>
            </div>
          ) : applicationError ? (
            <div className="application-empty-state">
              <h3>Unable to load application details</h3>

              <p>
                We could not retrieve your application information.
                Please try again.
              </p>

              <button
                className="application-button"
                onClick={fetchApplication}
              >
                Try Again
                <ArrowRight size={18} />
              </button>
            </div>
          ) : hasApplication ? (
            <div className="application-details">

              <div className="application-detail-card">
                <span>Association Name</span>

                <strong>
                  {association?.association_name || "Not provided"}
                </strong>
              </div>

              <div className="application-detail-card">
                <span>County</span>

                <strong>
                  {county?.name || "Not available"}
                </strong>
              </div>

              <div className="application-detail-card">
                <span>Application Status</span>

                <strong
                  className={`application-status-text ${getStatusClass(
                    applicationStatus
                  )}`}
                >
                  {formatStatus(applicationStatus)}
                </strong>
              </div>

              <div className="application-detail-card">
                <span>Association Verification</span>

                <strong
                  className={`application-status-text ${getStatusClass(
                    associationVerification
                  )}`}
                >
                  {formatStatus(associationVerification)}
                </strong>
              </div>

              <div className="application-detail-card">
                <span>Submitted On</span>

                <strong>
                  {application.created_at
                    ? new Date(application.created_at).toLocaleDateString(
                        "en-KE",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )
                    : "Not available"}
                </strong>
              </div>

              {application.review_notes && (
                <div className="application-review-notes">
                  <h3>NEC Review Notes</h3>

                  <p>{application.review_notes}</p>
                </div>
              )}

              {applicationStatus === "pending" && (
                <p className="application-information">
                  Your application has been received and is
                  awaiting review by the National Executive Council.
                </p>
              )}

              {applicationStatus === "under_review" && (
                <p className="application-information">
                  Your application is currently being reviewed
                  by the National Executive Council.
                </p>
              )}

              {applicationStatus === "approved" &&
                associationVerification !== "verified" && (
                  <p className="application-information">
                    Your application has been approved.
                    Association verification is still pending.
                  </p>
                )}

              {applicationStatus === "approved" &&
                associationVerification === "verified" && (
                  <p className="application-information">
                    Congratulations! Your application and
                    association have been verified.
                  </p>
                )}

              {applicationStatus === "rejected" && (
                <p className="application-information">
                  Your application was not approved.
                  Please review the NEC notes above for further information.
                </p>
              )}

            </div>
          ) : (
            <div className="application-empty-state">
              <div className="application-icon">
                <FileText size={34} />
              </div>

              <h3>
                Start Your County President Application
              </h3>

              <p>
                Provide your county association details, official
                association logo, leadership information and
                profile photograph.
              </p>

              <button
                className="application-button"
                onClick={() => navigate("/application")}
              >
                Start Application
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </section>

        {/* Account Information */}
        <section
          className="account-section"
          id="account"
        >
          <div className="section-heading">
            <div>
              <h2>Account Information</h2>

              <p>
                Your registered account details.
              </p>
            </div>
          </div>

          <div className="account-information">

            <div className="account-detail">
              <span>Full Name</span>
              <strong>{fullName}</strong>
            </div>

            <div className="account-detail">
              <span>Email Address</span>
              <strong>{user?.email}</strong>
            </div>

            <div className="account-detail">
              <span>Phone Number</span>

              <strong>
                {user?.user_metadata?.phone || "Not provided"}
              </strong>
            </div>

            <div className="account-detail">
              <span>Account Type</span>
              <strong>Registered Member</strong>
            </div>

          </div>
        </section>

      </div>
    </PresidentDashboardLayout>
  );
};

export default DashboardPage;
