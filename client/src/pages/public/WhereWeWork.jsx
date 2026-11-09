
import { useEffect, useMemo, useState } from "react";
import {
  MapPin,
  Activity,
  ArrowRight,
  CalendarDays,
} from "lucide-react";

import { Link } from "react-router-dom";

import api from "../../services/api";
import KenyaCountyMap from "../../components/common/KenyaCountyMap";
import "./WhereWeWork.css";


function WhereWeWork() {
  const [hoveredCounty, setHoveredCounty] = useState(null);
  const [selectedCounty, setSelectedCounty] = useState(null);

  const [counties, setCounties] = useState([]);

  const [programmes, setProgrammes] = useState([]);
  const [associations, setAssociations] = useState([]);
  const [loadingAssociations, setLoadingAssociations] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [activitiesError, setActivitiesError] = useState("");

  const displayedCounty = hoveredCounty || selectedCounty;

  const databaseCounty = useMemo(() => {
  if (!displayedCounty) return null;

  return counties.find(
    (county) =>
      county.name?.trim().toLowerCase() ===
      displayedCounty.name?.trim().toLowerCase()
  ) || null;
}, [counties, displayedCounty]);

  const countyAssociation = useMemo(() => {
  if (!displayedCounty) return null;

  return associations.find(
    (association) =>
      Number(association.county_id) ===
      Number(
        programmes
          .flatMap((programme) => programme.activities || [])
          .find(
            (activity) =>
              activity.counties?.name?.trim().toLowerCase() ===
              displayedCounty.name?.trim().toLowerCase()
          )?.county_id
      )
  ) || associations.find(
    (association) =>
      association.counties?.name?.trim().toLowerCase() ===
      displayedCounty.name?.trim().toLowerCase()
  ) || null;
}, [associations, displayedCounty, programmes]);

 useEffect(() => {
  const fetchPageData = async () => {
    try {
      setLoadingActivities(true);
      setLoadingAssociations(true);
      setActivitiesError("");

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
    } catch (error) {
      console.error("Failed to fetch Where We Work data:", error);

      setActivitiesError(
        "Unable to load county activities. Please try again."
      );
    } finally {
      setLoadingActivities(false);
      setLoadingAssociations(false);
    }
  };

  fetchPageData();
}, []);

  
const countyActivities = useMemo(() => {
  if (!displayedCounty) return [];

  return programmes.flatMap((programme) =>
    (programme.activities || [])
      .filter((activity) => {
        const activityCounty =
          activity.counties?.name?.trim().toLowerCase();

        const selectedCountyName =
          displayedCounty.name?.trim().toLowerCase();

        return (
          activityCounty === selectedCountyName &&
          activity.status === "published"
        );
      })
      .map((activity) => ({
        ...activity,
        programme_title: programme.title,
      }))
  );
}, [programmes, displayedCounty]);

const countiesWithActivities = useMemo(() => {
  const activeCounties = programmes.flatMap((programme) =>
    (programme.activities || [])
      .filter((activity) => activity.status === "published")
      .map((activity) =>
        activity.counties?.name?.trim().toLowerCase()
      )
      .filter(Boolean)
  );

  return [...new Set(activeCounties)];
}, [programmes]);



  return (
    <main className="where-work-page">

      {/* PAGE HEADING */}
      <section className="where-work-heading">
        <div className="where-work-container">

          <span className="where-work-eyebrow">
            OUR NATIONAL PRESENCE
          </span>

          <h1>
            Where We Work <span>Across Kenya</span>
          </h1>

          <p>
            Discover our presence across Kenya's 47 counties
            and explore the activities, programmes and initiatives
            advancing student representation and youth development.
          </p>

        </div>
      </section>

      {/* INTERACTIVE MAP SECTION */}
      <section className="where-work-explorer">
        <div className="where-work-container">

          <div className="where-work-map-layout">

            {/* MAP */}
            <div className="where-work-map-area">

              <div className="where-work-map-heading">
                <div>
                  <h2>Explore Our Counties</h2>
                  <p>Select a county to explore our activities.</p>
                </div>

                <span className="where-work-county-count">
                  47 Counties
                </span>
              </div>

              <KenyaCountyMap
  interactive={true}
  selectedCountyId={selectedCounty?.id || null}
  highlightedCountyNames={countiesWithActivities}
  onCountyHover={setHoveredCounty}
  onCountySelect={(county) => {
    setSelectedCounty(county);
    setHoveredCounty(null);
  }}
/>

              <div className="where-work-map-legend">
                <span className="legend-indicator" />
                <span>Hover over or select a county</span>
              </div>

            </div>

            {/* COUNTY ACTIVITIES PANEL */}
            <aside className="where-work-details">

              {displayedCounty ? (
                <>
                  <div className="where-work-details-top">
                    <div className="where-work-details-icon">
                      <MapPin size={23} />
                    </div>

                    <span>COUNTY PROFILE</span>
                  </div>

                  <h2>{displayedCounty.name}</h2>


                  {/* VERIFIED COUNTY ASSOCIATION */}
<div className="where-work-county-association">
  <span className="where-work-association-label">
    COUNTY STUDENTS ASSOCIATION
  </span>

  {loadingAssociations ? (
    <p>Checking association details...</p>
  ) : countyAssociation ? (
    <div className="where-work-association-info">
      {countyAssociation.logo_url && (
        <img
          src={countyAssociation.logo_url}
          alt={`${countyAssociation.association_name} logo`}
          className="where-work-association-logo"
        />
      )}

      <div>
        <h4>{countyAssociation.association_name}</h4>

        {countyAssociation.acronym && (
          <span>{countyAssociation.acronym}</span>
        )}

        <span className="where-work-verification-status">
          <span className="where-work-verified-dot" />
          Verified Association
        </span>
      </div>
    </div>
  ) : (
    <p className="where-work-no-association">
      No verified County Students Association is currently
      registered in {displayedCounty.name}.
    </p>
  )}
</div>
                  

                  <p className="where-work-details-intro">
                    Explore ACSP-KE's activities and programmes
                    in {displayedCounty.name} County.
                  </p>

                  <div className="where-work-activity-heading">
                    <Activity size={17} />
                    <h3>Our Activities</h3>
                  </div>

                  
{loadingActivities ? (
  <div className="where-work-empty">
    <Activity size={28} />
    <h4>Loading Activities...</h4>
    <p>Please wait while we retrieve county activities.</p>
  </div>
) : activitiesError ? (
  <div className="where-work-empty">
    <Activity size={28} />
    <h4>Unable to Load Activities</h4>
    <p>{activitiesError}</p>
  </div>
) : countyActivities.length > 0 ? (
  <div className="where-work-activities-list">
    {countyActivities.map((activity) => (
      <div
        className="where-work-activity-card"
        key={activity.id}
      >
        <div className="where-work-activity-name">
          <Activity size={16} />
          <h4>{activity.title}</h4>
        </div>
      </div>
    ))}

    <Link
  to={`/where-we-work/${databaseCounty?.code}`}
  className="where-work-see-more"
>
      See More About {displayedCounty.name}
      <ArrowRight size={16} />
    </Link>
  </div>
) : (
  <div className="where-work-empty">
    <Activity size={28} />

    <h4>No Published Activities Yet</h4>

    <p>
      There are currently no published activities recorded
      for {displayedCounty.name} County.
    </p>
  </div>
)}


                </>
              ) : (
                <div className="where-work-empty-state">
                  <div className="where-work-empty-icon">
                    <MapPin size={30} />
                  </div>

                  <h2>Explore Kenya</h2>

                  <p>
                    Select any county on the map to discover
                    ACSP-KE's activities and programmes in that
                    county.
                  </p>

                  <div className="where-work-select-hint">
                    <ArrowRight size={16} />
                    Choose a county to get started
                  </div>
                </div>
              )}

            </aside>

          </div>

        </div>
      </section>

    </main>
  );
}

export default WhereWeWork;
