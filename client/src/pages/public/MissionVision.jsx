
import { Link } from "react-router-dom";
import {
  Target,
  Eye,
  ArrowRight,
  ShieldCheck,
  Users,
  HandHeart,
  Flame,
  Heart,
  Scale,
} from "lucide-react";

import "./MissionVision.css";

const pillars = [
  {
    letter: "A",
    title: "Accountability",
    icon: ShieldCheck,
    description:
      "We uphold transparency, responsibility and integrity in leadership, ensuring that our actions reflect the trust placed in us.",
  },
  {
    letter: "C",
    title: "Collaboration",
    icon: Users,
    description:
      "We build strong partnerships and encourage teamwork among students, youth, institutions and stakeholders.",
  },
  {
    letter: "S",
    title: "Service",
    icon: HandHeart,
    description:
      "We believe in servant leadership that places the needs, interests and development of students and communities first.",
  },
  {
    letter: "P",
    title: "Passion",
    icon: Flame,
    description:
      "We demonstrate commitment, determination and enthusiasm in advancing student leadership and national transformation.",
  },
  {
    letter: "K",
    title: "Kindness",
    icon: Heart,
    description:
      "We promote compassion, respect and understanding while embracing the diversity of voices and experiences.",
  },
  {
    letter: "E",
    title: "Equity",
    icon: Scale,
    description:
      "We champion fairness, equal opportunities and inclusive participation for students and young people across Kenya.",
  },
];

const MissionVision = () => {
  return (
    <main className="mission-vision-page">

      {/* HERO SECTION */}
      <section className="mv-hero">
        <div className="mv-container mv-hero-content">

          <span className="mv-eyebrow">
            VISION & MISSION
          </span>

          <h1>
            Our Mission <span>Pillars</span>
          </h1>

          <p>
            To build a dynamic platform that connects youth and
            students across Kenya and beyond, nurturing a generation
            of transformative leaders.
          </p>

          <Link
            to="/focus-areas"
            className="mv-hero-button"
          >
            See Focus Areas
            <ArrowRight size={17} />
          </Link>

        </div>
      </section>

      {/* VISION AND MISSION */}
      <section className="mv-statements">
        <div className="mv-container">

          <div className="mv-section-heading">
            <span className="mv-section-label">
              VISION & MISSION
            </span>
          </div>

          <div className="mv-statements-grid">

            {/* VISION */}
            <article className="mv-statement-card">
              <div className="mv-statement-icon">
                <Eye size={27} />
              </div>

              <h2>Our Vision</h2>

              <div className="mv-accent-line" />

              <p>
                A Kenya where Students and Youth are empowered,
                united and actively shaping national transformation.
              </p>
            </article>

            {/* MISSION */}
            <article className="mv-statement-card">
              <div className="mv-statement-icon">
                <Target size={27} />
              </div>

              <h2>Our Mission</h2>

              <div className="mv-accent-line" />

              <p>
                To Foster unity, collaboration and strategic
                leadership, driving sustainable development,
                policy innovation and effective governance
                across all counties.
              </p>
            </article>

          </div>
        </div>
      </section>

     
{/* OUR MOTTO */}
<section className="mv-motto">
  <div className="mv-container">
    <span className="mv-motto-label">OUR MOTTO</span>

    <h2>
      <span className="motto-white">Diverse Voices,</span>
      <span className="motto-yellow">Common Goals,</span>
      <span className="motto-white">One Vision.</span>
    </h2>
  </div>
</section>


      {/* OUR PILLARS */}
      <section className="mv-pillars">
        <div className="mv-container">

          <div className="mv-section-heading">
            <span className="mv-section-label">
              OUR PILLARS
            </span>

            <h2>
              The Values Behind <span>ACSP-KE</span>
            </h2>

            <p>
              Six guiding values that define our identity,
              shape our leadership and drive our commitment
              to students and young people.
            </p>
          </div>

          <div className="mv-pillars-grid">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;

              return (
                <article
                  className="mv-pillar-card"
                  key={pillar.letter}
                >
                  <div className="mv-pillar-top">
                    <div className="mv-pillar-icon">
                      <Icon size={23} />
                    </div>

                    <div className="mv-pillar-acronym">
                      <span>{pillar.letter}</span>
                    </div>
                  </div>

                  <h3>
                    <span className="mv-pillar-highlight">
                      {pillar.letter}
                    </span>
                    {pillar.title.slice(1)}
                  </h3>

                  <p>{pillar.description}</p>
                </article>
              );
            })}
          </div>

          <div className="mv-acronym-note">
            <span>A</span>ccountability ·
            <span>C</span>ollaboration ·
            <span>S</span>ervice ·
            <span>P</span>assion ·
            <span>K</span>indness ·
            <span>E</span>quity
          </div>

        </div>
      </section>

    </main>
  );
};

export default MissionVision;
