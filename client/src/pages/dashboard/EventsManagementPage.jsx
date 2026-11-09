import { useEffect, useState } from "react";
import {
  CalendarDays,
  Plus,
  Search,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Globe,
  Users,
} from "lucide-react";

import toast from "react-hot-toast";

import api from "../../services/api";
import AdminDashboardLayout from "../../components/layouts/admin/AdminDashboardLayout";

import "./EventsManagementPage.css";

const EventsManagementPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const fetchEvents = async () => {
    try {
      setLoading(true);

      const response = await api.get("/admin/events");

      setEvents(response.data.events || []);
    } catch (error) {
      console.error("Fetch events error:", error);

      toast.error(
        error.response?.data?.message || "Unable to load events."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const searchText = [
      event.title,
      event.venue,
      event.description,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchText.includes(search.toLowerCase());

    const matchesStatus =
      status === "all" ||
      event.status === status ||
      event.publication_status === status;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (date) => {
    if (!date) return "Date not set";

    return new Date(date).toLocaleString("en-KE", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getAudienceLabel = (audience) => {
    if (audience === "members_only") return "Members Only";
    if (audience === "both") return "Public & Members";
    return "Public";
  };

  return (
    <AdminDashboardLayout
      title="Events Management"
      subtitle="Create, publish and manage ACSP-Kenya events and registrations."
    >
      <div className="events-management-page">
        <div className="events-page-heading">
          <div>
            <h2>Event Management</h2>
            <p>
              Manage event details, publication, audiences and registration.
            </p>
          </div>

          <button
            type="button"
            className="events-refresh-btn"
            onClick={fetchEvents}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="events-summary-grid">
          <div className="events-summary-card">
            <CalendarDays size={21} />
            <span>Total Events</span>
            <strong>{events.length}</strong>
          </div>

          <div className="events-summary-card">
            <CheckCircle size={21} />
            <span>Published</span>
            <strong>
              {events.filter(
                (event) => event.publication_status === "published"
              ).length}
            </strong>
          </div>

          <div className="events-summary-card">
            <Clock size={21} />
            <span>Drafts</span>
            <strong>
              {events.filter(
                (event) => event.publication_status === "draft"
              ).length}
            </strong>
          </div>

          <div className="events-summary-card">
            <XCircle size={21} />
            <span>Cancelled</span>
            <strong>
              {events.filter((event) => event.status === "cancelled").length}
            </strong>
          </div>
        </div>

        <div className="events-toolbar">
          <div className="events-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search events by title or venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All Events</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            type="button"
            className="events-create-btn"
            onClick={() => toast("Event creation form will be added next.")}
          >
            <Plus size={17} />
            Create Event
          </button>
        </div>

        <div className="events-table-wrapper">
          {loading ? (
            <div className="events-loading">Loading events...</div>
          ) : filteredEvents.length === 0 ? (
            <div className="events-empty">
              <CalendarDays size={36} />
              <h3>No events found</h3>
              <p>Events you create will appear here.</p>
            </div>
          ) : (
            <table className="events-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date & Venue</th>
                  <th>Audience</th>
                  <th>Publication</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <strong>{event.title}</strong>
                    </td>

                    <td>
                      <span>{formatDate(event.event_date)}</span>
                      <small>{event.venue || "Venue not specified"}</small>
                    </td>

                    <td>
                      <span className="events-audience">
                        {event.audience === "members_only" ? (
                          <Users size={14} />
                        ) : (
                          <Globe size={14} />
                        )}
                        {getAudienceLabel(event.audience)}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`events-status-badge ${event.publication_status}`}
                      >
                        {event.publication_status}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`events-status-badge ${event.status}`}
                      >
                        {event.status}
                      </span>
                    </td>

                    <td>
                      <div className="events-action-buttons">
                        <button
                          type="button"
                          title="View"
                          onClick={() =>
                            toast("Event details will be added next.")
                          }
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          title="Edit"
                          onClick={() =>
                            toast("Event editing will be added next.")
                          }
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          title="Delete"
                          onClick={() =>
                            toast("Event deletion will be added next.")
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default EventsManagementPage;