
import { useEffect, useState } from "react";
import { X, CalendarDays, Save } from "lucide-react";

const initialForm = {
  title: "",
  description: "",
  category: "other",
  venue: "",
  county: "",
  eventDate: "",
  eventEndDate: "",
  registrationDeadline: "",
  capacity: "",
  featuredImage: "",
  audience: "public",
  registrationUrl: "",
  registrationOpen: true,
};

const categories = [
  { value: "leadership_governance", label: "Leadership and Governance" },
  { value: "education_capacity_building", label: "Education and Capacity Building" },
  { value: "county_engagements", label: "County Engagements" },
  { value: "national_events", label: "National Events" },
  { value: "conferences_summits", label: "Conferences and Summits" },
  { value: "community_outreach", label: "Community and Outreach" },
  { value: "sports_cultural", label: "Sports and Cultural Activities" },
  { value: "other", label: "Other" },
];

const counties = [
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu",
  "Taita Taveta", "Garissa", "Wajir", "Mandera", "Marsabit",
  "Isiolo", "Meru", "Tharaka Nithi", "Embu", "Kitui",
  "Machakos", "Makueni", "Nyandarua", "Nyeri", "Kirinyaga",
  "Murang'a", "Kiambu", "Turkana", "West Pokot", "Samburu",
  "Trans Nzoia", "Uasin Gishu", "Elgeyo Marakwet", "Nandi",
  "Baringo", "Laikipia", "Nakuru", "Narok", "Kajiado",
  "Kericho", "Bomet", "Kakamega", "Vihiga", "Bungoma",
  "Busia", "Siaya", "Kisumu", "Homa Bay", "Migori",
  "Kisii", "Nyamira", "Nairobi",
];

const toLocalDateTime = (value) => {
  if (!value) return "";

  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - offset)
    .toISOString()
    .slice(0, 16);
};

const EventForm = ({ event, onClose, onSubmit, saving }) => {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!event) {
      setForm(initialForm);
      return;
    }

    setForm({
      title: event.title || "",
      description: event.description || "",
      category: event.category || "other",
      venue: event.venue || "",
      county: event.county || "",
      eventDate: toLocalDateTime(event.event_date),
      eventEndDate: toLocalDateTime(event.event_end_date),
      registrationDeadline: toLocalDateTime(event.registration_deadline),
      capacity: event.capacity ?? "",
      featuredImage: event.featured_image || "",
      audience: event.audience || "public",
      registrationUrl: event.registration_url || "",
      registrationOpen: event.registration_open ?? true,
    });
  }, [event]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      form.eventEndDate &&
      new Date(form.eventEndDate) < new Date(form.eventDate)
    ) {
      return;
    }

    onSubmit(form);
  };

  return (
    <div className="event-form-overlay" onClick={onClose}>
      <div
        className="event-form-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="event-form-header">
          <div>
            <span className="event-form-eyebrow">
              <CalendarDays size={15} /> ACSP-KENYA EVENTS
            </span>
            <h2>{event ? "Edit Event" : "Create New Event"}</h2>
            <p>
              {event
                ? "Update the event information below."
                : "Add an event to the ACSP-Kenya annual calendar."}
            </p>
          </div>

          <button
            type="button"
            className="event-form-close"
            onClick={onClose}
            aria-label="Close form"
          >
            <X size={20} />
          </button>
        </div>

        <form className="event-form" onSubmit={handleSubmit}>
          <div className="event-form-section">
            <h3>Event Information</h3>

            <label>
              Event Title *
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter event title"
                required
              />
            </label>

            <div className="event-form-grid">
              <label>
                Category
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                County
                <select
                  name="county"
                  value={form.county}
                  onChange={handleChange}
                >
                  <option value="">National / Not specified</option>
                  {counties.map((county) => (
                    <option key={county} value={county}>
                      {county}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label>
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the event..."
              />
            </label>
          </div>

          <div className="event-form-section">
            <h3>Date and Venue</h3>

            <div className="event-form-grid">
              <label>
                Start Date and Time *
                <input
                  type="datetime-local"
                  name="eventDate"
                  value={form.eventDate}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                End Date and Time
                <input
                  type="datetime-local"
                  name="eventEndDate"
                  value={form.eventEndDate}
                  onChange={handleChange}
                  min={form.eventDate || undefined}
                />
              </label>
            </div>

            <label>
              Venue
              <input
                name="venue"
                value={form.venue}
                onChange={handleChange}
                placeholder="Event venue or online"
              />
            </label>
          </div>

          <div className="event-form-section">
            <h3>Registration and Access</h3>

            <div className="event-form-grid">
              <label>
                Audience
                <select
                  name="audience"
                  value={form.audience}
                  onChange={handleChange}
                >
                  <option value="public">Public</option>
                  <option value="members_only">Members Only</option>
                  <option value="both">Public and Members</option>
                </select>
              </label>

              <label>
                Maximum Capacity
                <input
                  type="number"
                  name="capacity"
                  min="1"
                  value={form.capacity}
                  onChange={handleChange}
                  placeholder="Unlimited"
                />
              </label>
            </div>

            <label>
              Registration Deadline
              <input
                type="datetime-local"
                name="registrationDeadline"
                value={form.registrationDeadline}
                onChange={handleChange}
              />
            </label>

            <label>
              Registration Link
              <input
                type="url"
                name="registrationUrl"
                value={form.registrationUrl}
                onChange={handleChange}
                placeholder="https://..."
              />
            </label>

            <label className="event-form-checkbox">
              <input
                type="checkbox"
                name="registrationOpen"
                checked={form.registrationOpen}
                onChange={handleChange}
              />
              Allow event registration
            </label>
          </div>

          <div className="event-form-section">
            <h3>Event Poster</h3>

            <label>
              Featured Image URL
              <input
                type="url"
                name="featuredImage"
                value={form.featuredImage}
                onChange={handleChange}
                placeholder="https://..."
              />
            </label>

            {form.featuredImage && (
              <img
                src={form.featuredImage}
                alt="Event poster preview"
                className="event-form-image-preview"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
          </div>

          {form.eventEndDate &&
            form.eventDate &&
            new Date(form.eventEndDate) < new Date(form.eventDate) && (
              <p className="event-form-error">
                The event end date cannot be earlier than its start date.
              </p>
            )}

          <div className="event-form-footer">
            <button
              type="button"
              className="event-form-cancel"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="event-form-save"
              disabled={
                saving ||
                (form.eventEndDate &&
                  form.eventDate &&
                  new Date(form.eventEndDate) < new Date(form.eventDate))
              }
            >
              <Save size={16} />
              {saving
                ? "Saving..."
                : event
                  ? "Save Changes"
                  : "Create Draft"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
