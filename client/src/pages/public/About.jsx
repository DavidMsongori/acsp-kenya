
import { Link } from "react-router-dom";
import {
  Users,
  GraduationCap,
  Handshake,
  ShieldCheck,
  Scale,
  Lightbulb,
  Building2,
  Landmark,
  Network,
  MapPin,
  BookOpen,
  ArrowRight,
} from "lucide-react";

import "./About.css";

const values = [
  {
    icon: Handshake,
    title: "Unity",
    description:
      "Bringing county student leaders together through a shared national identity and collective purpose.",
  },
  {
    icon: ShieldCheck,
    title: "Integrity",
    description:
      "Upholding honesty, transparency and responsible leadership in all our engagements.",
  },
  {
    icon: Scale,
    title: "Accountability",
    description:
      "Promoting responsible representation and ensuring that student voices are heard and respected.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "Encouraging creative ideas and practical solutions to challenges affecting students.",
  },
  {
    icon: Users,
    title: "Inclusivity",
    description:
      "Creating space for diverse voices, backgrounds and perspectives across all 47 counties.",
  },
  {
    icon: GraduationCap,
    title: "Leadership",
    description:
      "Developing ethical, visionary and service-oriented student leaders for the future.",
  },
];

const organizationalStructure = [
  {
    title: "National Secretariat",
    icon: Landmark,
  },
  {
    title: "General Assembly",
    icon: Building2,
  },
  {
    title: "Ministries",
    icon: Network,
  },
  {
    title: "Regional Directors",
    icon: MapPin,
  },
  {
    title: "ACSP-KE Clubs",
    icon: BookOpen,
  },
];

const About = () => {
  return (
    <main className="about-page">

      {/* HERO SECTION */}
      <section className="about-hero">
        <div className="about-container about-hero-content">

          <span className="about-eyebrow">
            ABOUT ACSP-K
          </span>

          <h1>
            Building Kenya's Future Through Unity
          </h1>

          <p>
            A national platform bringing together County Students
            Association Presidents to strengthen representation,
            develop leadership and advance the collective interests
            of students across Kenya.
          </p>

          <Link
            to="/mission-vision"
            className="about-hero-button"
          >
            View Our Mission
            <ArrowRight size={17} />
          </Link>

        </div>
      </section>

      {/* OUR STORY */}
      <section
        className="about-story section-spacing"
        id="our-story"
      >
        <div className="about-container story-container">

          <span className="about-section-label">
            OUR STORY
          </span>

          <h2>
            A Brief Story About ACSP-K
          </h2>

          <div className="about-yellow-line" />

          <div className="story-content">
            <p>
              The Association of County Students Presidents Kenya
              (ACSP-Kenya) is a national student leadership platform
              established in 2024 to bring together County Students
              Association Presidents from across the 47 counties of Kenya.
            </p>

            <p>
              The organization recognizes the importance of collective
              representation and the role that organized student
              leadership plays in addressing issues affecting learners
              in institutions of higher learning.
            </p>

            <p>
              ACSP-Kenya provides a common platform through which county
              student leaders can engage, exchange ideas, build
              partnerships and advance shared priorities.
            </p>

            <p>
              Guided by the belief that empowered young people are
              essential to national development, ACSP-Kenya seeks to
              strengthen student leadership and create meaningful
              opportunities for participation in matters of public
              interest.
            </p>
          </div>

        </div>
      </section>

      {/* THE CHALLENGE AND OUR SOLUTION */}
      <section className="about-challenge section-spacing">
        <div className="about-container">

          <div className="about-centered-heading">
            <h2>
              The Challenge <span>& Our Solution</span>
            </h2>
          </div>

          <div className="challenge-grid">

            <article className="challenge-card">
              <h3>The Challenge</h3>

              <p>
                Students in Kenya's tertiary institutions face
                fragmented representation and weak coordination among
                county students' associations, limiting their ability
                to engage effectively at the national level.
              </p>

              <h4>The Critical Gap</h4>

              <p>
                Students are directly affected by education policies,
                funding decisions and institutional governance, yet
                the absence of a unified, county-rooted national
                platform weakens collective advocacy, reduces student
                influence in decision-making, and undermines structured
                engagement with stakeholders.
              </p>
            </article>

            <article className="solution-card">
              <h3>Our Solution</h3>

              <p>
                ACSP-Kenya provides a unified national platform that
                brings County Students Association Presidents together
                to strengthen coordination, promote collective
                representation and advance the shared interests of
                students across Kenya.
              </p>

              <p>
                Through structured leadership, regional coordination
                and meaningful engagement with stakeholders, we create
                opportunities for county student leaders to speak with
                one voice, influence decisions and champion issues
                affecting students in institutions of higher learning.
              </p>

              <p>
                By building partnerships, strengthening leadership
                capacity and promoting collaboration across all 47
                counties, ACSP-Kenya is working towards a more connected,
                effective and influential student leadership movement.
              </p>
            </article>

          </div>
        </div>
      </section>

      {/* OUR VALUES */}
      <section className="about-values section-spacing">
        <div className="about-container">

          <div className="about-centered-heading">
            <span className="about-section-label">
              OUR VALUES
            </span>

            <h2>
              What We <span>Stand For</span>
            </h2>
          </div>

          <div className="values-grid">
            {values.map((value) => {
              const Icon = value.icon;

              return (
                <article
                  className="value-card"
                  key={value.title}
                >
                  <div className="value-icon">
                    <Icon size={25} />
                  </div>

                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </article>
              );
            })}
          </div>

        </div>
      </section>

      {/* ORGANIZATIONAL STRUCTURE */}
      <section className="about-structure section-spacing">
        <div className="about-container">

          <div className="about-centered-heading structure-heading">

            <h2>
              Organizational <span>Structure</span>
            </h2>

          </div>

          <div className="structure-list">
            {organizationalStructure.map((item, index) => {
              const Icon = item.icon;

              return (
                <article
                  className="structure-card"
                  key={item.title}
                >
                  <div className="structure-icon">
                    <Icon size={25} />
                  </div>

                  <div className="structure-content">
                    <h3>{item.title}</h3>
                  </div>

                  {index !== organizationalStructure.length - 1 && (
                    <div className="structure-connector" />
                  )}
                </article>
              );
            })}
          </div>

        </div>
      </section>

    </main>
  );
};

export default About;
