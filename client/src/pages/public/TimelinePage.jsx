
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  RefreshCw,
  CalendarCheck,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

import api from "../../services/api";

import "./TimelinePage.css";

const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "leadership_governance", label: "Leadership & Governance" },
  { value: "education_capacity_building", label: "Education & Capacity Building" },
  { value: "county_engagements", label: "County Engagements" },
  { value: "national_events", label: "National Events" },
  { value: "conferences_summits", label: "Conferences & Summits" },
  { value: "community_outreach", label: "Community Outreach" },
  { value: "sports_cultural", label: "Sports & Cultural" },
  { value: "other", label: "Other" },
];

const getKenyaDateParts = (date) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date(date));

  const values = {};

  parts.forEach((part) => {
    if (part.type !== "literal") {
      values[part.type] = Number(part.value);
    }
  });

  return values;
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Nairobi",
  });

const formatTime = (date) =>
  new Date(date).toLocaleTimeString("en-KE", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Africa/Nairobi",
  });

function TimelinePage() {
  const currentYear = getKenyaDateParts(new Date()).year;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedYear, setSelectedYear] = useState(2027);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/events");
      setEvents(response.data.events || []);
    } catch (err) {
      console.error("Timeline events error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load the annual events calendar."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const yearEvents = useMemo(() => {
    return events.filter((event) => {
      const parts = getKenyaDateParts(event.event_date);

      return (
        parts.year === selectedYear &&
        (selectedCategory === "all" ||
          event.category === selectedCategory)
      );
    });
  }, [events, selectedYear, selectedCategory]);

  const monthEvents = useMemo(() => {
    const grouped = Array.from({ length: 12 }, () => []);

    yearEvents.forEach((event) => {
      const parts = getKenyaDateParts(event.event_date);
      grouped[parts.month - 1].push(event);
    });

    grouped.forEach((items) =>
      items.sort(
        (a, b) => new Date(a.event_date) - new Date(b.event_date)
      )
    );

    return grouped;
  }, [yearEvents]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();

    return yearEvents
      .filter(
        (event) =>
          event.status !== "cancelled" &&
          event.status !== "completed" &&
          new Date(event.event_end_date || event.event_date) >= now
      )
      .sort(
        (a, b) => new Date(a.event_date) - new Date(b.event_date)
      );
  }, [yearEvents]);

  const selectedMonthEvents =
    selectedMonth === null ? [] : monthEvents[selectedMonth];

  const getEventStatus = (event) => {
    if (event.status === "cancelled") return "Cancelled";
    if (event.status === "completed") return "Completed";

    const now = new Date();
    const start = new Date(event.event_date);
    const end = new Date(event.event_end_date || event.event_date);

    if (start <= now && end >= now) return "Ongoing";
    if (end < now) return "Completed";

    return "Upcoming";
  };

  const getCategoryLabel = (category) =>
    CATEGORIES.find((item) => item.value === category)?.label || "Other";

  const changeYear = (direction) => {
    setSelectedYear((year) => year + direction);
    setSelectedMonth(null);
  };

  const renderMonth = (monthIndex) => {
    const firstDay = new Date(
      selectedYear,
      monthIndex,
      1
    ).getDay();

    const daysInMonth = new Date(
      selectedYear,
      monthIndex + 1,
      0
    ).getDate();

    const cells = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(day);
    }

    return (
      <button
        type="button"
        className={`timeline-month-card ${
          selectedMonth === monthIndex ? "selected" : ""
        }`}
        key={monthIndex}
        onClick={() =>
          setSelectedMonth((current) =>
            current === monthIndex ? null : monthIndex
          )
        }
      >
        <div className="timeline-month-heading">
          <h3>{MONTHS[monthIndex]}</h3>
          <span>{monthEvents[monthIndex].length} events</span>
        </div>

        <div className="timeline-calendar">
          {["S", "M", "T", "W", "T", "F", "S"].map(
            (day, index) => (
              <span className="timeline-weekday" key={index}>
                {day}
              </span>
            )
          )}

          {cells.map((day, index) => {
            const hasEvent =
              day &&
              monthEvents[monthIndex].some((event) => {
                const parts = getKenyaDateParts(event.event_date);
                return parts.day === day;
              });

            return (
              <span
                key={index}
                className={`timeline-day ${
                  hasEvent ? "has-event" : ""
                }`}
              >
                {day || ""}
              </span>
            );
          })}
        </div>
      </button>
    );
  };

  return (
    <main className="timeline-page">
      <section className="timeline-hero">
        <div className="timeline-hero-content">
          <span className="timeline-eyebrow">
            PLAN · PARTICIPATE · PROGRESS
          </span>

          <h1>
            Our <span>Timeline</span>
          </h1>

          <p>
            Explore the ACSP-Kenya annual calendar of events,
            leadership engagements, conferences and activities
            bringing student leaders together across Kenya.
          </p>

          <Link to="/programs" className="timeline-hero-button">
  <CalendarDays size={18} />
  Explore our Programs
</Link>
        </div>
      </section>

      <section className="timeline-content" id="annual-calendar">
        <div className="timeline-section-heading">
          <div>
            <span className="timeline-section-eyebrow">
              OUR YEAR AT A GLANCE
            </span>
            <h2>Annual Events Calendar</h2>
            <p>
              Select a month to explore scheduled ACSP-Kenya events.
            </p>
          </div>

          <div className="timeline-year-control">
            <button
              type="button"
              onClick={() => changeYear(-1)}
              aria-label="Previous year"
            >
              <ChevronLeft size={20} />
            </button>

            <strong>{selectedYear}</strong>

            <button
              type="button"
              onClick={() => changeYear(1)}
              aria-label="Next year"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="timeline-filters">
          <label htmlFor="timeline-category">
            Filter by category
          </label>

          <select
            id="timeline-category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>

          <span>
            {yearEvents.length} events scheduled in {selectedYear}
          </span>
        </div>

        {loading ? (
          <div className="timeline-state">
            <RefreshCw size={28} className="events-loading-spinner" />
            <p>Loading annual calendar...</p>
          </div>
        ) : error ? (
          <div className="timeline-state timeline-error">
            <p>{error}</p>
            <button type="button" onClick={fetchEvents}>
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="timeline-month-grid">
              {MONTHS.map((_, index) => renderMonth(index))}
            </div>

            {selectedMonth !== null && (
              <section className="timeline-month-events">
                <div className="timeline-detail-heading">
                  <div>
                    <span>MONTHLY SCHEDULE</span>
                    <h2>
                      {MONTHS[selectedMonth]} {selectedYear}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedMonth(null)}
                  >
                    Close
                  </button>
                </div>

                {selectedMonthEvents.length === 0 ? (
                  <p className="timeline-no-events">
                    No events scheduled for this month.
                  </p>
                ) : (
                  <div className="timeline-event-list">
                    {selectedMonthEvents.map((event) => (
                      <article
                        className="timeline-event-item"
                        key={event.id}
                      >
                        <div className="timeline-event-date">
                          <CalendarDays size={20} />
                          <span>{formatDate(event.event_date)}</span>
                        </div>

                        <div className="timeline-event-information">
                          <span className="timeline-event-category">
                            {getCategoryLabel(event.category)}
                          </span>

                          <h3>{event.title}</h3>

                          <p>
                            {event.description ||
                              "Discover more about this ACSP-Kenya event."}
                          </p>

                          <div className="timeline-event-meta">
                            <span>
                              <MapPin size={15} />
                              {event.venue || "Venue to be announced"}
                            </span>

                            <span>
                              <Clock size={15} />
                              {formatTime(event.event_date)}
                            </span>
                          </div>

                          <span
                            className={`timeline-event-status ${getEventStatus(
                              event
                            ).toLowerCase()}`}
                          >
                            {getEventStatus(event)}
                          </span>

                          <Link to={`/events/${event.id}`}>
                            View Event Details <ArrowRight size={15} />
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}

            <section className="timeline-upcoming">
              <div className="timeline-upcoming-heading">
                <div>
                  <span className="timeline-section-eyebrow">
                    WHAT'S AHEAD
                  </span>
                  <h2>Upcoming Events</h2>
                </div>

                <CalendarCheck size={28} />
              </div>

              {upcomingEvents.length === 0 ? (
                <p className="timeline-no-events">
                  No upcoming events scheduled for {selectedYear}.
                </p>
              ) : (
                <div className="timeline-upcoming-list">
                  {upcomingEvents.slice(0, 6).map((event) => (
                    <article key={event.id}>
                      <div className="timeline-upcoming-date">
                        <strong>
                          {getKenyaDateParts(event.event_date).day}
                        </strong>
                        <span>
                          {MONTHS[
                            getKenyaDateParts(event.event_date).month - 1
                          ].slice(0, 3)}
                        </span>
                      </div>

                      <div>
                        <h3>{event.title}</h3>
                        <p>
                          <MapPin size={14} />
                          {event.venue || "Venue to be announced"}
                        </p>
                      </div>

                      <Link to={`/events/${event.id}`} aria-label={`View ${event.title}`}>
                        <ArrowRight size={18} />
                      </Link>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </section>
    </main>
  );
}

export default TimelinePage;
