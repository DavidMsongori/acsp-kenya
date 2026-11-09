
import { useEffect, useMemo, useState } from "react";
import {
  Users,
  ShieldCheck,
  UserPlus,
  Search,
  RefreshCw,
  Mail,
  Phone,
  CalendarDays,
  X,
  CheckCircle2,
  Clock3,
  AlertCircle,
} from "lucide-react";

import toast from "react-hot-toast";

import api from "../../services/api";
import AdminDashboardLayout from "../../components/layouts/admin/AdminDashboardLayout";

import "./AdministratorsManagementPage.css";

const AdministratorsManagementPage = () => {
  const [administrators, setAdministrators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
  });

  const fetchAdministrators = async () => {
    try {
      setLoading(true);

      const response = await api.get("/admin/administrators");

      setAdministrators(response.data.administrators || []);
    } catch (error) {
      console.error("Fetch administrators error:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to load administrators."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdministrators();
  }, []);

  const filteredAdministrators = useMemo(() => {
    return administrators.filter((admin) => {
      const searchText = [
        admin.full_name,
        admin.email,
        admin.phone,
        admin.role,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchText.includes(
        search.toLowerCase()
      );

      const matchesRole =
        roleFilter === "all" || admin.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" ||
        admin.account_status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [administrators, search, roleFilter, statusFilter]);

  const superAdmins = administrators.filter(
    (admin) => admin.role === "super_admin"
  ).length;

  const necAdmins = administrators.filter(
    (admin) => admin.role === "nec_admin"
  ).length;

  const activeAdmins = administrators.filter(
    (admin) => admin.account_status === "active"
  ).length;

  const invitedAdmins = administrators.filter(
    (admin) => admin.account_status === "invited"
  ).length;

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleInvite = async (event) => {
    event.preventDefault();

    if (!formData.full_name.trim() || !formData.email.trim()) {
      toast.error("Full name and email are required.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await api.post(
        "/admin/administrators",
        {
          full_name: formData.full_name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
        }
      );

      toast.success(
        response.data.message ||
          "Administrator invitation sent successfully."
      );

      setFormData({
        full_name: "",
        email: "",
        phone: "",
      });

      setShowInviteModal(false);

      await fetchAdministrators();
    } catch (error) {
      console.error("Invite administrator error:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to invite administrator."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-KE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getRoleLabel = (role) => {
    if (role === "super_admin") return "Super Administrator";
    if (role === "nec_admin") return "NEC Administrator";

    return role;
  };

  const getStatusLabel = (status) => {
    if (status === "active") return "Active";
    if (status === "invited") return "Invitation Pending";

    return "Unavailable";
  };

  return (
    <AdminDashboardLayout>
      <div className="administrators-page">
        <div className="administrators-header">
          <div>
            <span className="administrators-eyebrow">
              SYSTEM MANAGEMENT
            </span>

            <h1>Administrators</h1>

            <p>
              Manage system administrators, monitor account status
              and control administrative access.
            </p>
          </div>

          <div className="administrators-header-actions">
            <button
              type="button"
              className="administrators-refresh-btn"
              onClick={fetchAdministrators}
              disabled={loading}
            >
              <RefreshCw size={17} />
              Refresh
            </button>

            <button
              type="button"
              className="administrators-primary-btn"
              onClick={() => setShowInviteModal(true)}
            >
              <UserPlus size={18} />
              Invite Administrator
            </button>
          </div>
        </div>

        <div className="administrators-stats">
          <div className="administrator-stat-card">
            <div className="administrator-stat-icon blue">
              <Users size={22} />
            </div>

            <div>
              <span>Total Administrators</span>
              <strong>{administrators.length}</strong>
            </div>
          </div>

          <div className="administrator-stat-card">
            <div className="administrator-stat-icon yellow">
              <ShieldCheck size={22} />
            </div>

            <div>
              <span>Super Administrators</span>
              <strong>{superAdmins}</strong>
            </div>
          </div>

          <div className="administrator-stat-card">
            <div className="administrator-stat-icon purple">
              <ShieldCheck size={22} />
            </div>

            <div>
              <span>NEC Administrators</span>
              <strong>{necAdmins}</strong>
            </div>
          </div>

          <div className="administrator-stat-card">
            <div className="administrator-stat-icon green">
              <CheckCircle2 size={22} />
            </div>

            <div>
              <span>Active Accounts</span>
              <strong>{activeAdmins}</strong>
            </div>
          </div>
        </div>

        <div className="administrators-secondary-stats">
          <span>
            <Clock3 size={16} />
            {invitedAdmins} pending invitation
            {invitedAdmins === 1 ? "" : "s"}
          </span>

          <span>
            <Users size={16} />
            {administrators.length} administrator records
          </span>
        </div>

        <div className="administrators-content-card">
          <div className="administrators-toolbar">
            <div className="administrators-search">
              <Search size={18} />

              <input
                type="search"
                placeholder="Search by name, email, phone or role..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="administrators-filters">
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="super_admin">
                  Super Administrators
                </option>
                <option value="nec_admin">
                  NEC Administrators
                </option>
              </select>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="invited">Invitation Pending</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>

          <div className="administrators-table-heading">
            <div>
              <h2>Administrator Directory</h2>
              <p>
                A record of users with administrative privileges.
              </p>
            </div>

            <span>
              {filteredAdministrators.length} results
            </span>
          </div>

          {loading ? (
            <div className="administrators-loading">
              <RefreshCw className="administrators-spinner" size={25} />
              <p>Loading administrators...</p>
            </div>
          ) : filteredAdministrators.length === 0 ? (
            <div className="administrators-empty">
              <Users size={38} />

              <h3>No administrators found</h3>

              <p>
                No administrator records match your search or filters.
              </p>
            </div>
          ) : (
            <div className="administrators-table-wrapper">
              <table className="administrators-table">
                <thead>
                  <tr>
                    <th>Administrator</th>
                    <th>Role</th>
                    <th>Account Status</th>
                    <th>Assignment Source</th>
                    <th>Date Assigned</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAdministrators.map((admin) => (
                    <tr key={admin.id}>
                      <td>
                        <div className="administrator-identity">
                          {admin.photo_url ? (
                            <img
                              src={admin.photo_url}
                              alt={admin.full_name}
                            />
                          ) : (
                            <div className="administrator-avatar">
                              {admin.full_name
                                ?.charAt(0)
                                .toUpperCase() || "A"}
                            </div>
                          )}

                          <div>
                            <strong>{admin.full_name}</strong>

                            <span>
                              <Mail size={13} />
                              {admin.email || "No email available"}
                            </span>

                            {admin.phone && (
                              <span>
                                <Phone size={13} />
                                {admin.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`administrator-role-badge ${admin.role}`}
                        >
                          {getRoleLabel(admin.role)}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`administrator-status-badge ${admin.account_status}`}
                        >
                          {admin.account_status === "active" ? (
                            <CheckCircle2 size={14} />
                          ) : admin.account_status === "invited" ? (
                            <Clock3 size={14} />
                          ) : (
                            <AlertCircle size={14} />
                          )}

                          {getStatusLabel(admin.account_status)}
                        </span>
                      </td>

                      <td>
                        <div className="administrator-source">
                          {admin.role_source === "national_secretariat"
                            ? "National Secretariat"
                            : "Manual Assignment"}
                        </div>
                      </td>

                      <td>
                        <span className="administrator-date">
                          <CalendarDays size={14} />
                          {formatDate(admin.created_at)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showInviteModal && (
          <div
            className="administrator-modal-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setShowInviteModal(false);
              }
            }}
          >
            <div className="administrator-modal">
              <div className="administrator-modal-header">
                <div>
                  <span>ADMINISTRATOR ACCESS</span>
                  <h2>Invite Super Administrator</h2>
                  <p>
                    An invitation email will be sent to the new
                    administrator.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  aria-label="Close invitation form"
                >
                  <X size={21} />
                </button>
              </div>

              <form onSubmit={handleInvite}>
                <div className="administrator-form-group">
                  <label htmlFor="admin-full-name">
                    Full Name <span>*</span>
                  </label>

                  <input
                    id="admin-full-name"
                    name="full_name"
                    type="text"
                    placeholder="Enter administrator's full name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    maxLength={200}
                    required
                  />
                </div>

                <div className="administrator-form-group">
                  <label htmlFor="admin-email">
                    Email Address <span>*</span>
                  </label>

                  <input
                    id="admin-email"
                    name="email"
                    type="email"
                    placeholder="administrator@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    maxLength={255}
                    required
                  />
                </div>

                <div className="administrator-form-group">
                  <label htmlFor="admin-phone">
                    Phone Number
                  </label>

                  <input
                    id="admin-phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    maxLength={30}
                  />
                </div>

                <div className="administrator-invitation-notice">
                  <ShieldCheck size={19} />

                  <p>
                    This invitation grants <strong>Super Administrator</strong>
                    {" "}access. The recipient will need to accept the
                    invitation and complete account setup.
                  </p>
                </div>

                <div className="administrator-modal-actions">
                  <button
                    type="button"
                    className="administrator-cancel-btn"
                    onClick={() => setShowInviteModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="administrators-primary-btn"
                    disabled={submitting}
                  >
                    <Mail size={17} />

                    {submitting
                      ? "Sending Invitation..."
                      : "Send Invitation"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default AdministratorsManagementPage;
