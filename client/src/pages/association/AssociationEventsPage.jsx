
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Search,
  RefreshCw,
  MapPin,
  Clock,
  Users,
  Globe,
  ArrowLeft,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";

import toast from "react-hot-toast";

import PresidentDashboardLayout from "../../components/layouts/president/PresidentDashboardLayout";
import {
  getPublishedEvents,
  getPublishedEventById,
} from "../../services/association.events.service";

import "./AssociationEventsPage.css";

const AssociationEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);

      const response = await getPublishedEvents();
      setEvents(response.events || []);
    } catch (error) {
      console.error("Fetch association events error:", error);

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

  const formatDate = (date) => {
    if (!date) return "Date not specified";

    return new Date(date).toLocaleString("en-KE", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Africa/Nairobi",
    });
  };

  const formatCategory = (category) => {
    if (!category) return "General Event";

    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getAudienceLabel = (audience) => {
    if (audience === "members_only") return "Members Only";
    if (audience === "both") return "Public & Members";
    return "Public";
  };

  const filteredEvents = useMemo(() => {
    const now = new Date();

    return events.filter((event) => {
      const eventDate = new Date(event.event_date);

      const searchText = [
        event.title,
        event.description,
        event.venue,
        event.county,
        event.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      const isPast = event.event_end_date
        ? new Date(event.event_end_date) < now
        : eventDate < now;

      const matchesPeriod =
        period === "all" ||
        (period === "upcoming" && !isPast) ||
        (period === "past" && isPast);

      return matchesSearch && matchesPeriod;
    });
  }, [events, search, period]);

  const openEventDetails = async (event) => {
    try {
      setDetailsLoading(true);

      const response = await getPublishedEventById(event.id);
      setSelectedEvent(response.event);
    } catch (error) {
      console.error("Load event details error:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to load event details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const upcomingCount = events.filter((event) => {
    const endDate = event.event_end_date
      ? new Date(event.event_end_date)
      : new Date(event.event_date);

    return endDate >= new Date();
  }).length;

  const pastCount = events.length - upcomingCount;

  return (
    <PresidentDashboardLayout
      title="Association Events"
      subtitle="Explore published ACSP-Kenya events, programmes and engagements."
    >
      <div className="association-events-page">
        {selectedEvent ? (
          <div className="association-event-details">
            <button
              type="button"
              className="association-event-back"
              onClick={() => setSelectedEvent(null)}
            >
              <ArrowLeft size={17} />
              Back to Events
            </button>

            {selectedEvent.featured_image ? (
              <img
                src={selectedEvent.featured_image}
                alt={selectedEvent.title}
                className="association-event-detail-image"
              />
            ) : (
              <div className="association-event-detail-placeholder">
                <CalendarDays size={48} />
              </div>
            )}

            <div className="association-event-detail-content">
              <span className="association-event-category">
                {formatCategory(selectedEvent.category)}
              </span>

              <h2>{selectedEvent.title}</h2>

              <div className="association-event-meta">
                <span>
                  <CalendarDays size={17} />
                  {formatDate(selectedEvent.event_date)}
                </span>

                {selectedEvent.event_end_date && (
                  <span>
                    <Clock size={17} />
                    Ends: {formatDate(selectedEvent.event_end_date)}
                  </span>
                )}

                <span>
                  <MapPin size={17} />
                  {selectedEvent.venue || "Venue not specified"}
                  {selectedEvent.county
                    ? `, ${selectedEvent.county}`
                    : ""}
                </span>

                <span>
                  {selectedEvent.audience === "members_only" ? (
                    <Users size={17} />
                  ) : (
                    <Globe size={17} />
                  )}
                  {getAudienceLabel(selectedEvent.audience)}
                </span>
              </div>

              <div className="association-event-description">
                <h3>About This Event</h3>
                <p>
                  {selectedEvent.description ||
                    "No event description is available."}
                </p>
              </div>

              {selectedEvent.capacity && (
                <p className="association-event-extra">
                  <Users size={17} />
                  Maximum capacity: {selectedEvent.capacity} participants
                </p>
              )}

              {selectedEvent.registration_deadline && (
                <p className="association-event-extra">
                  <Clock size={17} />
                  Registration deadline:{" "}
                  {formatDate(selectedEvent.registration_deadline)}
                </p>
              )}

              {selectedEvent.registration_open &&
                selectedEvent.registration_url && (
                  <a
                    href={selectedEvent.registration_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="association-event-register"
                  >
                    Register for Event
                    <ExternalLink size={16} />
                  </a>
                )}
            </div>
          </div>
        ) : (
          <>
            <div className="association-events-heading">
              <div>
                <span className="association-events-eyebrow">
                  ACSP-KENYA PROGRAMMES
                </span>
                <h2>Events & Engagements</h2>
                <p>
                  Stay informed about upcoming events, national programmes
                  and association engagements.
                </p>
              </div>

              <button
                type="button"
                className="association-events-refresh"
                onClick={fetchEvents}
                disabled={loading}
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>

            <div className="association-events-summary">
              <div className="association-events-stat">
                <CalendarDays size={22} />
                <div>
                  <span>Published Events</span>
                  <strong>{events.length}</strong>
                </div>
              </div>

              <div className="association-events-stat">
                <Clock size={22} />
                <div>
                  <span>Upcoming Events</span>
                  <strong>{upcomingCount}</strong>
                </div>
              </div>

              <div className="association-events-stat">
                <Users size={22} />
                <div>
                  <span>Past Events</span>
                  <strong>{pastCount}</strong>
                </div>
              </div>
            </div>

            <div className="association-events-toolbar">
              <div className="association-events-search">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search events, venues or counties..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="all">All Events</option>
                <option value="upcoming">Upcoming Events</option>
                <option value="past">Past Events</option>
              </select>
            </div>

            {loading ? (
              <div className="association-events-loading">
                <RefreshCw size={24} />
                <p>Loading published events...</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="association-events-empty">
                <CalendarDays size={42} />
                <h3>No events found</h3>
                <p>
                  There are currently no events matching your search.
                </p>
              </div>
            ) : (
              <div className="association-events-grid">
                {filteredEvents.map((event) => (
                  <article
                    className="association-event-card"
                    key={event.id}
                  >
                    <div className="association-event-card-image">
                      {event.featured_image ? (
                        <img
                          src={event.featured_image}
                          alt={event.title}
                          loading="lazy"
                        />
                      ) : (
                        <div className="association-event-image-placeholder">
                          <ImageIcon size={36} />
                        </div>
                      )}

                      <span className="association-event-card-category">
                        {formatCategory(event.category)}
                      </span>
                    </div>

                    <div className="association-event-card-content">
                      <span className="association-event-card-date">
                        <CalendarDays size={15} />
                        {formatDate(event.event_date)}
                      </span>

                      <h3>{event.title}</h3>

                      <p className="association-event-card-description">
                        {event.description ||
                          "More information about this event will be available soon."}
                      </p>

                      <div className="association-event-card-location">
                        <MapPin size={15} />
                        <span>
                          {event.venue || "Venue not specified"}
                          {event.county ? `, ${event.county}` : ""}
                        </span>
                      </div>

                      <div className="association-event-card-footer">
                        <span>
                          {getAudienceLabel(event.audience)}
                        </span>

                        <button
                          type="button"
                          onClick={() => openEventDetails(event)}
                          disabled={detailsLoading}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </PresidentDashboardLayout>
  );
};

export default AssociationEventsPage;
