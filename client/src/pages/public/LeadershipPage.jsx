
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Users,
  Landmark,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

import api from "../../services/api";
import "./LeadershipPage.css";

const getRelation = (value) =>
  Array.isArray(value) ? value[0] || null : value || null;

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "AC";

function ProfilePhoto({ name, photoUrl, className = "" }) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [photoUrl]);

  return (
    <div className={`leadership-photo ${className}`}>
      {photoUrl && !imageFailed ? (
        <img
          src={photoUrl}
          alt={name}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}

function LeadershipPage() {
  const [secretariat, setSecretariat] = useState([]);
  const [assembly, setAssembly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);

  const fetchLeadership = async () => {
    setLoading(true);
    setErrors([]);

    const results = await Promise.allSettled([
      api.get("/leadership/secretariat"),
      api.get("/leadership/general-assembly"),
    ]);

    const newErrors = [];

    if (results[0].status === "fulfilled") {
      setSecretariat(results[0].value.data?.members || []);
    } else {
      setSecretariat([]);
      newErrors.push("Unable to load the National Secretariat.");
      console.error("Secretariat directory error:", results[0].reason);
    }

    if (results[1].status === "fulfilled") {
      setAssembly(results[1].value.data?.members || []);
    } else {
      setAssembly([]);
      newErrors.push("Unable to load the General Assembly.");
      console.error("General Assembly error:", results[1].reason);
    }

    setErrors(newErrors);
    setLoading(false);
  };

  useEffect(() => {
    fetchLeadership();
  }, []);

  const groupedAssembly = assembly.reduce((groups, member) => {
    const association = getRelation(member.county_associations);
    const county = getRelation(association?.counties);
    const countyName = county?.name || "Other Counties";

    if (!groups[countyName]) {
      groups[countyName] = [];
    }

    groups[countyName].push(member);
    return groups;
  }, {});

  const sortedCountyNames = Object.keys(groupedAssembly).sort((a, b) =>
    a.localeCompare(b)
  );

  return (
    <main className="leadership-page">
      {/* HERO */}
      <section className="leadership-hero">
        <div className="leadership-container leadership-hero-content">
          <span className="leadership-eyebrow">
            LEADERSHIP & REPRESENTATION
          </span>

          <h1>
            The Leaders Behind <span>Our Collective Vision</span>
          </h1>

          <p>
            Meet the leaders entrusted with advancing the mission of the
            Association of County Students Presidents Kenya. From the
            National Secretariat to the General Assembly, our leadership
            is built on representation, unity and service.
          </p>

          <div className="leadership-hero-actions">
  <Link to="/mission-vision">
    Mission & Vision
    <ArrowRight size={17} />
  </Link>

  <Link to="/programs" className="secondary">
    Explore Our Programs
  </Link>
</div>

          <div className="leadership-hero-stats">
            <div>
              <strong>{secretariat.length}</strong>
              <span>Secretariat Members</span>
            </div>
            <div>
              <strong>{assembly.length}</strong>
              <span>Verified County Presidents</span>
            </div>
            <div>
              <strong>47</strong>
              <span>Counties of Kenya</span>
            </div>
          </div>
        </div>
      </section>

      {/* NATIONAL SECRETARIAT */}
      <section
        className="leadership-section"
        id="national-secretariat"
      >
        <div className="leadership-container">
          <div className="leadership-section-heading">

            <h2>National Secretariat</h2>

            <div className="leadership-gold-line" />

            <p>
              The National Secretariat provides the administrative,
              operational and institutional leadership of ACSP-Kenya,
              coordinating the implementation of the Association's
              programmes and strategic priorities.
            </p>
          </div>

          {loading ? (
            <div className="leadership-state">
              <RefreshCw className="leadership-spinner" size={25} />
              <p>Loading National Secretariat...</p>
            </div>
          ) : secretariat.length === 0 ? (
            <div className="leadership-empty">
              <Landmark size={35} />
              <h3>National Secretariat Directory</h3>
              <p>
                National Secretariat appointments will appear here once
                members have been appointed and activated.
              </p>
            </div>
          ) : (
            <div className="leadership-card-grid secretariat-grid">
              {secretariat.map((appointment) => {
                const profile = getRelation(appointment.profiles);
                const name = profile?.full_name || "Secretariat Member";

                return (
                  <article
                    className="leadership-card secretariat-card"
                    key={appointment.id}
                  >
                    <ProfilePhoto
                      name={name}
                      photoUrl={profile?.photo_url}
                    />

                    <div className="leadership-card-content">
                      <span className="leadership-card-category">
                        NATIONAL SECRETARIAT
                      </span>

                      <h3>{name}</h3>

                      <p className="leadership-position">
                        {appointment.position}
                      </p>

                      {profile?.bio && (
                        <p className="leadership-bio">
                          {profile.bio}
                        </p>
                      )}
                    </div>

                    <div className="leadership-card-footer">
                      <ShieldCheck size={15} />
                      <span>Appointed Member</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* GENERAL ASSEMBLY */}
      <section
        className="leadership-section assembly-section"
        id="general-assembly"
      >
        <div className="leadership-container">
          <div className="leadership-section-heading">

            <h2>The General Assembly</h2>

            <div className="leadership-gold-line" />

            <p>
              The General Assembly brings together verified County
              Students Association Presidents from across Kenya,
              providing a national platform for collective
              representation, deliberation and decision-making.
            </p>
          </div>

          {loading ? (
            <div className="leadership-state">
              <RefreshCw className="leadership-spinner" size={25} />
              <p>Loading General Assembly members...</p>
            </div>
          ) : assembly.length === 0 ? (
            <div className="leadership-empty">
              <Users size={35} />
              <h3>General Assembly Directory</h3>
              <p>
                Verified County Association Presidents will appear
                here as their leadership records are confirmed.
              </p>
            </div>
          ) : (
            <div className="assembly-county-groups">
              {sortedCountyNames.map((countyName) => (
                <div
                  className="assembly-county-group"
                  key={countyName}
                >

                  <div className="leadership-card-grid assembly-grid">
                    {groupedAssembly[countyName].map((member) => {
                      const profile = getRelation(member.profiles);
                      const association = getRelation(
                        member.county_associations
                      );
                      const name =
                        profile?.full_name || "County President";

                      return (
                        <article
                          className="leadership-card assembly-card"
                          key={member.id}
                        >
                          <ProfilePhoto
                            name={name}
                            photoUrl={profile?.photo_url}
                          />

                          <div className="leadership-card-content">
                            <span className="leadership-card-category">
                              COUNTY PRESIDENT
                            </span>

                            <h3>{name}</h3>

                           <p className="leadership-position">
  {countyName} County
</p>

                            {profile?.bio && (
                              <p className="leadership-bio">
                                {profile.bio}
                              </p>
                            )}
                          </div>

                          <div className="leadership-card-footer">
                            <ShieldCheck size={15} />
                            <span>Verified County President</span>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* DATA ERRORS */}
      {errors.length > 0 && (
        <div className="leadership-error">
          {errors.map((error) => (
            <p key={error}>{error}</p>
          ))}

          <button type="button" onClick={fetchLeadership}>
            <RefreshCw size={15} />
            Retry loading
          </button>
        </div>
      )}
    </main>
  );
}

export default LeadershipPage;
