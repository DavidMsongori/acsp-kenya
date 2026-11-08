import { Link } from "react-router-dom";
import { ArrowRight, Users, ShieldCheck, GraduationCap } from "lucide-react";

import KenyaCountyMap from "../../components/common/KenyaCountyMap";
import "./HomePage.css";

const HomePage = () => {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="hero-pattern" />

        {/* Subtle background photograph on the right */}
<div className="hero-background-image" aria-hidden="true" />

        <div className="home-hero-container">
          {/* Kenya county map watermark */}
          <div className="hero-map-area" aria-hidden="true">
            <KenyaCountyMap />
          </div>

          {/* Main hero content */}
          <div className="hero-content">
            <h1 className="hero-title">
  <span className="hero-title-white">Association of County</span>{" "}
  <span className="hero-title-yellow">Students Presidents Kenya</span>
</h1>

            <h2 className="hero-tagline">
              Diverse Voices - Common Goals - One Vision
            </h2>

            <blockquote className="hero-quote">
              “When we invest in youth, we invest in the future. Empowered
              young people are not just beneficiaries of Change - they are
              the drivers of it.”
            </blockquote>

            <div className="hero-actions">
              <Link to="/about" className="hero-btn hero-btn-primary">
                Discover ACSP-Kenya
                <ArrowRight size={18} />
              </Link>

              <Link to="/programs" className="hero-btn hero-btn-outline">
                Our Programs
              </Link>
            </div>

            {/* Impact numbers */}
            <div className="hero-impact">
              <div className="impact-item">
                <strong>2024</strong>
                <span>Establishment</span>
              </div>

              <div className="impact-item">
                <strong>47</strong>
                <span>Counties</span>
              </div>

              <div className="impact-item">
                <strong>3</strong>
                <span>Focus Areas</span>
              </div>

              <div className="impact-item">
                <strong>15+</strong>
                <span>Programs</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-bottom-line" />
      </section>

      {/* Introduction */}
      <section className="home-intro">
        <div className="home-intro-container">
          <div className="intro-heading">
            <span className="section-eyebrow">WHO WE ARE</span>
            <h2>
              Bringing County Student Leaders
              <span> Together.</span>
            </h2>
          </div>

          <p className="intro-description">
            ACSP-Kenya is a national platform that connects County Students
            Association Presidents. We provide a space for collective
            representation, leadership development, meaningful engagement
            and coordinated action on matters affecting students.
          </p>
        </div>
      </section>

      {/* Focus areas */}
      <section className="home-pillars">
        <div className="pillars-container">
          <div className="pillar-card">
            <div className="pillar-icon">
              <Users size={25} />
            </div>
            <h3>Unity & Representation</h3>
            <p>
              Bringing county student leaders together under one national
              voice to advance shared interests.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon">
              <GraduationCap size={25} />
            </div>
            <h3>Leadership Development</h3>
            <p>
              Promoting responsible leadership, capacity building and
              opportunities for student leaders.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon">
              <ShieldCheck size={25} />
            </div>
            <h3>Accountability & Advocacy</h3>
            <p>
              Strengthening student representation through engagement,
              collaboration and accountable leadership.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;