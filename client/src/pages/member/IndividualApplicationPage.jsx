
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FileText, GraduationCap, RefreshCw } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import {
  getMyIndividualMembershipApplication,
  submitIndividualMembershipApplication,
} from "../../services/individualMembership.service";

import "./IndividualApplicationPage.css";

const formatStatus = (status) => {
  if (!status) return "Not Available";

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const IndividualApplicationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    institutionName: "",
    institutionLocation: "",
    studentOrMemberId: "",
    applicationNotes: "",
  });

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    "Individual Student";

  const fetchApplication = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(false);

      const response =
        await getMyIndividualMembershipApplication();

      setApplication(
        response.hasApplication ? response.application : null
      );
    } catch (error) {
      console.error("Application retrieval error:", error);
      setLoadError(true);
      toast.error("Unable to retrieve your application.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.institutionName.trim()) {
      toast.error("Please enter your institution name.");
      return;
    }

    try {
      setSubmitting(true);

      const response =
        await submitIndividualMembershipApplication({
          institutionName: formData.institutionName.trim(),
          institutionLocation: formData.institutionLocation.trim(),
          studentOrMemberId: formData.studentOrMemberId.trim(),
          applicationNotes: formData.applicationNotes.trim(),
        });

      setApplication(response.application);

      toast.success(
        "Your individual membership application has been submitted!"
      );
    } catch (error) {
      console.error("Application submission error:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to submit your application."
      );

      // Check whether an application was already submitted.
      await fetchApplication();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="individual-application-page">
        <div className="individual-application-loading">
          <RefreshCw size={26} className="individual-spin" />
          <p>Loading your membership application...</p>
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="individual-application-page">
        <div className="individual-application-loading">
          <h2>Unable to load your application</h2>
          <p>Please try again.</p>

          <button type="button" onClick={fetchApplication}>
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (application) {
    const status = application.application_status;

    return (
      <main className="individual-application-page">
        <section className="individual-application-card">
          <div className="individual-application-icon">
            <FileText size={34} />
          </div>

          <h1>Your Membership Application</h1>

          <p>
            Hello {fullName}, your individual student membership
            application has already been submitted.
          </p>

          <div className="individual-existing-application">
            <div>
              <span>Application Status</span>
              <strong>{formatStatus(status)}</strong>
            </div>

            <div>
              <span>Institution</span>
              <strong>
                {application.institution_name || "Not provided"}
              </strong>
            </div>

            <div>
              <span>Membership Number</span>
              <strong>
                {application.membership_number || "Pending approval"}
              </strong>
            </div>

            {application.review_notes && (
              <div>
                <span>Secretariat Feedback</span>
                <strong>{application.review_notes}</strong>
              </div>
            )}
          </div>

          <p className="individual-application-notice">
            {status === "approved"
              ? "Congratulations! Your membership has been approved."
              : status === "rejected"
              ? "Your application was not approved. Please contact the ACSP-Kenya Secretariat for guidance."
              : "Your application is awaiting or undergoing review by the ACSP-Kenya Secretariat."}
          </p>

          {status === "approved" && (
            <button
              type="button"
              onClick={() => navigate("/individual/dashboard")}
            >
              Go to Member Dashboard
            </button>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="individual-application-page">
      <section className="individual-application-card">
        <div className="individual-application-header">
          <div className="individual-application-icon">
            <GraduationCap size={36} />
          </div>

          <span>ACSP-KENYA INDIVIDUAL MEMBERSHIP</span>

          <h1>Individual Student Membership Application</h1>

          <p>
            Complete your details below to apply for individual
            student membership in the Association of County
            Students Presidents – Kenya.
          </p>
        </div>

        <div className="individual-free-membership">
          <strong>FREE MEMBERSHIP</strong>
          <span>
            There is no registration or application fee for
            individual student membership.
          </span>
        </div>

        <div className="individual-applicant-details">
          <span>Applicant</span>
          <strong>{fullName}</strong>

          <span>Email Address</span>
          <strong>{user?.email || "Not available"}</strong>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="individual-form-group">
            <label htmlFor="institutionName">
              Institution Name *
            </label>

            <input
              id="institutionName"
              name="institutionName"
              type="text"
              placeholder="Enter your university or college"
              value={formData.institutionName}
              onChange={handleChange}
              maxLength={200}
              required
            />
          </div>

          <div className="individual-form-group">
            <label htmlFor="institutionLocation">
              Institution Location
            </label>

            <input
              id="institutionLocation"
              name="institutionLocation"
              type="text"
              placeholder="County or town where your institution is located"
              value={formData.institutionLocation}
              onChange={handleChange}
              maxLength={200}
            />
          </div>

          <div className="individual-form-group">
            <label htmlFor="studentOrMemberId">
              Student Registration / Admission Number
            </label>

            <input
              id="studentOrMemberId"
              name="studentOrMemberId"
              type="text"
              placeholder="Enter your student or admission number"
              value={formData.studentOrMemberId}
              onChange={handleChange}
              maxLength={100}
            />
          </div>

          <div className="individual-form-group">
            <label htmlFor="applicationNotes">
              Additional Information
            </label>

            <textarea
              id="applicationNotes"
              name="applicationNotes"
              rows={4}
              placeholder="Tell us anything else relevant to your application (optional)"
              value={formData.applicationNotes}
              onChange={handleChange}
              maxLength={2000}
            />
          </div>

          <button type="submit" disabled={submitting}>
            {submitting
              ? "Submitting Application..."
              : "Submit Membership Application"}
          </button>
        </form>

        <p className="individual-application-footer">
          By submitting this application, you confirm that the
          information provided is accurate and complete.
        </p>
      </section>
    </main>
  );
};

export default IndividualApplicationPage;
