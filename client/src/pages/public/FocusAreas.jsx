
import { Link } from "react-router-dom";
import {
  Users,
  GraduationCap,
  Handshake,
  Award,
  Network,
  HeartHandshake,
  ArrowRight,
} from "lucide-react";

import "./FocusAreas.css";

const focusAreas = [
  {
    number: "01",
    title: "Strengthen Representation",
    icon: Users,
    description:
      "Strengthen the collective voice of students by promoting effective representation, coordinated advocacy and meaningful participation in decision-making.",
  },
  {
    number: "02",
    title: "Develop Leadership",
    icon: GraduationCap,
    description:
      "Equip student leaders with the knowledge, skills and values needed to lead responsibly, inspire change and contribute to national development.",
  },
  {
    number: "03",
    title: "Foster Unity & Cohesion",
    icon: Network,
    description:
      "Promote unity, collaboration and solidarity among county students' associations through shared experiences, dialogue and collective action.",
  },
  {
    number: "04",
    title: "Build Recognition",
    icon: Award,
    description:
      "Enhance the visibility, credibility and recognition of county students' associations as important partners in education and youth development.",
  },
  {
    number: "05",
    title: "Build Partnerships",
    icon: Handshake,
    description:
      "Establish meaningful partnerships with government institutions, development partners, educational institutions and other stakeholders.",
  },
  {
    number: "06",
    title: "Enhance Mentorship",
    icon: HeartHandshake,
    description:
      "Create mentorship opportunities that connect emerging student leaders with experienced leaders, professionals and role models.",
  },
];

function FocusAreas() {
  return (
    <main className="focus-page">

      {/* HERO SECTION */}
      <section className="focus-hero">
        <div className="focus-container">
          <div className="focus-hero-content">

            <span className="focus-eyebrow">
              OUR FOCUS
            </span>

            <h1>
              Main Focus <span>Areas</span>
            </h1>

            <p>
              ACSP-KE's work is organized in six strategic goals
              driving youth empowerment and Kenya's development.
            </p>

            <Link to="/programs" className="focus-hero-button">
              Explore Programs
              <ArrowRight size={17} />
            </Link>

          </div>
        </div>
      </section>

      {/* OUR FOCUS AREAS */}
      <section className="focus-goals">
        <div className="focus-container">

          <div className="focus-section-heading">
            <span className="focus-section-label">
              OUR FOCUS
            </span>

            <h2>
              Main Focus <span>Areas</span>
            </h2>

            <p>
              Six strategic goals guiding our commitment to
              stronger student representation, effective
              leadership and sustainable development.
            </p>
          </div>

          <div className="focus-goals-grid">
            {focusAreas.map((area) => {
              const Icon = area.icon;

              return (
                <article
                  className="focus-goal-card"
                  key={area.number}
                >
                  <div className="focus-goal-top">
                    <div className="focus-goal-icon">
                      <Icon size={23} />
                    </div>

                    <span className="focus-goal-number">
                      {area.number}
                    </span>
                  </div>

                  <h3>{area.title}</h3>

                  <p>{area.description}</p>

                  <div className="focus-goal-line" />
                </article>
              );
            })}
          </div>

        </div>
      </section>

    </main>
  );
}

export default FocusAreas;
