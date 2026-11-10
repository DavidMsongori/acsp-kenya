
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import PresidentDashboardLayout from "../../components/layouts/president/PresidentDashboardLayout";
import { getMyApplication } from "../../services/application.service";

import "./AssociationPage.css";

const formatStatus = (status) => {
  if (!status) return "Pending";

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const AssociationPage = () => {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchAssociation = async () => {
      try {
        const response = await getMyApplication();

        if (mounted) {
          setApplication(
            response.hasApplication ? response.application : null
          );
        }
      } catch (error) {
        console.error("Association loading error:", error);
        toast.error("Unable to load your County Association details.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAssociation();

    return () => {
      mounted = false;
    };
  }, []);

  const association = application?.county_associations;

  return (
    <PresidentDashboardLayout
      title="My County Association"
      subtitle="View your County Association profile and registration details."
    >
      <div className="association-page">
        {loading ? (
          <div className="association-message-card">
            <p>Loading your County Association details...</p>
          </div>
        ) : !application ? (
          <div className="association-message-card">
            <h2>No Association Application Found</h2>
            <p>
              You have not submitted a County Association application yet.
              Submit your application to get started.
            </p>
            <Link to="/application" className="association-primary-button">
              Submit Application
            </Link>
          </div>
        ) : !association ? (
          <div className="association-message-card">
            <h2>Association Details Unavailable</h2>
            <p>
              Your application exists, but the associated County Association
              details could not be retrieved.
            </p>
            <Link to="/application" className="association-secondary-link">
              View Application Status
            </Link>
          </div>
        ) : (
          <>
            <section className="association-profile-card">
              <div className="association-identity">
                <div className="association-logo">
                  {association.logo_url ? (
                    <img
                      src={association.logo_url}
                      alt={`${association.association_name} logo`}
                    />
                  ) : (
                    <span>
                      {association.acronym ||
                        association.association_name?.slice(0, 2) ||
                        "AC"}
                    </span>
                  )}
                </div>

                <div className="association-identity-details">
                  <span className="association-eyebrow">
                    COUNTY ASSOCIATION PROFILE
                  </span>

                  <h1>{association.association_name}</h1>

                  <p>
                    {association.acronym || "County Association"}
                  </p>
                </div>
              </div>

              <div className="association-status-group">
                <div className="association-status-item">
                  <span>Application Status</span>
                  <strong className={`association-status ${application.application_status || "pending"}`}>
                    {formatStatus(application.application_status)}
                  </strong>
                </div>

                <div className="association-status-item">
                  <span>Verification Status</span>
                  <strong className={`association-status ${association.verification_status || "pending"}`}>
                    {formatStatus(association.verification_status)}
                  </strong>
                </div>
              </div>
            </section>

            <section className="association-details-card">
              <div className="association-section-heading">
                <h2>Association Information</h2>
                <p>Official details registered with ACSP-Kenya.</p>
              </div>

              <div className="association-details-grid">
                <div className="association-detail">
                  <span>Association Name</span>
                  <strong>{association.association_name || "Not provided"}</strong>
                </div>

                <div className="association-detail">
                  <span>Acronym</span>
                  <strong>{association.acronym || "Not provided"}</strong>
                </div>

                <div className="association-detail">
                  <span>County</span>
                  <strong>{association.counties?.name || "Not available"}</strong>
                </div>

                <div className="association-detail">
                  <span>County Code</span>
                  <strong>{association.counties?.code || "Not available"}</strong>
                </div>

                <div className="association-detail">
                  <span>Official Email</span>
                  <strong>{association.email || "Not provided"}</strong>
                </div>

                <div className="association-detail">
                  <span>Official Phone</span>
                  <strong>{association.phone || "Not provided"}</strong>
                </div>
              </div>
            </section>

            <section className="association-details-card">
              <div className="association-section-heading">
                <h2>Presidential Application</h2>
                <p>Information relating to your County President application.</p>
              </div>

              <div className="association-details-grid">
                <div className="association-detail">
                  <span>Application Submitted</span>
                  <strong>
                    {application.created_at
                      ? new Date(application.created_at).toLocaleDateString()
                      : "Not available"}
                  </strong>
                </div>

                <div className="association-detail">
                  <span>Term Start</span>
                  <strong>{application.term_start || "Not set"}</strong>
                </div>

                <div className="association-detail">
                  <span>Term End</span>
                  <strong>{application.term_end || "Not set"}</strong>
                </div>
              </div>

              {application.review_notes && (
                <div className="association-review-notes">
                  <h3>Review Notes</h3>
                  <p>{application.review_notes}</p>
                </div>
              )}

              <div className="association-page-actions">
                <Link to="/application" className="association-secondary-link">
                  View Application Details
                </Link>
              </div>
            </section>
          </>
        )}
      </div>
    </PresidentDashboardLayout>
  );
};

export default AssociationPage;
