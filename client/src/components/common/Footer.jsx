import { Link } from "react-router-dom";

import {
  ArrowUpRight,
  MapPin,
  Mail,
} from "lucide-react";

import {
  FaInstagram,
  FaFacebookF,
  FaXTwitter,
   FaYoutube,
} from "react-icons/fa6";

import logo from "../../assets/logo.png";

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
              <img
                src={logo}
                alt="ACSP-Kenya Logo"
                className="public-footer-logo"
              />

              <div>
                <strong>ACSP-KENYA</strong>
                <span>Diverse Voices · Common Goals · One Vision</span>
              </div>
            </Link>

            <p>
              A national platform bringing together County Students
              Association Presidents to strengthen student leadership,
              representation, collaboration and participation in
              national development.
            </p>

            <div className="public-footer-socials">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
                <FaFacebookF size={17} />
              </a>

              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <FaInstagram size={19} />
              </a>

              <a
                href="https://x.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="X"
              >
                <FaXTwitter size={18} />
              </a>

              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
              >
                <FaYoutube size={20} />
              </a>
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
            Diverse Voices · Common Goals · One Vision
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;