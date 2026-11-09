import { useEffect, useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
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

  const fetchApplications = async () => {
    try {
      setLoading(true);

      const response = await api.get("/admin/membership/applications");

      setApplications(response.data.applications || []);
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
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchText.includes(search.toLowerCase());

    const matchesStatus =
      status === "all" || application.application_status === status;

    return matchesSearch && matchesStatus;
  });

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
              {
                applications.filter(
                  (item) => item.application_status === "pending"
                ).length
              }
            </strong>
          </div>

          <div className="members-summary-card">
            <Eye size={21} />
            <span>Under Review</span>
            <strong>
              {
                applications.filter(
                  (item) => item.application_status === "under_review"
                ).length
              }
            </strong>
          </div>

          <div className="members-summary-card">
            <CheckCircle size={21} />
            <span>Approved Members</span>
            <strong>
              {
                applications.filter(
                  (item) => item.application_status === "approved"
                ).length
              }
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
                placeholder="Search by name, phone or membership number..."
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
                        <button
                          type="button"
                          className="members-view-btn"
                          title="View application"
                          onClick={() =>
                            toast("Application details will be available next.")
                          }
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default MembersManagementPage;