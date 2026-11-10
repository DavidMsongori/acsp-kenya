
import { useEffect, useState } from "react";
import {
  UserCircle,
  Mail,
  Phone,
  Camera,
  Save,
  RefreshCw,
  ShieldCheck,
  CalendarDays,
  Clock,
  Building2,
  MapPin,
  BadgeCheck,
  FileText,
} from "lucide-react";

import toast from "react-hot-toast";

import PresidentDashboardLayout from "../../components/layouts/president/PresidentDashboardLayout";

import {
  getAssociationProfile,
  updateAssociationProfile,
} from "../../services/association.profile.service";

import "./AssociationAccountPage.css";

const initialProfile = {
  full_name: "",
  email: "",
  phone: "",
  photo_url: "",
  bio: "",
  role: "county_president",
  created_at: null,
  updated_at: null,
  last_sign_in_at: null,
};

const formatDate = (date) => {
  if (!date) return "Not available";

  return new Date(date).toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatStatus = (value) => {
  if (!value) return "Not available";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const AssociationAccountPage = () => {
  const [profile, setProfile] = useState(initialProfile);
  const [application, setApplication] = useState(null);
  const [association, setAssociation] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const response = await getAssociationProfile();

      setProfile({
        ...initialProfile,
        ...response.profile,
      });

      setApplication(response.application || null);
      setAssociation(response.association || null);
    } catch (error) {
      console.error("Fetch account profile error:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to load your account information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const updateField = (field, value) => {
    setProfile((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      const response = await updateAssociationProfile({
        full_name: profile.full_name,
        phone: profile.phone,
        photo_url: profile.photo_url,
        bio: profile.bio,
      });

      setProfile((previous) => ({
        ...previous,
        ...response.profile,
      }));

      toast.success("Your profile was updated successfully.");
    } catch (error) {
      console.error("Update account profile error:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PresidentDashboardLayout
        title="My Account"
        subtitle="Manage your personal and account information."
      >
        <div className="association-account-loading">
          <RefreshCw size={24} className="spin" />
          <p>Loading your account...</p>
        </div>
      </PresidentDashboardLayout>
    );
  }

  return (
    <PresidentDashboardLayout
      title="My Account"
      subtitle="Manage your personal profile and view your County Association details."
    >
      <div className="association-account-page">

        {/* PAGE HEADER */}
        <div className="association-account-header">
          <div>
            <span className="association-account-eyebrow">
              ACCOUNT MANAGEMENT
            </span>

            <h1>My Account</h1>

            <p>
              Manage your personal information and view your
              official County Association records.
            </p>
          </div>

          <button
            type="button"
            className="association-account-refresh"
            onClick={fetchProfile}
            disabled={loading || saving}
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        <div className="association-account-grid">

          {/* PERSONAL PROFILE SUMMARY */}
          <section className="association-account-card association-account-summary">
            <div className="association-account-avatar">
              {profile.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt={profile.full_name || "Profile"}
                />
              ) : (
                <UserCircle size={76} />
              )}
            </div>

            <h2>{profile.full_name || "County President"}</h2>

            <p>{profile.email || "Email not available"}</p>

            <span className="association-account-role">
              <ShieldCheck size={15} />
              County President
            </span>

            <div className="association-account-summary-divider" />

            <div className="association-account-meta">
              <div>
                <CalendarDays size={17} />

                <span>
                  <small>Account created</small>
                  <strong>{formatDate(profile.created_at)}</strong>
                </span>
              </div>

              <div>
                <Clock size={17} />

                <span>
                  <small>Last sign in</small>
                  <strong>{formatDate(profile.last_sign_in_at)}</strong>
                </span>
              </div>
            </div>
          </section>

          {/* EDITABLE PERSONAL PROFILE */}
          <section className="association-account-card association-account-form-card">
            <div className="association-account-section-heading">
              <div>
                <h2>Personal Information</h2>
                <p>
                  Update your personal profile information.
                </p>
              </div>
            </div>

            <form onSubmit={saveProfile}>
              <div className="association-account-form-grid">

                <div className="association-account-field full-width">
                  <label htmlFor="account-name">Full Name *</label>

                  <div className="association-account-input">
                    <UserCircle size={18} />

                    <input
                      id="account-name"
                      type="text"
                      value={profile.full_name}
                      onChange={(event) =>
                        updateField("full_name", event.target.value)
                      }
                      placeholder="Enter your full name"
                      maxLength={200}
                      required
                    />
                  </div>
                </div>

                <div className="association-account-field">
                  <label htmlFor="account-email">Email Address</label>

                  <div className="association-account-input disabled">
                    <Mail size={18} />

                    <input
                      id="account-email"
                      type="email"
                      value={profile.email}
                      disabled
                    />
                  </div>

                  <small>
                    Your email is managed through authentication.
                  </small>
                </div>

                <div className="association-account-field">
                  <label htmlFor="account-phone">Phone Number</label>

                  <div className="association-account-input">
                    <Phone size={18} />

                    <input
                      id="account-phone"
                      type="tel"
                      value={profile.phone || ""}
                      onChange={(event) =>
                        updateField("phone", event.target.value)
                      }
                      placeholder="Enter your phone number"
                      maxLength={30}
                    />
                  </div>
                </div>

                <div className="association-account-field full-width">
                  <label htmlFor="account-photo">Profile Photo URL</label>

                  <div className="association-account-input">
                    <Camera size={18} />

                    <input
                      id="account-photo"
                      type="url"
                      value={profile.photo_url || ""}
                      onChange={(event) =>
                        updateField("photo_url", event.target.value)
                      }
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>

                  <small>
                    Enter a publicly accessible image URL.
                  </small>
                </div>

                <div className="association-account-field full-width">
                  <label htmlFor="account-bio">About Me</label>

                  <textarea
                    id="account-bio"
                    value={profile.bio || ""}
                    onChange={(event) =>
                      updateField("bio", event.target.value)
                    }
                    placeholder="Write a short introduction about yourself..."
                    rows={5}
                    maxLength={2000}
                  />

                  <small>
                    {profile.bio?.length || 0}/2000 characters
                  </small>
                </div>
              </div>

              <div className="association-account-form-actions">
                <button
                  type="button"
                  className="association-account-reset"
                  onClick={fetchProfile}
                  disabled={saving}
                >
                  Reset Changes
                </button>

                <button
                  type="submit"
                  className="association-account-save"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <RefreshCw size={17} className="spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      Save Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* COUNTY ASSOCIATION INFORMATION */}
        <section className="association-account-card association-account-official">
          <div className="association-account-section-heading">
            <div>
              <h2>Official County Association Information</h2>
              <p>
                Your approved County Association and presidential
                application records.
              </p>
            </div>

            <Building2 size={25} />
          </div>

          {!application ? (
            <div className="association-account-empty">
              <FileText size={30} />
              <h3>No Application Found</h3>
              <p>
                Your County President application information is
                not currently available.
              </p>
            </div>
          ) : (
            <>
              <div className="association-account-statuses">
                <div>
                  <small>Application Status</small>
                  <strong className="association-account-status">
                    {formatStatus(application.application_status)}
                  </strong>
                </div>

                <div>
                  <small>Association Verification</small>
                  <strong className="association-account-status">
                    {formatStatus(association?.verification_status)}
                  </strong>
                </div>
              </div>

              <div className="association-account-official-grid">
                <div className="association-account-detail">
                  <Building2 size={18} />
                  <span>
                    <small>Association Name</small>
                    <strong>
                      {association?.association_name || "Not available"}
                    </strong>
                  </span>
                </div>

                <div className="association-account-detail">
                  <BadgeCheck size={18} />
                  <span>
                    <small>Association Acronym</small>
                    <strong>
                      {association?.acronym || "Not available"}
                    </strong>
                  </span>
                </div>

                <div className="association-account-detail">
                  <MapPin size={18} />
                  <span>
                    <small>County</small>
                    <strong>
                      {association?.counties?.name || "Not available"}
                    </strong>
                  </span>
                </div>

                <div className="association-account-detail">
                  <Mail size={18} />
                  <span>
                    <small>Association Email</small>
                    <strong>
                      {association?.email || "Not available"}
                    </strong>
                  </span>
                </div>

                <div className="association-account-detail">
                  <Phone size={18} />
                  <span>
                    <small>Association Phone</small>
                    <strong>
                      {association?.phone || "Not available"}
                    </strong>
                  </span>
                </div>

                <div className="association-account-detail">
                  <CalendarDays size={18} />
                  <span>
                    <small>Presidential Term</small>
                    <strong>
                      {application.term_start || "Not specified"}
                      {" — "}
                      {application.term_end || "Not specified"}
                    </strong>
                  </span>
                </div>

                <div className="association-account-detail">
                  <CalendarDays size={18} />
                  <span>
                    <small>Application Submitted</small>
                    <strong>{formatDate(application.created_at)}</strong>
                  </span>
                </div>

                <div className="association-account-detail">
                  <Clock size={18} />
                  <span>
                    <small>Last Reviewed</small>
                    <strong>{formatDate(application.reviewed_at)}</strong>
                  </span>
                </div>
              </div>

              {application.review_notes && (
                <div className="association-account-review-notes">
                  <strong>Review Notes</strong>
                  <p>{application.review_notes}</p>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </PresidentDashboardLayout>
  );
};

export default AssociationAccountPage;
