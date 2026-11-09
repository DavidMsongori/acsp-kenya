
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  FolderKanban,
  RefreshCw,
  Activity,
} from "lucide-react";
import { Link } from "react-router-dom";

import api from "../../services/api";

import "./ProgramsPage.css";

function ProgramsPage() {
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProgrammes = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/programmes");

        setProgrammes(response.data.programmes || []);
      } catch (err) {
        console.error("Fetch public programmes error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load programmes at the moment."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProgrammes();
  }, []);

  const formatDate = (date) => {
    if (!date) return "Date to be announced";

    return new Date(date).toLocaleDateString("en-KE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <main className="public-programmes-page">
      <section className="programmes-hero">
        <div className="programmes-hero-pattern" />

        <div className="programmes-hero-content">
          <span className="programmes-eyebrow">
            WHAT WE DO · OUR IMPACT
          </span>

          <h1>
            Our <span>Programmes</span>
          </h1>

          <p>
            Discover the programmes and initiatives through which
            ACSP-Kenya strengthens student leadership, promotes
            opportunities and empowers students across Kenya.
          </p>

          <div className="programmes-hero-actions">
  <Link to="/timeline" className="programmes-hero-button">
    <CalendarDays size={17} />
    View Timeline
  </Link>

  <Link
    to="/activities"
    className="programmes-hero-button programmes-hero-button-outline"
  >
    <Activity size={17} />
    View Activities
  </Link>
</div>
        </div>
      </section>

      <section className="programmes-content" id="programmes-list">
        <div className="programmes-section-heading">
          <div>
            <span className="programmes-section-eyebrow">
              MAKING A DIFFERENCE
            </span>
            <h2>Explore Our Flagship Programs</h2>
            <p>
              Explore the initiatives and activities driving our
              commitment to student representation and development.
            </p>
          </div>

          <div className="programmes-total">
            <FolderKanban size={19} />
            <span>{programmes.length} Programmes</span>
          </div>
        </div>

        {loading ? (
          <div className="programmes-state">
            <RefreshCw className="programmes-spinner" size={25} />
            <p>Loading programmes...</p>
          </div>
        ) : error ? (
          <div className="programmes-state programmes-error">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        ) : programmes.length === 0 ? (
          <div className="programmes-state">
            <FolderKanban size={35} />
            <h3>No Programmes Published Yet</h3>
            <p>
              Our programmes will appear here once they are published.
              Please check back soon.
            </p>
          </div>
        ) : (
          <div className="public-programmes-grid">
            {programmes.map((programme) => {
              const activities = (programme.activities || []).filter(
                (activity) => activity.status === "published"
              );

              const counties = [
                ...new Set(
                  activities
                    .map((activity) => activity.counties?.name)
                    .filter(Boolean)
                ),
              ];

              return (
                <article
                  className="public-programme-card"
                  key={programme.id}
                >
                  <div className="public-programme-cover">
                    {programme.cover_image_url ? (
                      <img
                        src={programme.cover_image_url}
                        alt={programme.title}
                      />
                    ) : (
                      <div className="public-programme-cover-placeholder">
                        <FolderKanban size={42} />
                        <span>ACSP-KENYA</span>
                      </div>
                    )}

                    <span className="public-programme-status">
                      {programme.status || "Published"}
                    </span>
                  </div>

                  <div className="public-programme-body">
                    <h3>{programme.title}</h3>

                    <p className="public-programme-description">
                      {programme.description}
                    </p>

                    <div className="public-programme-meta">
                      <span>
                        <CalendarDays size={15} />
                        {formatDate(programme.start_date)}
                      </span>

                      <span>
                        <FolderKanban size={15} />
                        {activities.length}{" "}
                        {activities.length === 1 ? "Activity" : "Activities"}
                      </span>
                    </div>

                    {counties.length > 0 && (
                      <div className="public-programme-counties">
                        <MapPin size={15} />
                        <span>{counties.join(", ")}</span>
                      </div>
                    )}

                    <div className="public-programme-footer">
                      <span>ACSP-Kenya Initiative</span>

                      <Link to={`/programs/${programme.id}`}>
                        Explore Programme
                        <ArrowRight size={16} />
                      </Link>
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

export default ProgramsPage;
