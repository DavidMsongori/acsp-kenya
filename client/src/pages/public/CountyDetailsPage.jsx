import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  ArrowLeft,
  ArrowRight,
  Activity,
  CalendarDays,
  Image as ImageIcon,
} from "lucide-react";

import api from "../../services/api";
import KenyaCountyMap from "../../components/common/KenyaCountyMap";

import "./CountyDetailsPage.css";

function CountyDetailsPage() {
  const { countyCode } = useParams();

  const [counties, setCounties] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [associations, setAssociations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
  const fetchCountyData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        countiesResponse,
        programmesResponse,
        associationsResponse,
      ] = await Promise.all([
        api.get("/counties"),
        api.get("/programmes"),
        api.get("/associations"),
      ]);

      setCounties(countiesResponse.data.counties || []);
      setProgrammes(programmesResponse.data.programmes || []);
      setAssociations(
        associationsResponse.data.associations || []
      );
    } catch (err) {
      console.error("Failed to load county profile:", err);

      setError(
        "Unable to load this county profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  fetchCountyData();
}, []);

  const county = useMemo(
    () =>
      counties.find(
        (item) =>
          item.code?.toLowerCase() === countyCode?.toLowerCase()
      ),
    [counties, countyCode]
  );

  const countyActivities = useMemo(() => {
  if (!county) return [];

  return programmes.flatMap((programme) =>
    (programme.activities || [])
      .filter(
        (activity) =>
          activity.status === "published" &&
          Number(activity.county_id) === Number(county.id)
      )
      .map((activity) => ({
        ...activity,
        programme_title: programme.title,
      }))
  );
}, [programmes, county]);

const countyAssociation = useMemo(() => {
  if (!county) return null;

  return (
    associations.find(
      (association) =>
        Number(association.county_id) === Number(county.id)
    ) || null
  );
}, [associations, county]);

  return (
    <main className="county-details-page">
      <section className="county-details-container">
        <Link to="/where-we-work" className="county-back-link">
          <ArrowLeft size={16} />
          Back to Where We Work
        </Link>

        {loading ? (
          <div className="county-details-loading">
            Loading county profile...
          </div>
        ) : error ? (
          <div className="county-details-error">{error}</div>
        ) : county ? (
  <>
    <section className="county-details-hero">
  <div className="hero-pattern" />

  {/* Subtle background photograph */}
  <div
    className="hero-background-image"
    aria-hidden="true"
  />

  <div className="county-details-hero-container">

    {/* Selected county map */}
    <div className="county-details-hero-map" aria-hidden="true">
      <KenyaCountyMap
        interactive={false}
        singleCounty={true}
        selectedCountyName={county.name}
      />
    </div>

    {/* Main hero content */}
    <div className="county-details-hero-content">

      <span className="county-details-eyebrow">
        ACSP-KENYA · COUNTY PROFILE
      </span>

      <h1 className="hero-title">
        <span className="hero-title-white">
          {county.name}
        </span>{" "}
        <span className="hero-title-yellow">
          County
        </span>
      </h1>

      <h2 className="hero-tagline">
        County Student Leadership · Unity · Representation
      </h2>

      <blockquote className="hero-quote">
        Discover the student leadership, representation,
        programmes and initiatives advancing opportunities
        for young people in {county.name} County.
      </blockquote>

      <div className="hero-actions">
        <Link
          to="/where-we-work"
          className="hero-btn hero-btn-primary"
        >
          Explore Other Counties
          <ArrowRight size={18} />
        </Link>

        <a
          href="#county-activities"
          className="hero-btn hero-btn-outline"
        >
          Explore Activities
        </a>
      </div>

      {/* County impact indicators */}
      <div className="hero-impact">

        <div className="impact-item">
          <strong>{countyActivities.length}</strong>
          <span>Published Activities</span>
        </div>

        <div className="impact-item">
          <strong>
            {countyAssociation ? "Yes" : "—"}
          </strong>
          <span>Verified Association</span>
        </div>

        <div className="impact-item">
          <strong>ACSP</strong>
          <span>National Network</span>
        </div>

      </div>

    </div>
  </div>

  <div className="hero-bottom-line" />
</section>

{/* VERIFIED COUNTY ASSOCIATION */}
<section className="county-association-section">
  <div className="county-section-heading">
    <span>COUNTY LEADERSHIP</span>
    <h2>County Students Association</h2>
  </div>

  {countyAssociation ? (
    <div className="county-association-profile">
      {countyAssociation.logo_url && (
        <img
          src={countyAssociation.logo_url}
          alt={`${countyAssociation.association_name} logo`}
          className="county-association-profile-logo"
        />
      )}

      <div className="county-association-profile-info">
        <span className="county-association-verified">
          Verified Association
        </span>

        <h3>{countyAssociation.association_name}</h3>

        {countyAssociation.acronym && (
          <p>{countyAssociation.acronym}</p>
        )}

        <span className="county-association-location">
          <MapPin size={15} />
          {county.name} County
        </span>
      </div>
    </div>
  ) : (
    <div className="county-association-unavailable">
      <Activity size={24} />

      <div>
        <h3>No Verified Association Yet</h3>
        <p>
          {county.name} County does not currently have a
          verified County Students Association registered
          with ACSP-Kenya.
        </p>
      </div>
    </div>
  )}
</section>

{/* COUNTY ACTIVITIES */}
<section
  className="county-activities-section"
  id="county-activities"
>
  <div className="county-section-heading">
    <span>OUR WORK ON THE GROUND</span>
    <h2>Activities in {county.name} County</h2>
    <p>
      Explore the programmes, initiatives and activities
      implemented across this county.
    </p>
  </div>

  {countyActivities.length > 0 ? (
    <div className="county-activities-grid">
      {countyActivities.map((activity) => (
        <article
          className="county-details-activity-card"
          key={activity.id}
        >
          <div className="county-details-activity-content">
            <span className="county-details-activity-label">
              PUBLISHED ACTIVITY
            </span>

            <h3>{activity.title}</h3>

            {activity.description && (
              <p className="county-details-activity-description">
                {activity.description}
              </p>
            )}

            {/* ACTIVITY PHOTO GALLERY */}
{Array.isArray(activity.image_urls) &&
  activity.image_urls.length > 0 && (
    <div className="county-details-gallery">
      <div className="county-details-gallery-heading">
        <ImageIcon size={16} />
        <span>Activity Gallery</span>
      </div>

      <div className="county-details-gallery-grid">
        {activity.image_urls.map((imageUrl, index) => (
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            key={`${activity.id}-image-${index}`}
            className="county-details-gallery-item"
          >
            <img
              src={imageUrl}
              alt={`${activity.title} - Photo ${index + 1}`}
              loading="lazy"
            />
          </a>
        ))}
      </div>
    </div>
  )}

            <div className="county-details-activity-meta">
              {activity.activity_date && (
                <span>
                  <CalendarDays size={15} />
                  {new Date(activity.activity_date).toLocaleDateString(
                    "en-KE",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </span>
              )}

              {activity.location && (
                <span>
                  <MapPin size={15} />
                  {activity.location}
                </span>
              )}
            </div>

            <div className="county-details-programme">
              <span>National Programme</span>
              <strong>{activity.programme_title}</strong>
            </div>
          </div>
        </article>
      ))}
    </div>
  ) : (
    <div className="county-details-no-activities">
      <Activity size={30} />
      <h3>No Published Activities Yet</h3>
      <p>
        There are currently no published activities recorded
        for {county.name} County.
      </p>
    </div>
  )}
</section>

  </>
) : (
          <div className="county-details-error">
            County not found.
          </div>
        )}
      </section>
    </main>
  );
}

export default CountyDetailsPage;