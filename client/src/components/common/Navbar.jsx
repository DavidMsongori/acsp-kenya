import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";

import logo from "../../assets/logo.png";
import "./Navbar.css";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState("");

  const navigation = [
    { label: "Home", path: "/" },
    {
      label: "Who We Are",
      children: [
        { label: "About Us", path: "/about" },
        { label: "Mission & Vision", path: "/mission-vision" },
        { label: "Leadership", path: "/leadership" },
        { label: "Timeline", path: "/timeline" },
      ],
    },
    {
  label: "What We Do",
  children: [
    { label: "Focus Areas", path: "/focus-areas" },
    { label: "Programs", path: "/programs" },
    { label: "Activities", path: "/activities" },
  ],
},
    { label: "Where We Work", path: "/where-we-work" },
    { label: "Events", path: "/events" },
    { label: "News", path: "/news" },
    { label: "Contact", path: "/contact" },
  ];

  const closeMenu = () => {
    setMobileOpen(false);
    setMobileDropdown("");
  };

  const toggleDropdown = (label) => {
    setMobileDropdown((current) => current === label ? "" : label);
  };

  return (
    <header className="public-navbar">
      <div className="public-navbar-container">

        {/* Brand */}
        <Link to="/" className="public-brand" onClick={closeMenu}>
          <img
            src={logo}
            alt="ACSP-Kenya Logo"
            className="public-brand-logo"
          />

          <div className="public-brand-text">
            <strong>ACSP-KE</strong>
            <span>Diverse Voices, Common Goals, One Vision</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="public-nav-links">
          {navigation.map((item) => (
            <div
              key={item.label}
              className={`public-nav-item ${item.children ? "has-dropdown" : ""}`}
            >
              {item.children ? (
                <>
                  <button type="button" className="public-nav-link dropdown-trigger">
                    {item.label}
                    <ChevronDown size={14} />
                  </button>

                  <div className="public-dropdown">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive }) =>
                          isActive ? "public-dropdown-link active" : "public-dropdown-link"
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                </>
              ) : (
                <NavLink
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    isActive ? "public-nav-link active" : "public-nav-link"
                  }
                >
                  {item.label}
                </NavLink>
              )}
            </div>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="public-nav-actions">
          <Link to="/register" className="public-join-button">
            Join Us
          </Link>

          <Link to="/login" className="public-login-button">
            Login
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          className="public-mobile-toggle"
          onClick={() => setMobileOpen((current) => !current)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="public-mobile-menu">
          <nav>
            {navigation.map((item) => (
              <div key={item.label} className="public-mobile-nav-item">
                {item.children ? (
                  <>
                    <button
                      type="button"
                      className="public-mobile-link public-mobile-dropdown-trigger"
                      onClick={() => toggleDropdown(item.label)}
                    >
                      {item.label}
                      <ChevronDown
                        size={17}
                        className={mobileDropdown === item.label ? "rotated" : ""}
                      />
                    </button>

                    {mobileDropdown === item.label && (
                      <div className="public-mobile-submenu">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            onClick={closeMenu}
                            className={({ isActive }) =>
                              isActive ? "public-mobile-sublink active" : "public-mobile-sublink"
                            }
                          >
                            {child.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <NavLink
                    to={item.path}
                    end={item.path === "/"}
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      isActive ? "public-mobile-link active" : "public-mobile-link"
                    }
                  >
                    {item.label}
                  </NavLink>
                )}
              </div>
            ))}

            <Link
              to="/register"
              className="public-mobile-link public-mobile-join"
              onClick={closeMenu}
            >
              Join Us
            </Link>

            <Link
              to="/login"
              className="public-mobile-login"
              onClick={closeMenu}
            >
              Login to Your Account
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;