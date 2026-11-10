
import { useEffect, useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  X,
  Building2,
  UserRound,
  CalendarDays,
  FileText,
  Check,
  AlertCircle,
} from "lucide-react";

import toast from "react-hot-toast";

import api from "../../services/api";
import AdminDashboardLayout from "../../components/layouts/admin/AdminDashboardLayout";

import "./MembersManagementPage.css";

const MembersManagementPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);

      const response = await api.get("/admin/membership/applications");

      setApplications(response.data.applications || []);

      if (selectedApplication) {
        const updated = (response.data.applications || []).find(
          (item) => item.id === selectedApplication.id
        );

        setSelectedApplication(updated || null);
      }
    } catch (error) {
      console.error("Fetch membership applications error:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to load membership applications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filteredApplications = applications.filter((application) => {
    const applicant = application.profiles || {};

    const searchText = [
      applicant.full_name,
      applicant.phone,
      application.membership_number,
      application.institution_name,
      application.application_type,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchText.includes(search.toLowerCase());

    const matchesStatus =
      status === "all" || application.application_status === status;

    return matchesSearch && matchesStatus;
  });

  const openPreview = (application) => {
    setSelectedApplication(application);
    setReviewNotes(application.review_notes || "");
  };

  const markUnderReview = async () => {
    if (!selectedApplication) return;

    try {
      setProcessing(true);

      const response = await api.patch(
        `/admin/membership/applications/${selectedApplication.id}/under-review`
      );

      toast.success(
        response.data.message || "Application marked under review."
      );

      await fetchApplications();
    } catch (error) {
      console.error("Mark under review error:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to update application status."
      );
    } finally {
      setProcessing(false);
    }
  };

  const reviewApplication = async (decision) => {
    if (!selectedApplication) return;

    const action = decision === "approved" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this membership application?`
    );

    if (!confirmed) return;

    try {
      setProcessing(true);

      const response = await api.patch(
        `/admin/membership/applications/${selectedApplication.id}/review`,
        {
          decision,
          reviewNotes,
        }
      );

      toast.success(
        response.data.message ||
          `Application ${decision} successfully.`
      );

      await fetchApplications();

      setSelectedApplication(null);
      setReviewNotes("");
    } catch (error) {
      console.error("Membership review error:", error);

      toast.error(
        error.response?.data?.message ||
          `Unable to ${action} this application.`
      );
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-KE", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const isReviewable = selectedApplication &&
    ["pending", "under_review"].includes(
      selectedApplication.application_status
    );

  return (
    <AdminDashboardLayout
      title="Presidents & Members"
      subtitle="Manage registered members and formal ACSP-Kenya membership applications."
    >
      <div className="members-management-page">
        <div className="members-page-heading">
          <div>
            <h2>Membership Management</h2>
            <p>
              Review applications, verify eligibility and manage approved
              membership records.
            </p>
          </div>

          <button
            type="button"
            className="members-refresh-btn"
            onClick={fetchApplications}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="members-summary-grid">
          <div className="members-summary-card">
            <Users size={21} />
            <span>Total Applications</span>
            <strong>{applications.length}</strong>
          </div>

          <div className="members-summary-card">
            <Clock size={21} />
            <span>Pending Review</span>
            <strong>
              {applications.filter(
                (item) => item.application_status === "pending"
              ).length}
            </strong>
          </div>

          <div className="members-summary-card">
            <Eye size={21} />
            <span>Under Review</span>
            <strong>
              {applications.filter(
                (item) => item.application_status === "under_review"
              ).length}
            </strong>
          </div>

          <div className="members-summary-card">
            <CheckCircle size={21} />
            <span>Approved Members</span>
            <strong>
              {applications.filter(
                (item) => item.application_status === "approved"
              ).length}
            </strong>
          </div>
        </div>

        <div className="members-applications-section">
          <div className="members-section-heading">
            <div>
              <h3>Membership Applications</h3>
              <p>Review and manage formal membership requests.</p>
            </div>
          </div>

          <div className="members-filters">
            <div className="members-search">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search by name, phone, institution or membership number..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="all">All Applications</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {loading ? (
            <div className="members-loading">
              <RefreshCw className="spin" size={22} />
              <span>Loading membership applications...</span>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="members-empty">
              <Users size={35} />
              <h3>No membership applications found</h3>
              <p>
                Applications will appear here when people apply for formal
                ACSP-Kenya membership.
              </p>
            </div>
          ) : (
            <div className="members-table-wrapper">
              <table className="members-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Application Type</th>
                    <th>Institution</th>
                    <th>Membership No.</th>
                    <th>Applied On</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredApplications.map((application) => (
                    <tr key={application.id}>
                      <td>
                        <strong>
                          {application.profiles?.full_name || "Unknown"}
                        </strong>

                        <small>
                          {application.profiles?.phone || "No phone"}
                        </small>
                      </td>

                      <td>
                        {application.application_type === "individual_student"
                          ? "Individual Student"
                          : "County Association"}
                      </td>

                      <td>
                        {application.institution_name || "Not provided"}
                      </td>

                      <td>
                        {application.membership_number || "Pending approval"}
                      </td>

                      <td>
                        {application.created_at
                          ? new Date(application.created_at).toLocaleDateString(
                              "en-KE"
                            )
                          : "—"}
                      </td>

                      <td>
                        <span
                          className={`membership-status membership-status-${application.application_status}`}
                        >
                          {application.application_status.replaceAll("_", " ")}
                        </span>
                      </td>

                      <td>
                        <div className="members-row-actions">
                          <button
                            type="button"
                            className="members-view-btn"
                            onClick={() => openPreview(application)}
                          >
                            <Eye size={16} />
                            View
                          </button>

                          {["pending", "under_review"].includes(
                            application.application_status
                          ) && (
                            <>
                              <button
                                type="button"
                                className="members-approve-btn"
                                onClick={() => {
                                  openPreview(application);
                                  setReviewNotes("");
                                }}
                              >
                                <Check size={15} />
                                Review
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedApplication && (
          <div
            className="members-modal-overlay"
            onClick={() => {
              if (!processing) setSelectedApplication(null);
            }}
          >
            <div
              className="members-preview-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="members-modal-header">
                <div>
                  <span className="members-modal-eyebrow">
                    <FileText size={14} />
                    MEMBERSHIP APPLICATION
                  </span>

                  <h2>Application Details</h2>

                  <p>
                    Review the applicant's information and make a decision.
                  </p>
                </div>

                <button
                  type="button"
                  className="members-modal-close"
                  onClick={() => setSelectedApplication(null)}
                  disabled={processing}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="members-modal-body">
                <div className="members-preview-status">
                  <span
                    className={`membership-status membership-status-${selectedApplication.application_status}`}
                  >
                    {selectedApplication.application_status.replaceAll("_", " ")}
                  </span>

                  <span>
                    {selectedApplication.application_type === "individual_student"
                      ? "Individual Student"
                      : "County Association"}
                  </span>
                </div>

                <section className="members-detail-section">
                  <h3>
                    <UserRound size={17} />
                    Applicant Information
                  </h3>

                  <div className="members-detail-grid">
                    <div>
                      <span>Full Name</span>
                      <strong>
                        {selectedApplication.profiles?.full_name || "Not provided"}
                      </strong>
                    </div>

                    <div>
                      <span>Phone Number</span>
                      <strong>
                        {selectedApplication.profiles?.phone || "Not provided"}
                      </strong>
                    </div>

                    <div>
                      <span>Application Date</span>
                      <strong>
                        {formatDate(selectedApplication.created_at)}
                      </strong>
                    </div>

                    <div>
                      <span>Membership Number</span>
                      <strong>
                        {selectedApplication.membership_number || "Not yet assigned"}
                      </strong>
                    </div>
                  </div>
                </section>

                <section className="members-detail-section">
                  <h3>
                    <Building2 size={17} />
                    Institution Information
                  </h3>

                  <div className="members-detail-grid">
                    <div>
                      <span>Institution</span>
                      <strong>
                        {selectedApplication.institution_name || "Not provided"}
                      </strong>
                    </div>

                    <div>
                      <span>Institution Location</span>
                      <strong>
                        {selectedApplication.institution_location || "Not provided"}
                      </strong>
                    </div>

                    <div>
                      <span>Student / Member ID</span>
                      <strong>
                        {selectedApplication.student_or_member_id || "Not provided"}
                      </strong>
                    </div>

                    <div>
                      <span>Membership Category</span>
                      <strong>
                        {selectedApplication.membership_category || "Ordinary"}
                      </strong>
                    </div>
                  </div>
                </section>

                <section className="members-detail-section">
                  <h3>
                    <FileText size={17} />
                    Application Statement
                  </h3>

                  <p className="members-application-notes">
                    {selectedApplication.application_notes ||
                      "No additional statement provided."}
                  </p>
                </section>

                <section className="members-detail-section">
                  <h3>
                    <CalendarDays size={17} />
                    Review Information
                  </h3>

                  <div className="members-detail-grid">
                    <div>
                      <span>Last Reviewed</span>
                      <strong>
                        {formatDate(selectedApplication.reviewed_at)}
                      </strong>
                    </div>
                  </div>

                  <p className="members-application-notes">
                    {selectedApplication.review_notes ||
                      "No review notes have been added."}
                  </p>
                </section>

                {isReviewable && (
                  <section className="members-review-section">
                    <h3>Administrative Review</h3>

                    <label htmlFor="membership-review-notes">
                      Review Notes / Feedback
                    </label>

                    <textarea
                      id="membership-review-notes"
                      rows={4}
                      maxLength={2000}
                      placeholder="Enter review feedback or reasons for rejection..."
                      value={reviewNotes}
                      onChange={(event) => setReviewNotes(event.target.value)}
                    />

                    <small>{reviewNotes.length}/2000 characters</small>
                  </section>
                )}
              </div>

              <div className="members-modal-footer">
                <button
                  type="button"
                  className="members-cancel-btn"
                  onClick={() => setSelectedApplication(null)}
                  disabled={processing}
                >
                  Close
                </button>

                {isReviewable && (
                  <>
                    {selectedApplication.application_status === "pending" && (
                      <button
                        type="button"
                        className="members-under-review-btn"
                        onClick={markUnderReview}
                        disabled={processing}
                      >
                        <Clock size={16} />
                        Mark Under Review
                      </button>
                    )}

                    <button
                      type="button"
                      className="members-reject-btn"
                      onClick={() => reviewApplication("rejected")}
                      disabled={processing}
                    >
                      <XCircle size={16} />
                      Reject
                    </button>

                    <button
                      type="button"
                      className="members-approve-btn"
                      onClick={() => reviewApplication("approved")}
                      disabled={processing}
                    >
                      <CheckCircle size={16} />
                      Approve
                    </button>
                  </>
                )}

                {!isReviewable && (
                  <span className="members-final-status">
                    <AlertCircle size={15} />
                    This application has already been decided.
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default MembersManagementPage;
