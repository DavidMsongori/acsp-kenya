
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import {
  FileText,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  RefreshCw,
  ShieldCheck,
  Eye,
  X,
  Check,
  Building2,
} from "lucide-react";

import toast from "react-hot-toast";

import api from "../../services/api";
import AdminDashboardLayout from "../../components/layouts/admin/AdminDashboardLayout";

import "./NecDashboardPage.css";

// ==========================================
// FORMATTERS
// ==========================================

const formatStatus = (status) => {
  if (!status) return "Not Available";

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatDate = (date) => {
  if (!date) return "Not Available";

  return new Date(date).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// ==========================================
// NEC DASHBOARD
// ==========================================

const NecDashboardPage = () => {
  const location = useLocation();

  // Determine the active section from the current URL.
  const activeSection = location.pathname.endsWith("/associations")
    ? "associations"
    : location.pathname.endsWith("/applications")
    ? "applications"
    : "dashboard";

  // ==========================================
  // APPLICATIONS STATE
  // ==========================================

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // ==========================================
  // COUNTY ASSOCIATIONS STATE
  // ==========================================

  const [associations, setAssociations] = useState([]);
  const [associationsLoading, setAssociationsLoading] = useState(false);
  const [associationsError, setAssociationsError] = useState("");
  const [associationSearch, setAssociationSearch] = useState("");
  const [associationFilter, setAssociationFilter] = useState("all");

  const [selectedAssociation, setSelectedAssociation] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [verificationSubmitting, setVerificationSubmitting] =
    useState(false);

  // ==========================================
  // FETCH APPLICATIONS
  // ==========================================

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/nec/applications");

      setApplications(response.data.applications || []);
    } catch (err) {
      console.error("NEC applications error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to retrieve applications."
      );

      toast.error("Unable to load applications.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH COUNTY ASSOCIATIONS
  // ==========================================

  const fetchAssociations = async () => {
    try {
      setAssociationsLoading(true);
      setAssociationsError("");

      const response = await api.get("/api/nec/associations");

      setAssociations(response.data.associations || []);
    } catch (err) {
      console.error("NEC associations error:", err);

      setAssociationsError(
        err.response?.data?.message ||
          "Unable to retrieve county associations."
      );

      toast.error("Unable to load county associations.");
    } finally {
      setAssociationsLoading(false);
    }
  };

  // Load the relevant data whenever the URL section changes.
  useEffect(() => {
    if (activeSection === "associations") {
      fetchAssociations();
    } else {
      fetchApplications();
    }
  }, [activeSection]);

  // ==========================================
  // APPLICATION STATISTICS
  // ==========================================

  const statistics = useMemo(
    () => ({
      total: applications.length,
      pending: applications.filter(
        (item) => item.application_status === "pending"
      ).length,
      underReview: applications.filter(
        (item) => item.application_status === "under_review"
      ).length,
      approved: applications.filter(
        (item) => item.application_status === "approved"
      ).length,
      rejected: applications.filter(
        (item) => item.application_status === "rejected"
      ).length,
    }),
    [applications]
  );

  const filteredApplications = applications.filter((item) => {
    const name = item.profiles?.full_name || "";
    const association =
      item.county_associations?.association_name || "";
    const county = item.county_associations?.counties?.name || "";

    const query = search.toLowerCase();

    return (
      name.toLowerCase().includes(query) ||
      association.toLowerCase().includes(query) ||
      county.toLowerCase().includes(query)
    );
  });

  // ==========================================
  // APPLICATION REVIEW
  // ==========================================

  const openApplication = (application) => {
    setSelectedApplication(application);
    setReviewNotes(application.review_notes || "");
  };

  const closeApplication = () => {
    if (reviewSubmitting) return;

    setSelectedApplication(null);
    setReviewNotes("");
  };

  const handleMarkUnderReview = async () => {
    if (!selectedApplication || reviewSubmitting) return;

    try {
      setReviewSubmitting(true);

      const response = await api.patch(
        `/api/nec/applications/${selectedApplication.id}/under-review`
      );

      toast.success(
        response.data.message || "Application marked as under review."
      );

      setSelectedApplication(null);
      setReviewNotes("");

      await fetchApplications();
    } catch (err) {
      console.error("Mark under review error:", err);

      toast.error(
        err.response?.data?.message ||
          "Unable to mark application as under review."
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleReviewApplication = async (decision) => {
    if (!selectedApplication || reviewSubmitting) return;

    if (!["approved", "rejected"].includes(decision)) return;

    if (reviewNotes.length > 2000) {
      toast.error("Review notes cannot exceed 2000 characters.");
      return;
    }

    try {
      setReviewSubmitting(true);

      const response = await api.patch(
        `/api/nec/applications/${selectedApplication.id}/review`,
        {
          decision,
          reviewNotes,
        }
      );

      toast.success(
        response.data.message ||
          `Application ${decision} successfully.`
      );

      setSelectedApplication(null);
      setReviewNotes("");

      await fetchApplications();
    } catch (err) {
      console.error("Application review error:", err);

      toast.error(
        err.response?.data?.message ||
          "Unable to complete application review."
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  // ==========================================
  // ASSOCIATION STATISTICS
  // ==========================================

  const associationStatistics = useMemo(
    () => ({
      total: associations.length,
      pending: associations.filter(
        (item) => item.verification_status === "pending"
      ).length,
      verified: associations.filter(
        (item) => item.verification_status === "verified"
      ).length,
      rejected: associations.filter(
        (item) => item.verification_status === "rejected"
      ).length,
    }),
    [associations]
  );

  // ==========================================
  // ASSOCIATION FILTERING
  // ==========================================

  const filteredAssociations = associations.filter((item) => {
    const name = item.association_name || "";
    const acronym = item.acronym || "";
    const county = item.counties?.name || "";
    const email = item.email || "";
    const phone = item.phone || "";

    const query = associationSearch.toLowerCase();

    const matchesSearch = [
      name,
      acronym,
      county,
      email,
      phone,
    ].some((value) => value.toLowerCase().includes(query));

    const matchesFilter =
      associationFilter === "all" ||
      item.verification_status === associationFilter;

    return matchesSearch && matchesFilter;
  });

  // ==========================================
  // ASSOCIATION REVIEW
  // ==========================================

  const openAssociation = (item) => {
    setSelectedAssociation(item);
    setVerificationNotes(item.verification_notes || "");
  };

  const closeAssociation = () => {
    if (verificationSubmitting) return;

    setSelectedAssociation(null);
    setVerificationNotes("");
  };

  // ==========================================
  // VERIFY OR REJECT ASSOCIATION
  // ==========================================

  const handleVerifyAssociation = async (decision) => {
    if (!selectedAssociation || verificationSubmitting) return;

    if (!["verified", "rejected"].includes(decision)) return;

    if (selectedAssociation.verification_status !== "pending") {
      toast.error("This association has already been reviewed.");
      return;
    }

    if (verificationNotes.length > 2000) {
      toast.error("Verification notes cannot exceed 2000 characters.");
      return;
    }

    try {
      setVerificationSubmitting(true);

      const response = await api.patch(
        `/api/nec/associations/${selectedAssociation.id}/verification`,
        {
          decision,
          verificationNotes,
        }
      );

      toast.success(
        response.data.message ||
          `Association ${decision} successfully.`
      );

      setSelectedAssociation(null);
      setVerificationNotes("");

      await Promise.all([
        fetchAssociations(),
        fetchApplications(),
      ]);
    } catch (err) {
      console.error("Association verification error:", err);

      toast.error(
        err.response?.data?.message ||
          "Unable to complete association verification."
      );
    } finally {
      setVerificationSubmitting(false);
    }
  };

  // ==========================================
  // DASHBOARD STATISTICS CARDS
  // ==========================================

  const statCards = [
    {
      label: "Total Applications",
      value: statistics.total,
      icon: FileText,
      color: "blue",
    },
    {
      label: "Pending",
      value: statistics.pending,
      icon: Clock,
      color: "orange",
    },
    {
      label: "Under Review",
      value: statistics.underReview,
      icon: Users,
      color: "purple",
    },
    {
      label: "Approved",
      value: statistics.approved,
      icon: CheckCircle,
      color: "green",
    },
    {
      label: "Rejected",
      value: statistics.rejected,
      icon: XCircle,
      color: "red",
    },
  ];

  const associationStatCards = [
    {
      label: "Total Associations",
      value: associationStatistics.total,
      icon: Building2,
      color: "blue",
    },
    {
      label: "Pending Verification",
      value: associationStatistics.pending,
      icon: Clock,
      color: "orange",
    },
    {
      label: "Verified Associations",
      value: associationStatistics.verified,
      icon: CheckCircle,
      color: "green",
    },
    {
      label: "Rejected Associations",
      value: associationStatistics.rejected,
      icon: XCircle,
      color: "red",
    },
  ];

  // ==========================================
  // SELECTED RECORD STATUS
  // ==========================================

  const applicationIsDecided =
    selectedApplication &&
    ["approved", "rejected"].includes(
      selectedApplication.application_status
    );

  const association = selectedApplication?.county_associations;
  const applicant = selectedApplication?.profiles;

  const associationIsDecided =
    selectedAssociation &&
    selectedAssociation.verification_status !== "pending";

  // ==========================================
  // APPLICATIONS SECTION
  // ==========================================

  const renderApplications = () => (
    <section className="nec-applications-section">
      <div className="nec-section-heading">
        <div>
          <h2>County President Applications</h2>
          <p>
            Review and manage submitted county association
            presidency applications.
          </p>
        </div>

        <button
          className="nec-refresh-button"
          onClick={fetchApplications}
          disabled={loading}
        >
          <RefreshCw size={17} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="nec-search">
        <Search size={19} />
        <input
          type="search"
          placeholder="Search applicant, association or county..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {loading ? (
        <div className="nec-empty-state">
          Loading applications...
        </div>
      ) : error ? (
        <div className="nec-empty-state">
          <h3>Unable to load applications</h3>
          <p>{error}</p>
          <button onClick={fetchApplications}>Try Again</button>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="nec-empty-state">
          <FileText size={35} />
          <h3>No applications found</h3>
          <p>
            There are no applications matching your search.
          </p>
        </div>
      ) : (
        <div className="nec-table-placeholder">
          <p>
            {filteredApplications.length} application(s) retrieved
            successfully.
          </p>

          {filteredApplications.map((item) => (
            <div
              className="nec-application-preview"
              key={item.id}
            >
              <strong>
                {item.profiles?.full_name || "Unknown applicant"}
              </strong>

              <span>
                {item.county_associations?.association_name}
              </span>

              <span>
                {item.county_associations?.counties?.name}
              </span>

              <span>
                {formatStatus(item.application_status)}
              </span>

              <button
                type="button"
                className="nec-view-button"
                onClick={() => openApplication(item)}
              >
                <Eye size={16} />
                Review
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  // ==========================================
  // COUNTY ASSOCIATIONS SECTION
  // ==========================================

  const renderAssociations = () => (
    <>
      <section className="nec-statistics nec-association-statistics">
        {associationStatCards.map((card) => {
          const Icon = card.icon;

          return (
            <div className="nec-stat-card" key={card.label}>
              <div className={`nec-stat-icon ${card.color}`}>
                <Icon size={22} />
              </div>

              <div>
                <span>{card.label}</span>
                <h3>{card.value}</h3>
              </div>
            </div>
          );
        })}
      </section>

      <section className="nec-applications-section">
        <div className="nec-section-heading">
          <div>
            <h2>County Association Register</h2>
            <p>
              Review association details and independently verify
              county associations.
            </p>
          </div>

          <button
            className="nec-refresh-button"
            onClick={fetchAssociations}
            disabled={associationsLoading}
          >
            <RefreshCw size={17} />
            {associationsLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="nec-association-toolbar">
          <div className="nec-search">
            <Search size={19} />
            <input
              type="search"
              placeholder="Search association, acronym, county or contact..."
              value={associationSearch}
              onChange={(event) =>
                setAssociationSearch(event.target.value)
              }
            />
          </div>

          <select
            className="nec-association-filter"
            value={associationFilter}
            onChange={(event) =>
              setAssociationFilter(event.target.value)
            }
          >
            <option value="all">All Associations</option>
            <option value="pending">Pending Verification</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {associationsLoading ? (
          <div className="nec-empty-state">
            Loading county associations...
          </div>
        ) : associationsError ? (
          <div className="nec-empty-state">
            <h3>Unable to load associations</h3>
            <p>{associationsError}</p>
            <button onClick={fetchAssociations}>Try Again</button>
          </div>
        ) : filteredAssociations.length === 0 ? (
          <div className="nec-empty-state">
            <Building2 size={35} />
            <h3>No associations found</h3>
            <p>
              No county associations match the selected search or filter.
            </p>
          </div>
        ) : (
          <div className="nec-association-list">
            <p className="nec-association-count">
              {filteredAssociations.length} association(s) found
            </p>

            {filteredAssociations.map((item) => (
              <div className="nec-association-preview" key={item.id}>
                <div className="nec-association-identity">
                  {item.logo_url ? (
                    <img
                      src={item.logo_url}
                      alt={`${item.association_name} logo`}
                      className="nec-association-logo"
                    />
                  ) : (
                    <div className="nec-association-logo nec-review-placeholder">
                      <Building2 size={23} />
                    </div>
                  )}

                  <div>
                    <strong>{item.association_name}</strong>
                    <span>{item.acronym || "No acronym provided"}</span>
                  </div>
                </div>

                <div className="nec-association-detail">
                  <span>County</span>
                  <strong>
                    {item.counties?.name || "Not Available"}
                  </strong>
                </div>

                <div className="nec-association-detail">
                  <span>Contact</span>
                  <strong>
                    {item.phone || item.email || "Not Available"}
                  </strong>
                </div>

                <div className="nec-association-status">
                  <span
                    className={`nec-status-badge ${
                      item.verification_status || "pending"
                    }`}
                  >
                    {formatStatus(item.verification_status)}
                  </span>
                </div>

                <button
                  type="button"
                  className="nec-view-button"
                  onClick={() => openAssociation(item)}
                >
                  <Eye size={16} />
                  {item.verification_status === "pending"
                    ? "Review"
                    : "View"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );

  // ==========================================
  // MAIN DASHBOARD CONTENT
  // ==========================================

  return (
    <AdminDashboardLayout
      title={
        activeSection === "associations"
          ? "County Associations"
          : activeSection === "applications"
          ? "Applications"
          : "NEC Dashboard"
      }
      subtitle="Manage county presidency applications and association verification."
    >
      <div className="nec-content">
        {activeSection === "dashboard" && (
          <>
            <section className="nec-welcome">
              <div>
                <span>ACSP-KENYA ADMINISTRATION</span>
                <h2>Welcome to the NEC Portal</h2>
                <p>
                  Review applications, verify county associations and
                  manage national leadership records.
                </p>
              </div>

              <ShieldCheck size={65} />
            </section>

            <section className="nec-statistics">
              {statCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div className="nec-stat-card" key={card.label}>
                    <div className={`nec-stat-icon ${card.color}`}>
                      <Icon size={22} />
                    </div>

                    <div>
                      <span>{card.label}</span>
                      <h3>{card.value}</h3>
                    </div>
                  </div>
                );
              })}
            </section>

            {renderApplications()}
          </>
        )}

        {activeSection === "applications" && renderApplications()}

        {activeSection === "associations" && renderAssociations()}
      </div>

      {/* ======================================
          APPLICATION REVIEW MODAL
      ====================================== */}

      {selectedApplication && (
        <div
          className="nec-modal-overlay"
          onClick={closeApplication}
        >
          <div
            className="nec-review-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="nec-modal-header">
              <div>
                <span>ACSP-KENYA · NEC REVIEW</span>
                <h2>Application Details</h2>
                <p>
                  Review the applicant and county association information.
                </p>
              </div>

              <button
                type="button"
                className="nec-modal-close"
                onClick={closeApplication}
                disabled={reviewSubmitting}
                aria-label="Close application review"
              >
                <X size={22} />
              </button>
            </div>

            <div className="nec-modal-body">
              <section className="nec-review-section">
                <h3>Applicant Information</h3>

                <div className="nec-review-person">
                  {applicant?.photo_url ? (
                    <img
                      src={applicant.photo_url}
                      alt="Applicant"
                      className="nec-review-photo"
                    />
                  ) : (
                    <div className="nec-review-photo nec-review-placeholder">
                      <Users size={28} />
                    </div>
                  )}

                  <div>
                    <h4>
                      {applicant?.full_name || "Unknown applicant"}
                    </h4>
                    <p>County Association President Applicant</p>
                  </div>
                </div>

                <div className="nec-review-grid">
                  <div>
                    <span>Full Name</span>
                    <strong>
                      {applicant?.full_name || "Not Available"}
                    </strong>
                  </div>

                  <div>
                    <span>Phone Number</span>
                    <strong>
                      {applicant?.phone || "Not Available"}
                    </strong>
                  </div>

                  <div>
                    <span>Application Date</span>
                    <strong>
                      {formatDate(selectedApplication.created_at)}
                    </strong>
                  </div>

                  <div>
                    <span>Presidential Term</span>
                    <strong>
                      {formatDate(selectedApplication.term_start)} –{" "}
                      {formatDate(selectedApplication.term_end)}
                    </strong>
                  </div>
                </div>
              </section>

              <section className="nec-review-section">
                <h3>County Association Information</h3>

                <div className="nec-review-person">
                  {association?.logo_url ? (
                    <img
                      src={association.logo_url}
                      alt="Association logo"
                      className="nec-review-logo"
                    />
                  ) : (
                    <div className="nec-review-logo nec-review-placeholder">
                      <ShieldCheck size={28} />
                    </div>
                  )}

                  <div>
                    <h4>
                      {association?.association_name || "Not Available"}
                    </h4>
                    <p>
                      {association?.acronym ||
                        "Association acronym unavailable"}
                    </p>
                  </div>
                </div>

                <div className="nec-review-grid">
                  <div>
                    <span>County</span>
                    <strong>
                      {association?.counties?.name || "Not Available"}
                    </strong>
                  </div>

                  <div>
                    <span>Association Acronym</span>
                    <strong>
                      {association?.acronym || "Not Available"}
                    </strong>
                  </div>

                  <div>
                    <span>Association Email</span>
                    <strong>
                      {association?.email || "Not Available"}
                    </strong>
                  </div>

                  <div>
                    <span>Association Phone</span>
                    <strong>
                      {association?.phone || "Not Available"}
                    </strong>
                  </div>
                </div>
              </section>

              <section className="nec-review-section">
                <h3>Verification Status</h3>

                <div className="nec-review-statuses">
                  <div>
                    <span>Application Status</span>
                    <strong
                      className={`nec-status-badge ${selectedApplication.application_status}`}
                    >
                      {formatStatus(selectedApplication.application_status)}
                    </strong>
                  </div>

                  <div>
                    <span>Association Verification</span>
                    <strong
                      className={`nec-status-badge ${
                        association?.verification_status || "pending"
                      }`}
                    >
                      {formatStatus(association?.verification_status)}
                    </strong>
                  </div>

                  <div>
                    <span>President Verification</span>
                    <strong
                      className={`nec-status-badge ${
                        selectedApplication.status || "pending"
                      }`}
                    >
                      {formatStatus(selectedApplication.status)}
                    </strong>
                  </div>
                </div>
              </section>

              <section className="nec-review-section">
                <h3>NEC Review Notes</h3>

                <textarea
                  className="nec-review-textarea"
                  placeholder="Enter review observations, recommendations or reasons for rejection..."
                  value={reviewNotes}
                  onChange={(event) => setReviewNotes(event.target.value)}
                  maxLength={2000}
                  rows={5}
                  disabled={applicationIsDecided || reviewSubmitting}
                />

                <div className="nec-review-character-count">
                  {reviewNotes.length}/2000 characters
                </div>

                {selectedApplication.reviewed_at && (
                  <p className="nec-last-reviewed">
                    Last reviewed:{" "}
                    {formatDate(selectedApplication.reviewed_at)}
                  </p>
                )}
              </section>

              {applicationIsDecided ? (
                <div className="nec-review-final-status">
                  <ShieldCheck size={20} />
                  This application has already been decided. No further
                  review action is available.
                </div>
              ) : (
                <div className="nec-review-actions">
                  <button
                    type="button"
                    className="nec-review-under-review"
                    onClick={handleMarkUnderReview}
                    disabled={reviewSubmitting}
                  >
                    <Clock size={17} />
                    {reviewSubmitting
                      ? "Processing..."
                      : "Mark Under Review"}
                  </button>

                  <div className="nec-review-decision-actions">
                    <button
                      type="button"
                      className="nec-review-reject"
                      onClick={() => handleReviewApplication("rejected")}
                      disabled={reviewSubmitting}
                    >
                      <X size={17} />
                      Reject
                    </button>

                    <button
                      type="button"
                      className="nec-review-approve"
                      onClick={() => handleReviewApplication("approved")}
                      disabled={reviewSubmitting}
                    >
                      <Check size={17} />
                      Approve
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================
          COUNTY ASSOCIATION VERIFICATION MODAL
      ====================================== */}

      {selectedAssociation && (
        <div
          className="nec-modal-overlay"
          onClick={closeAssociation}
        >
          <div
            className="nec-review-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="nec-modal-header">
              <div>
                <span>ACSP-KENYA · NEC VERIFICATION</span>
                <h2>Association Verification</h2>
                <p>
                  Review the county association details before making
                  a verification decision.
                </p>
              </div>

              <button
                type="button"
                className="nec-modal-close"
                onClick={closeAssociation}
                disabled={verificationSubmitting}
                aria-label="Close association verification"
              >
                <X size={22} />
              </button>
            </div>

            <div className="nec-modal-body">
              <section className="nec-review-section">
                <h3>Association Information</h3>

                <div className="nec-review-person">
                  {selectedAssociation.logo_url ? (
                    <img
                      src={selectedAssociation.logo_url}
                      alt="County association logo"
                      className="nec-review-logo"
                    />
                  ) : (
                    <div className="nec-review-logo nec-review-placeholder">
                      <Building2 size={28} />
                    </div>
                  )}

                  <div>
                    <h4>{selectedAssociation.association_name}</h4>
                    <p>
                      {selectedAssociation.acronym ||
                        "No acronym provided"}
                    </p>
                  </div>
                </div>

                <div className="nec-review-grid">
                  <div>
                    <span>County</span>
                    <strong>
                      {selectedAssociation.counties?.name ||
                        "Not Available"}
                    </strong>
                  </div>

                  <div>
                    <span>County Code</span>
                    <strong>
                      {selectedAssociation.counties?.code ||
                        "Not Available"}
                    </strong>
                  </div>

                  <div>
                    <span>Association Email</span>
                    <strong>
                      {selectedAssociation.email || "Not Available"}
                    </strong>
                  </div>

                  <div>
                    <span>Association Phone</span>
                    <strong>
                      {selectedAssociation.phone || "Not Available"}
                    </strong>
                  </div>

                  <div>
                    <span>Submission Date</span>
                    <strong>
                      {formatDate(selectedAssociation.created_at)}
                    </strong>
                  </div>

                  <div>
                    <span>Last Updated</span>
                    <strong>
                      {formatDate(selectedAssociation.updated_at)}
                    </strong>
                  </div>
                </div>
              </section>

              <section className="nec-review-section">
                <h3>Association Verification Status</h3>

                <div className="nec-review-statuses nec-association-modal-status">
                  <div>
                    <span>Current Status</span>
                    <strong
                      className={`nec-status-badge ${
                        selectedAssociation.verification_status || "pending"
                      }`}
                    >
                      {formatStatus(
                        selectedAssociation.verification_status
                      )}
                    </strong>
                  </div>
                </div>
              </section>

              <section className="nec-review-section">
                <h3>NEC Verification Notes</h3>

                <textarea
                  className="nec-review-textarea"
                  placeholder="Enter verification observations or reasons for rejection..."
                  value={verificationNotes}
                  onChange={(event) =>
                    setVerificationNotes(event.target.value)
                  }
                  maxLength={2000}
                  rows={5}
                  disabled={
                    associationIsDecided || verificationSubmitting
                  }
                />

                <div className="nec-review-character-count">
                  {verificationNotes.length}/2000 characters
                </div>

                {selectedAssociation.verified_at && (
                  <p className="nec-last-reviewed">
                    Verified on:{" "}
                    {formatDate(selectedAssociation.verified_at)}
                  </p>
                )}
              </section>

              {associationIsDecided ? (
                <div className="nec-review-final-status">
                  <ShieldCheck size={20} />
                  This association has already been reviewed. No further
                  verification action is available.
                </div>
              ) : (
                <div className="nec-review-actions nec-association-actions">
                  <div className="nec-association-warning">
                    <ShieldCheck size={19} />
                    Association verification is separate from county
                    president verification and activation.
                  </div>

                  <div className="nec-review-decision-actions">
                    <button
                      type="button"
                      className="nec-review-reject"
                      onClick={() => handleVerifyAssociation("rejected")}
                      disabled={verificationSubmitting}
                    >
                      <X size={17} />
                      {verificationSubmitting ? "Processing..." : "Reject"}
                    </button>

                    <button
                      type="button"
                      className="nec-review-approve"
                      onClick={() => handleVerifyAssociation("verified")}
                      disabled={verificationSubmitting}
                    >
                      <Check size={17} />
                      {verificationSubmitting
                        ? "Processing..."
                        : "Verify Association"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminDashboardLayout>
  );
};

export default NecDashboardPage;
