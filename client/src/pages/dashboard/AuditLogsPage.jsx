import { useEffect, useState } from "react";
import {
  Activity,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Filter,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";
import AdminDashboardLayout from "../../components/layouts/admin/AdminDashboardLayout";
import "./AuditLogsPage.css";

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [statistics, setStatistics] = useState({
    totalLogs: 0,
    todayLogs: 0,
    modulesTracked: 0,
    mostCommonAction: null,
  });

  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    module: "",
    action: "",
    from: "",
    to: "",
  });

  const [appliedFilters, setAppliedFilters] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  const fetchStatistics = async () => {
    try {
      const response = await api.get(
        "/admin/audit-logs/statistics"
      );

      setStatistics(response.data.statistics);
    } catch (error) {
      console.error("Audit statistics error:", error);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);

      const response = await api.get("/admin/audit-logs", {
        params: {
          ...appliedFilters,
          page,
          limit: 20,
        },
      });

      setLogs(response.data.logs || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalLogs(response.data.count || 0);
    } catch (error) {
      console.error("Audit logs error:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to load audit logs."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [page, appliedFilters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const applyFilters = (event) => {
    event.preventDefault();

    setPage(1);

    setAppliedFilters({
      ...(filters.search.trim() && {
        search: filters.search.trim(),
      }),
      ...(filters.module && { module: filters.module }),
      ...(filters.action && { action: filters.action }),
      ...(filters.from && {
        from: new Date(filters.from).toISOString(),
      }),
      ...(filters.to && {
        to: new Date(
          `${filters.to}T23:59:59`
        ).toISOString(),
      }),
    });
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      module: "",
      action: "",
      from: "",
      to: "",
    });

    setAppliedFilters({});
    setPage(1);
  };

  const openLogDetails = async (id) => {
    try {
      const response = await api.get(
        `/admin/audit-logs/${id}`
      );

      setSelectedLog(response.data.log);
    } catch (error) {
      toast.error("Unable to retrieve audit log details.");
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-KE", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getActionClass = (action = "") => {
    const value = action.toLowerCase();

    if (
      value.includes("delete") ||
      value.includes("reject") ||
      value.includes("remove")
    ) {
      return "audit-action-danger";
    }

    if (
      value.includes("create") ||
      value.includes("approve") ||
      value.includes("add")
    ) {
      return "audit-action-success";
    }

    if (
      value.includes("update") ||
      value.includes("edit")
    ) {
      return "audit-action-warning";
    }

    return "audit-action-neutral";
  };

  return (
    <AdminDashboardLayout>
      <div className="audit-page">
        <div className="audit-page-header">
          <div>
            <span className="audit-eyebrow">
              SYSTEM MONITORING
            </span>

            <h1>Audit Logs</h1>

            <p>
              Monitor administrative activities and track
              changes across the ACSP-Kenya platform.
            </p>
          </div>

          <button
            className="audit-refresh-btn"
            onClick={() => {
              fetchLogs();
              fetchStatistics();
            }}
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        {/* STATISTICS */}

        <div className="audit-stats-grid">
          <div className="audit-stat-card">
            <div className="audit-stat-icon blue">
              <Activity size={22} />
            </div>

            <div>
              <span>Total Activities</span>
              <h2>{statistics.totalLogs}</h2>
            </div>
          </div>

          <div className="audit-stat-card">
            <div className="audit-stat-icon yellow">
              <Clock size={22} />
            </div>

            <div>
              <span>Activities Today</span>
              <h2>{statistics.todayLogs}</h2>
            </div>
          </div>

          <div className="audit-stat-card">
            <div className="audit-stat-icon green">
              <ShieldCheck size={22} />
            </div>

            <div>
              <span>Modules Tracked</span>
              <h2>{statistics.modulesTracked}</h2>
            </div>
          </div>

          <div className="audit-stat-card">
            <div className="audit-stat-icon purple">
              <FileText size={22} />
            </div>

            <div>
              <span>Most Common Action</span>
              <h2 className="audit-common-action">
                {statistics.mostCommonAction?.action ||
                  "—"}
              </h2>
            </div>
          </div>
        </div>

        {/* FILTERS */}

        <div className="audit-filter-card">
          <div className="audit-section-heading">
            <div>
              <Filter size={19} />
              <h3>Filter Activities</h3>
            </div>
          </div>

          <form
            className="audit-filter-form"
            onSubmit={applyFilters}
          >
            <div className="audit-search-field">
              <Search size={18} />

              <input
                type="text"
                name="search"
                placeholder="Search activities, users or descriptions..."
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>

            <select
              name="module"
              value={filters.module}
              onChange={handleFilterChange}
            >
              <option value="">All Modules</option>
              <option value="system">System</option>
              <option value="membership">Membership</option>
              <option value="events">Events</option>
              <option value="programmes">Programmes</option>
              <option value="announcements">Announcements</option>
              <option value="contact">Contact</option>
              <option value="administrators">Administrators</option>
            </select>

            <select
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
            >
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="approve">Approve</option>
              <option value="reject">Reject</option>
              <option value="login">Login</option>
            </select>

            <div className="audit-date-field">
              <CalendarDays size={17} />
              <input
                type="date"
                name="from"
                value={filters.from}
                onChange={handleFilterChange}
                aria-label="Start date"
              />
            </div>

            <div className="audit-date-field">
              <CalendarDays size={17} />
              <input
                type="date"
                name="to"
                value={filters.to}
                onChange={handleFilterChange}
                aria-label="End date"
              />
            </div>

            <button
              type="submit"
              className="audit-apply-btn"
            >
              Apply Filters
            </button>

            <button
              type="button"
              className="audit-clear-btn"
              onClick={clearFilters}
            >
              Clear
            </button>
          </form>
        </div>

        {/* AUDIT LOG TABLE */}

        <div className="audit-table-card">
          <div className="audit-table-header">
            <div>
              <h3>Activity History</h3>
              <p>
                Showing {logs.length} of {totalLogs} activities
              </p>
            </div>
          </div>

          <div className="audit-table-wrapper">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Administrator</th>
                  <th>Action</th>
                  <th>Module</th>
                  <th>Description</th>
                  <th>Date & Time</th>
                  <th>Details</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="audit-empty">
                      Loading audit logs...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="audit-empty">
                      No audit activities found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <div className="audit-user">
                          <div className="audit-avatar">
                            {(log.user_name ||
                              log.user_email ||
                              "A")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {log.user_name || "Unknown User"}
                            </strong>
                            <span>
                              {log.user_email || "—"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`audit-action-badge ${getActionClass(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>

                      <td>
                        <span className="audit-module">
                          {log.module || log.entity_type || "System"}
                        </span>
                      </td>

                      <td className="audit-description">
                        {log.description || log.action}
                      </td>

                      <td className="audit-date">
                        {formatDate(log.created_at)}
                      </td>

                      <td>
                        <button
                          className="audit-view-btn"
                          onClick={() =>
                            openLogDetails(log.id)
                          }
                          title="View details"
                        >
                          <Eye size={17} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}

          <div className="audit-pagination">
            <span>
              Page {page} of {totalPages}
            </span>

            <div>
              <button
                disabled={page <= 1 || loading}
                onClick={() =>
                  setPage((previous) => previous - 1)
                }
              >
                <ChevronLeft size={17} />
                Previous
              </button>

              <button
                disabled={page >= totalPages || loading}
                onClick={() =>
                  setPage((previous) => previous + 1)
                }
              >
                Next
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </div>

        {/* AUDIT LOG DETAILS MODAL */}

        {selectedLog && (
          <div
            className="audit-modal-overlay"
            onClick={() => setSelectedLog(null)}
          >
            <div
              className="audit-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="audit-modal-header">
                <div>
                  <span>ACTIVITY RECORD</span>
                  <h3>Audit Log Details</h3>
                </div>

                <button
                  onClick={() => setSelectedLog(null)}
                  aria-label="Close details"
                >
                  <X size={21} />
                </button>
              </div>

              <div className="audit-modal-body">
                <div className="audit-detail-item">
                  <span>Administrator</span>
                  <strong>
                    {selectedLog.user_name || "Unknown User"}
                  </strong>
                </div>

                <div className="audit-detail-item">
                  <span>Email Address</span>
                  <strong>
                    {selectedLog.user_email || "—"}
                  </strong>
                </div>

                <div className="audit-detail-item">
                  <span>Action</span>
                  <strong>{selectedLog.action}</strong>
                </div>

                <div className="audit-detail-item">
                  <span>Module</span>
                  <strong>
                    {selectedLog.module || "—"}
                  </strong>
                </div>

                <div className="audit-detail-item">
                  <span>Entity Type</span>
                  <strong>
                    {selectedLog.entity_type || "—"}
                  </strong>
                </div>

                <div className="audit-detail-item">
                  <span>Entity ID</span>
                  <strong>
                    {selectedLog.entity_id || "—"}
                  </strong>
                </div>

                <div className="audit-detail-item">
                  <span>IP Address</span>
                  <strong>
                    {selectedLog.ip_address || "—"}
                  </strong>
                </div>

                <div className="audit-detail-item">
                  <span>Date & Time</span>
                  <strong>
                    {formatDate(selectedLog.created_at)}
                  </strong>
                </div>

                <div className="audit-detail-full">
                  <span>Description</span>
                  <p>
                    {selectedLog.description ||
                      selectedLog.action}
                  </p>
                </div>

                <div className="audit-detail-full">
                  <span>Additional Metadata</span>
                  <pre>
                    {JSON.stringify(
                      selectedLog.metadata || selectedLog.details || {},
                      null,
                      2
                    )}
                  </pre>
                </div>

                <div className="audit-detail-full">
                  <span>User Agent</span>
                  <p>
                    {selectedLog.user_agent || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default AuditLogsPage;