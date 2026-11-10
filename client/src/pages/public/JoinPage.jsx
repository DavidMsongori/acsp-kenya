
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Users,
  ArrowRight,
  CheckCircle2,
  Building2,
  UserRound,
} from "lucide-react";

import "./JoinPage.css";

const JoinPage = () => {
  return (
    <main className="join-page">
      {/* HERO */}
      <section className="join-hero">
        <div className="join-container">
          <span className="join-eyebrow">
            BECOME PART OF ACSP-KENYA
          </span>

          <h1>
            Your Voice. Your Leadership.
            <span> Your ACSP-Kenya.</span>
          </h1>

          <p>
            Join a national platform committed to strengthening
            student leadership, representation and unity across Kenya.
            Choose the registration pathway that best describes you.
          </p>
        </div>
      </section>

      {/* REGISTRATION CHOICES */}
      <section className="join-choices-section">
        <div className="join-container">
          <div className="join-section-heading">
            <span>CHOOSE YOUR MEMBERSHIP PATH</span>
            <h2>How Would You Like to Join Us?</h2>
            <p>
              Select one of the options below to continue with
              the appropriate registration process.
            </p>
          </div>

          <div className="join-choice-grid">
            {/* COUNTY ASSOCIATION PRESIDENT */}
            <article className="join-choice-card president-choice">
              <div className="join-choice-icon">
                <Building2 size={32} />
              </div>

              <span className="join-choice-label">
                LEADERSHIP REGISTRATION
              </span>

              <h3>
                County Students Association President
              </h3>

              <p className="join-choice-description">
                For elected County Students Association Presidents
                seeking to register their County Association and
                participate in ACSP-Kenya's national leadership
                structure.
              </p>

              <ul>
                <li>
                  <CheckCircle2 size={17} />
                  Register as a County Association President
                </li>
                <li>
                  <CheckCircle2 size={17} />
                  Submit your County Association details
                </li>
                <li>
                  <CheckCircle2 size={17} />
                  Access the existing leadership application process
                </li>
              </ul>

              <Link
                to="/register"
                className="join-choice-button"
              >
                Continue as President
                <ArrowRight size={18} />
              </Link>
            </article>

            {/* INDIVIDUAL STUDENT */}
            <article className="join-choice-card student-choice">
              <div className="join-choice-icon">
                <GraduationCap size={34} />
              </div>

              <span className="join-choice-label">
                INDIVIDUAL MEMBERSHIP
              </span>

              <h3>Individual Student</h3>

              <p className="join-choice-description">
                For individual students in recognised institutions
                who wish to become members of ACSP-Kenya and
                participate in its programmes, opportunities
                and student engagement activities.
              </p>

              <ul>
                <li>
                  <CheckCircle2 size={17} />
                  Register in your individual capacity
                </li>
                <li>
                  <CheckCircle2 size={17} />
                  Submit your student membership application
                </li>
                <li>
                  <CheckCircle2 size={17} />
                  Follow your membership application status
                </li>
              </ul>

              <Link
                to="/individual/register"
                className="join-choice-button"
              >
                Join as an Individual
                <ArrowRight size={18} />
              </Link>
            </article>
          </div>

          <div className="join-help">
            <div className="join-help-icon">
              <UserRound size={22} />
            </div>

            <p>
              <strong>Not sure which option to choose?</strong>
              <span>
                County Association Presidents should select the
                leadership registration option. Students who want
                to join independently should select individual
                membership.
              </span>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default JoinPage;
