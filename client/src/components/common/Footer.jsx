
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  MapPin,
  Mail,
} from "lucide-react";

import "./Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="public-footer">
      <div className="public-footer-main">
        <div className="public-footer-container">

          {/* Organisation */}
          <div className="public-footer-about">
            <Link to="/" className="public-footer-brand">
              <div className="public-footer-brand-mark">
                ACSP
              </div>

              <div>
                <strong>ACSP-KENYA</strong>
                <span>Association of County Students Presidents</span>
              </div>
            </Link>

            <p>
              A national platform bringing together County Students
              Association Presidents to strengthen student leadership,
              representation, collaboration and participation in
              national development.
            </p>

            <div className="public-footer-socials">
              <a href="#" aria-label="Facebook">f</a>
              <a href="#" aria-label="Instagram">◎</a>
              <a href="#" aria-label="X">𝕏</a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="public-footer-column">
            <h3>Quick Links</h3>

            <Link to="/">Home</Link>
            <Link to="/about">About Us</Link>
            <Link to="/programs">Programs</Link>
            <Link to="/news">News & Updates</Link>
            <Link to="/leadership">Leadership</Link>
          </div>

          {/* Membership */}
          <div className="public-footer-column">
            <h3>Get Involved</h3>

            <Link to="/register">Join ACSP-Kenya</Link>
            <Link to="/login">Member Login</Link>
            <Link to="/leadership">National Leadership</Link>
            <Link to="/programs">Our Activities</Link>
          </div>

          {/* Contact */}
          <div className="public-footer-column public-footer-contact">
            <h3>Contact Us</h3>

            <div>
              <MapPin size={17} />
              <span>Kenya</span>
            </div>

            <a href="mailto:info@acsapkenya.org">
              <Mail size={17} />
              <span>info@acsapkenya.org</span>
            </a>

            <a
              href="https://www.acsapkenya.org"
              target="_blank"
              rel="noreferrer"
            >
              <ArrowUpRight size={17} />
              <span>www.acsapkenya.org</span>
            </a>
          </div>

        </div>
      </div>

      {/* Bottom Footer */}
      <div className="public-footer-bottom">
        <div className="public-footer-bottom-container">
          <p>
            © {currentYear} ACSP-Kenya. All Rights Reserved.
          </p>

          <p>
            Advancing Student Leadership. Strengthening County Representation.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
