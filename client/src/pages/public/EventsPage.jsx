import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  MapPin,
  Clock,
  ArrowRight,
  RefreshCw,
  Globe,
  Users,
  CalendarCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

import api from "../../services/api";

import "./EventsPage.css";

function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/events");

      setEvents(response.data.events || []);
    } catch (err) {
      console.error("Fetch public events error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load events at the moment."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const now = new Date();

  const categorizedEvents = useMemo(() => {
    const upcoming = [];
    const ongoing = [];
    const past = [];

    events.forEach((event) => {
      const start = new Date(event.event_date);
      const end = event.event_end_date
        ? new Date(event.event_end_date)
        : start;

      if (event.status === "cancelled") {
        past.push({ ...event, displayCategory: "cancelled" });
      } else if (event.status === "completed" || end < now) {
        past.push({ ...event, displayCategory: "past" });
      } else if (start <= now && end >= now) {
        ongoing.push({ ...event, displayCategory: "ongoing" });
      } else {
        upcoming.push({ ...event, displayCategory: "upcoming" });
      }
    });

    upcoming.sort(
      (a, b) => new Date(a.event_date) - new Date(b.event_date)
    );

    ongoing.sort(
      (a, b) => new Date(a.event_date) - new Date(b.event_date)
    );

    past.sort(
      (a, b) => new Date(b.event_date) - new Date(a.event_date)
    );

    return { upcoming, ongoing, past };
  }, [events]);

  const visibleEvents = useMemo(() => {
    if (activeFilter === "all") {
      return [
        ...categorizedEvents.ongoing,
        ...categorizedEvents.upcoming,
        ...categorizedEvents.past,
      ];
    }

    return categorizedEvents[activeFilter] || [];
  }, [activeFilter, categorizedEvents]);

  const formatDate = (date) => {
    if (!date) return "Date to be announced";

    return new Date(date).toLocaleDateString("en-KE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString("en-KE", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getAudienceLabel = (audience) => {
    if (audience === "members_only") return "ACSP Members Only";
    if (audience === "both") return "Public & Members";
    return "Open to Everyone";
  };

  const getCategoryLabel = (category) => {
    if (category === "ongoing") return "Ongoing";
    if (category === "past") return "Completed";
    if (category === "cancelled") return "Cancelled";
    return "Upcoming";
  };

  const EventCard = ({ event }) => (
    <article className="public-event-card">
      <div className="public-event-image">
        {event.featured_image ? (
          <img src={event.featured_image} alt={event.title} />
        ) : (
          <div className="public-event-image-placeholder">
            <CalendarDays size={42} />
            <span>ACSP-Kenya Event</span>
          </div>
        )}

        <span
          className={`public-event-category ${event.displayCategory}`}
        >
          {getCategoryLabel(event.displayCategory)}
        </span>
      </div>

      <div className="public-event-card-content">
        <div className="public-event-date">
          <CalendarDays size={15} />
          {formatDate(event.event_date)}
        </div>

        <h3>{event.title}</h3>

        <p className="public-event-description">
          {event.description
            ? `${event.description.slice(0, 145)}${
                event.description.length > 145 ? "..." : ""
              }`
            : "Discover more about this ACSP-Kenya event."}
        </p>

        <div className="public-event-meta">
          <span>
            <MapPin size={15} />
            {event.venue || "Venue to be announced"}
          </span>

          <span>
            <Clock size={15} />
            {formatTime(event.event_date)}
          </span>
        </div>

        <div className="public-event-audience">
          {event.audience === "members_only" ? (
            <Users size={14} />
          ) : (
            <Globe size={14} />
          )}
          {getAudienceLabel(event.audience)}
        </div>

        <Link
          to={`/events/${event.id}`}
          className="public-event-details-link"
        >
          View Event Details
          <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );

  return (
    <main className="public-events-page">
      <section className="events-hero">
        <div className="events-hero-pattern" />

        <div className="events-hero-content">
          <span className="events-eyebrow">
            CONNECT · PARTICIPATE · LEAD
          </span>

          <h1>
            Our <span>Events</span>
          </h1>

          <p>
            Discover upcoming ACSP-Kenya events, leadership engagements,
            conferences and opportunities bringing together student
            leaders from across Kenya.
          </p>

         <Link to="/programs" className="events-hero-button">
  <CalendarCheck size={17} />
  Explore Our Programs
</Link>
        </div>
      </section>

      <section className="public-events-content" id="events-list">
        <div className="events-section-heading">
          <div>
            <span className="events-section-eyebrow">
              BE PART OF THE EXPERIENCE
            </span>

            <h2>Explore Our Events</h2>

            <p>
              Stay informed, participate and connect with the ACSP-Kenya
              student leadership community.
            </p>
          </div>

          <div className="events-total">
            <CalendarDays size={19} />
            <span>{events.length} Events</span>
          </div>
        </div>

        <div className="events-filter-tabs">
          <button
            className={activeFilter === "all" ? "active" : ""}
            onClick={() => setActiveFilter("all")}
          >
            All Events
          </button>

          <button
            className={activeFilter === "upcoming" ? "active" : ""}
            onClick={() => setActiveFilter("upcoming")}
          >
            Upcoming ({categorizedEvents.upcoming.length})
          </button>

          <button
            className={activeFilter === "ongoing" ? "active" : ""}
            onClick={() => setActiveFilter("ongoing")}
          >
            Ongoing ({categorizedEvents.ongoing.length})
          </button>

          <button
            className={activeFilter === "past" ? "active" : ""}
            onClick={() => setActiveFilter("past")}
          >
            Past Events ({categorizedEvents.past.length})
          </button>
        </div>

        {loading ? (
          <div className="public-events-state">
            <RefreshCw className="events-loading-spinner" size={26} />
            <p>Loading ACSP-Kenya events...</p>
          </div>
        ) : error ? (
          <div className="public-events-state events-error">
            <p>{error}</p>
            <button onClick={fetchEvents}>Try Again</button>
          </div>
        ) : visibleEvents.length === 0 ? (
          <div className="public-events-state">
            <CalendarDays size={38} />
            <h3>No events available</h3>
            <p>There are currently no events in this category.</p>
          </div>
        ) : (
          <div className="public-events-grid">
            {visibleEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default EventsPage;