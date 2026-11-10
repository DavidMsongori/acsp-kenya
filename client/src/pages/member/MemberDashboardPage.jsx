
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  UserCircle,
  FileText,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
  CalendarDays,
  BookOpen,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import {
  getMyIndividualMembershipApplication,
} from "../../services/individualMembership.service";

import MemberDashboardLayout from "../../components/layouts/member/MemberDashboardLayout";

import "./MemberDashboardPage.css";

const formatStatus = (status) => {
  if (!status) return "Not Available";

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const getStatusClass = (status) => {
  if (status === "approved") return "approved";
  if (status === "rejected") return "rejected";
  if (status === "under_review") return "under-review";

  return "pending";
};

const formatDate = (date) => {
  if (!date) return "Not available";

  return new Date(date).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const MemberDashboardPage = () => {
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

  const fetchApplication = useCallback(async () => {
    try {
      setLoadingApplication(true);
      setApplicationError(false);

      const response = await getMyIndividualMembershipApplication();

      setApplication(
        response.hasApplication ? response.application : null
      );
    } catch (error) {
      console.error("Individual membership loading error:", error);

      setApplicationError(true);
      toast.error("Unable to retrieve your membership details.");
    } finally {
      setLoadingApplication(false);
    }
  }, []);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const applicationStatus = application?.application_status;
  const hasApplication = Boolean(application);

  const isApproved = applicationStatus === "approved";

  return (
    <MemberDashboardLayout
      title="Overview"
      subtitle="Welcome to your ACSP-Kenya Individual Member Portal."
    >
      <div className="member-dashboard-page">

        {/* Welcome Banner */}
        <section className="member-welcome-banner">
          <div>
            <span className="member-welcome-eyebrow">
              ASSOCIATION OF COUNTY STUDENTS PRESIDENTS – KENYA
            </span>

            <h2>Welcome back, {firstName}!</h2>

            <p>
              Your journey with ACSP-Kenya starts here.
              Follow your membership application, access programmes
              and stay connected with student leaders across Kenya.
            </p>
          </div>

          <div className="member-welcome-icon">
            <GraduationCap size={76} strokeWidth={1.2} />
          </div>
        </section>

        {/* Overview Cards */}
        <section className="member-overview-cards">

          <div className="member-overview-card">
            <div className="member-overview-icon blue">
              <UserCircle size={22} />
            </div>

            <div>
              <span>Account Status</span>
              <h3>Active</h3>
              <small>Your account is registered</small>
            </div>
          </div>

          <div className="member-overview-card">
            <div className="member-overview-icon orange">
              <FileText size={22} />
            </div>

            <div>
              <span>Membership Application</span>

              <h3>
                {loadingApplication
                  ? "Loading..."
                  : applicationError
                  ? "Unavailable"
                  : hasApplication
                  ? formatStatus(applicationStatus)
                  : "Not Started"}
              </h3>

              <small>Individual student membership</small>
            </div>
          </div>

          <div className="member-overview-card">
            <div className="member-overview-icon green">
              <ShieldCheck size={22} />
            </div>

            <div>
              <span>Membership Number</span>

              <h3 className="member-number-value">
                {loadingApplication
                  ? "Loading..."
                  : applicationError
                  ? "Unavailable"
                  : application?.membership_number || "Pending"}
              </h3>

              <small>
                {isApproved
                  ? "Your official membership number"
                  : "Issued upon approval"}
              </small>
            </div>
          </div>

        </section>

        {/* Membership Application */}
        <section className="member-application-section">

          <div className="member-section-heading">
            <div>
              <h2>My Membership</h2>

              <p>
                Track your individual student membership application.
              </p>
            </div>

            {!loadingApplication &&
              !applicationError &&
              hasApplication && (
                <span
                  className={`member-status-badge ${getStatusClass(
                    applicationStatus
                  )}`}
                >
                  {formatStatus(applicationStatus)}
                </span>
              )}
          </div>

          {loadingApplication ? (
            <div className="member-empty-state">
              <RefreshCw size={25} className="member-loading-icon" />
              <h3>Loading membership information...</h3>
              <p>Please wait while we retrieve your application.</p>
            </div>
          ) : applicationError ? (
            <div className="member-empty-state">
              <h3>Unable to load membership information</h3>

              <p>
                We could not retrieve your application details.
                Please try again.
              </p>

              <button
                type="button"
                className="member-primary-button"
                onClick={fetchApplication}
              >
                Try Again
                <RefreshCw size={17} />
              </button>
            </div>
          ) : hasApplication ? (
            <div className="member-application-details">

              <div className="member-detail-card">
                <span>Membership Category</span>
                <strong>
                  {formatStatus(application.membership_category)}
                </strong>
              </div>

              <div className="member-detail-card">
                <span>Institution</span>
                <strong>
                  {application.institution_name || "Not provided"}
                </strong>
              </div>

              <div className="member-detail-card">
                <span>Institution Location</span>
                <strong>
                  {application.institution_location || "Not provided"}
                </strong>
              </div>

              <div className="member-detail-card">
                <span>Student / Member ID</span>
                <strong>
                  {application.student_or_member_id || "Not provided"}
                </strong>
              </div>

              <div className="member-detail-card">
                <span>Application Submitted</span>
                <strong>{formatDate(application.created_at)}</strong>
              </div>

              <div className="member-detail-card">
                <span>Membership Number</span>
                <strong>
                  {application.membership_number || "Not yet issued"}
                </strong>
              </div>

              {application.reviewed_at && (
                <div className="member-detail-card">
                  <span>Last Reviewed</span>
                  <strong>{formatDate(application.reviewed_at)}</strong>
                </div>
              )}

              {application.review_notes && (
                <div className="member-review-notes">
                  <h3>Review Feedback</h3>
                  <p>{application.review_notes}</p>
                </div>
              )}

              {applicationStatus === "pending" && (
                <p className="member-application-information">
                  Your membership application has been received and is
                  awaiting review by the ACSP-Kenya Secretariat.
                </p>
              )}

              {applicationStatus === "under_review" && (
                <p className="member-application-information">
                  Your membership application is currently being
                  reviewed by the ACSP-Kenya Secretariat.
                </p>
              )}

              {isApproved && (
                <p className="member-application-information approved-message">
                  Congratulations! Your individual student membership
                  has been approved. Your membership number is now available.
                </p>
              )}

              {applicationStatus === "rejected" && (
                <p className="member-application-information rejected-message">
                  Your membership application was not approved.
                  Please review the feedback above.
                </p>
              )}

            </div>
          ) : (
            <div className="member-empty-state">
              <div className="member-empty-icon">
                <FileText size={34} />
              </div>

              <h3>Complete Your Membership Application</h3>

              <p>
                You have registered an account but have not submitted
                your individual student membership application.
                Complete the application to begin your membership review.
              </p>

              <button
                type="button"
                className="member-primary-button"
                onClick={() => navigate("/individual/application")}
              >
                Complete Application
                <ArrowRight size={18} />
              </button>
            </div>
          )}

        </section>

        {/* Quick Access */}
        <section className="member-quick-access">

          <div className="member-section-heading">
            <div>
              <h2>Quick Access</h2>
              <p>Explore your ACSP-Kenya member portal.</p>
            </div>
          </div>

          <div className="member-quick-access-grid">

            <button
              type="button"
              className="member-quick-access-card"
              onClick={() => navigate("/individual/membership")}
            >
              <FileText size={25} />
              <strong>My Membership</strong>
              <span>View your membership information</span>
              <ArrowRight size={17} />
            </button>

            <button
              type="button"
              className="member-quick-access-card"
              onClick={() => navigate("/individual/events")}
            >
              <CalendarDays size={25} />
              <strong>Events</strong>
              <span>Explore upcoming ACSP-Kenya events</span>
              <ArrowRight size={17} />
            </button>

            <button
              type="button"
              className="member-quick-access-card"
              onClick={() => navigate("/individual/programmes")}
            >
              <BookOpen size={25} />
              <strong>Programmes</strong>
              <span>Discover programmes and opportunities</span>
              <ArrowRight size={17} />
            </button>

          </div>
        </section>

      </div>
    </MemberDashboardLayout>
  );
};

export default MemberDashboardPage;
