
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  MapPin,
  FolderKanban,
  RefreshCw,
} from "lucide-react";

import api from "../../services/api";

import "./ActivityPage.css";

function ActivityPage() {
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/api/programmes");

        setProgrammes(response.data.programmes || []);
      } catch (err) {
        console.error("Fetch public activities error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load activities at the moment."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // Collect published activities across all published programmes.
  const activities = useMemo(() => {
    return programmes.flatMap((programme) =>
      (programme.activities || [])
        .filter((activity) => activity.status === "published")
        .map((activity) => ({
          ...activity,
          programme_title: programme.title,
        }))
    );
  }, [programmes]);

  const formatDate = (date) => {
    if (!date) return "Date to be announced";

    return new Date(date).toLocaleDateString("en-KE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <main className="public-activities-page">
      {/* HERO */}
      <section className="activities-hero">
        <div className="activities-hero-pattern" />

        <div className="activities-hero-content">
          <span className="activities-eyebrow">
            OUR WORK · OUR IMPACT
          </span>

          <h1>
            Our <span>Activities</span>
          </h1>

          <p>
            Discover the activities taking place across our programmes
            as we advance student leadership, representation and
            opportunities throughout Kenya.
          </p>
        </div>
      </section>

      {/* ACTIVITIES */}
      <section className="activities-content">
        <div className="activities-section-heading">
          <span className="activities-section-eyebrow">
            MAKING AN IMPACT
          </span>

          <h2>Activities Across Kenya</h2>

          <p>
            A look at the initiatives, engagements and events
            implemented through ACSP-Kenya programmes.
          </p>

          {!loading && !error && (
            <div className="activities-total">
              <Activity size={17} />
              <span>
                {activities.length} Published{" "}
                {activities.length === 1 ? "Activity" : "Activities"}
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="activities-state">
            <RefreshCw
              className="activities-spinner"
              size={25}
            />
            <p>Loading activities...</p>
          </div>
        ) : error ? (
          <div className="activities-state activities-error">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        ) : activities.length === 0 ? (
          <div className="activities-state">
            <Activity size={35} />

            <h3>No Activities Published Yet</h3>

            <p>
              Activities will appear here once they have been
              published through our programmes.
            </p>
          </div>
        ) : (
          <div className="public-activities-grid">
            {activities.map((activity) => {
              const imageUrl = Array.isArray(activity.image_urls)
                ? activity.image_urls[0]
                : activity.image_urls;

              return (
                <article
                  className="public-activity-card"
                  key={activity.id}
                >
                  <div className="public-activity-image">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={activity.title}
                        loading="lazy"
                      />
                    ) : (
                      <div className="public-activity-placeholder">
                        <Activity size={30} />
                      </div>
                    )}
                  </div>

                  <div className="public-activity-body">
                    <span className="public-activity-programme">
                      <FolderKanban size={12} />
                      {activity.programme_title}
                    </span>

                    <h3>{activity.title}</h3>

                    <p className="public-activity-description">
                      {activity.description ||
                        "Discover this ACSP-Kenya activity."}
                    </p>

                    <div className="public-activity-meta">
                      <span>
                        <CalendarDays size={14} />
                        {formatDate(activity.activity_date)}
                      </span>

                      {(activity.location ||
                        activity.counties?.name) && (
                        <span>
                          <MapPin size={14} />
                          {[
                            activity.location,
                            activity.counties?.name,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default ActivityPage;
