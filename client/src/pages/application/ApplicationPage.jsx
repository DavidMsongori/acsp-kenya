
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../../services/api";
import { submitApplication } from "../../services/application.service";

import "./ApplicationPage.css";

const initialFormData = {
  fullName: "",
  phone: "",
  countyId: "",
  associationName: "",
  acronym: "",
  associationEmail: "",
  associationPhone: "",
  termStart: "",
  termEnd: "",
};

const ApplicationPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [counties, setCounties] = useState([]);
  const [associationLogo, setAssociationLogo] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);

  const [loadingCounties, setLoadingCounties] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  

  // ==========================================
  // Load Counties
  // ==========================================

  useEffect(() => {
    const fetchCounties = async () => {
      try {
        setLoadingCounties(true);

        const { data } = await api.get("/api/counties");

        setCounties(data.counties || []);
      } catch (error) {
        console.error("County loading error:", error);

        toast.error("Unable to load counties. Please refresh the page.");
      } finally {
        setLoadingCounties(false);
      }
    };

    fetchCounties();
  }, []);

  // ==========================================
  // Handle Form Changes
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // ==========================================
  // Handle Image Selection
  // ==========================================

  const validateImage = (file) => {
    if (!file) return false;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG and WebP images are allowed.");
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Each image must not exceed 5 MB.");
      return false;
    }

    return true;
  };

  const handleImageChange = (e, imageType) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!validateImage(file)) {
      e.target.value = "";
      return;
    }

    if (imageType === "associationLogo") {
      setAssociationLogo(file);
    } else {
      setProfilePhoto(file);
    }
  };

  // ==========================================
  // Upload Application Images
  // ==========================================

  const uploadImages = async () => {
    const imageData = new FormData();

    imageData.append("associationLogo", associationLogo);
    imageData.append("profilePhoto", profilePhoto);

    const { data } = await api.post(
      "/api/uploads/application-images",
      imageData
    );

    return data.images;
  };

  // ==========================================
  // Submit Application
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!associationLogo || !profilePhoto) {
      toast.error(
        "Please upload both your association logo and profile photograph."
      );
      return;
    }

    if (
      formData.termStart &&
      formData.termEnd &&
      formData.termEnd < formData.termStart
    ) {
      toast.error(
        "Term end date cannot be earlier than term start date."
      );
      return;
    }

    try {
      setSubmitting(true);

      toast.loading("Uploading application images...", {
        id: "application-submit",
      });

      const images = await uploadImages();

      toast.loading("Submitting your application...", {
        id: "application-submit",
      });

      await submitApplication({
        ...formData,
        profilePhotoUrl: images.profilePhoto.url,
        associationLogoUrl: images.associationLogo.url,
      });

      toast.success("Your application has been submitted successfully!", {
        id: "application-submit",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Application submission error:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to submit your application.",
        { id: "application-submit" }
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="application-page">
      <div className="application-container">
        <header className="application-header">
          <Link to="/dashboard" className="application-back">
            ← Back to Dashboard
          </Link>

          <h1>County President Application</h1>

          <p>
            Complete this form to apply for membership as a
            County Association President in ACSP-Kenya.
          </p>
        </header>

        <form
          className="application-form"
          onSubmit={handleSubmit}
        >
          {/* Personal Information */}

          <section className="application-section">
            <div className="section-heading">
              <span>01</span>

              <div>
                <h2>Personal Information</h2>
                <p>Provide your personal details.</p>
              </div>
            </div>

            <div className="application-grid">
              <div className="application-field full-width">
                <label htmlFor="fullName">Full Name *</label>

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="application-field">
                <label htmlFor="phone">Phone Number *</label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="0712345678"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="application-field">
                <label htmlFor="countyId">County *</label>

                <select
                  id="countyId"
                  name="countyId"
                  value={formData.countyId}
                  onChange={handleChange}
                  required
                  disabled={loadingCounties}
                >
                  <option value="">
                    {loadingCounties
                      ? "Loading counties..."
                      : "Select your county"}
                  </option>

                  {counties.map((county) => (
                    <option key={county.id} value={county.id}>
                      {county.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Association Information */}

          <section className="application-section">
            <div className="section-heading">
              <span>02</span>

              <div>
                <h2>County Association Information</h2>
                <p>
                  Enter the official details of your County
                  Students Association.
                </p>
              </div>
            </div>

            <div className="application-grid">
              <div className="application-field full-width">
                <label htmlFor="associationName">
                  Association Name *
                </label>

                <input
                  id="associationName"
                  name="associationName"
                  type="text"
                  placeholder="Enter the official association name"
                  value={formData.associationName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="application-field">
                <label htmlFor="acronym">
                  Association Acronym
                </label>

                <input
                  id="acronym"
                  name="acronym"
                  type="text"
                  placeholder="e.g. KCSA"
                  value={formData.acronym}
                  onChange={handleChange}
                />
              </div>

              <div className="application-field">
                <label htmlFor="associationEmail">
                  Association Email
                </label>

                <input
                  id="associationEmail"
                  name="associationEmail"
                  type="email"
                  placeholder="association@example.com"
                  value={formData.associationEmail}
                  onChange={handleChange}
                />
              </div>

              <div className="application-field">
                <label htmlFor="associationPhone">
                  Association Phone
                </label>

                <input
                  id="associationPhone"
                  name="associationPhone"
                  type="tel"
                  placeholder="Association contact number"
                  value={formData.associationPhone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          {/* Leadership Term */}

          <section className="application-section">
            <div className="section-heading">
              <span>03</span>

              <div>
                <h2>Leadership Term</h2>
                <p>
                  Provide your current or intended leadership
                  term, where applicable.
                </p>
              </div>
            </div>

            <div className="application-grid">
              <div className="application-field">
                <label htmlFor="termStart">Term Start Date</label>

                <input
                  id="termStart"
                  name="termStart"
                  type="date"
                  value={formData.termStart}
                  onChange={handleChange}
                />
              </div>

              <div className="application-field">
                <label htmlFor="termEnd">Term End Date</label>

                <input
                  id="termEnd"
                  name="termEnd"
                  type="date"
                  min={formData.termStart || undefined}
                  value={formData.termEnd}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          {/* Required Images */}

          <section className="application-section">
            <div className="section-heading">
              <span>04</span>

              <div>
                <h2>Required Images</h2>
                <p>
                  Upload your official association logo and
                  a clear profile photograph.
                </p>
              </div>
            </div>

            <div className="application-grid">
              <div className="application-field">
                <label htmlFor="associationLogo">
                  Association Logo *
                </label>

                <input
                  id="associationLogo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) =>
                    handleImageChange(e, "associationLogo")
                  }
                  required
                />

                <small>
                  JPG, PNG or WebP. Maximum size: 5 MB.
                </small>

                {associationLogo && (
                  <p className="selected-file">
                    Selected: {associationLogo.name}
                  </p>
                )}
              </div>

              <div className="application-field">
                <label htmlFor="profilePhoto">
                  Profile Photograph *
                </label>

                <input
                  id="profilePhoto"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) =>
                    handleImageChange(e, "profilePhoto")
                  }
                  required
                />

                <small>
                  Use a clear photograph of yourself.
                  Maximum size: 5 MB.
                </small>

                {profilePhoto && (
                  <p className="selected-file">
                    Selected: {profilePhoto.name}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Declaration */}

          <div className="application-declaration">
            <p>
              By submitting this application, I confirm that
              the information provided is accurate and that
              I am applying as a County Association President.
              I understand that submission does not guarantee
              approval or association verification. Both
              decisions are subject to NEC review.
            </p>
          </div>

          <div className="application-actions">
            <Link to="/dashboard" className="cancel-button">
              Cancel
            </Link>

            <button type="submit" disabled={submitting}>
              {submitting
                ? "Submitting Application..."
                : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default ApplicationPage;
