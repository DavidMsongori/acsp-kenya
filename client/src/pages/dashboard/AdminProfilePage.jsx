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
} from "lucide-react";

import toast from "react-hot-toast";

import api from "../../services/api";
import AdminDashboardLayout from "../../components/layouts/admin/AdminDashboardLayout";

import "./AdminProfilePage.css";

const AdminProfilePage = () => {
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    photo_url: "",
    bio: "",
    role: "",
    created_at: null,
    updated_at: null,
    last_sign_in_at: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const response = await api.get("/admin/profile");

      setProfile((previous) => ({
        ...previous,
        ...response.data.profile,
      }));
    } catch (error) {
      console.error("Fetch admin profile error:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to load your profile."
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

      const response = await api.put("/admin/profile", {
        full_name: profile.full_name,
        phone: profile.phone,
        photo_url: profile.photo_url,
        bio: profile.bio,
      });

      setProfile((previous) => ({
        ...previous,
        ...response.data.profile,
      }));

      toast.success("Profile updated successfully.");
    } catch (error) {
      console.error("Update admin profile error:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleString("en-KE", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="admin-profile-loading">
          <RefreshCw className="spin" size={24} />
          <p>Loading your profile...</p>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="admin-profile-page">
        <div className="admin-profile-header">
          <div>
            <span className="admin-profile-eyebrow">
              ACCOUNT MANAGEMENT
            </span>

            <h1>My Profile</h1>

            <p>
              Manage your personal information and administrator
              account details.
            </p>
          </div>

          <button
            type="button"
            className="admin-profile-refresh"
            onClick={fetchProfile}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        <div className="admin-profile-grid">
          <section className="admin-profile-card admin-profile-summary">
            <div className="admin-profile-avatar">
              {profile.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt={profile.full_name}
                />
              ) : (
                <UserCircle size={76} />
              )}
            </div>

            <h2>{profile.full_name || "Administrator"}</h2>

            <p>{profile.email}</p>

            <span className="admin-profile-role">
              <ShieldCheck size={15} />
              {(profile.role || "Administrator").replaceAll("_", " ")}
            </span>

            <div className="admin-profile-summary-divider" />

            <div className="admin-profile-meta">
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
                  <strong>
                    {formatDate(profile.last_sign_in_at)}
                  </strong>
                </span>
              </div>
            </div>
          </section>

          <section className="admin-profile-card admin-profile-form-card">
            <div className="admin-profile-section-heading">
              <div>
                <h2>Personal Information</h2>
                <p>Update your administrator profile details.</p>
              </div>
            </div>

            <form onSubmit={saveProfile}>
              <div className="admin-profile-form-grid">
                <div className="admin-profile-field full-width">
                  <label htmlFor="profile-name">Full Name *</label>

                  <div className="admin-profile-input">
                    <UserCircle size={18} />

                    <input
                      id="profile-name"
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

                <div className="admin-profile-field">
                  <label htmlFor="profile-email">Email Address</label>

                  <div className="admin-profile-input disabled">
                    <Mail size={18} />

                    <input
                      id="profile-email"
                      type="email"
                      value={profile.email}
                      disabled
                    />
                  </div>

                  <small>
                    Your account email is managed through authentication.
                  </small>
                </div>

                <div className="admin-profile-field">
                  <label htmlFor="profile-phone">Phone Number</label>

                  <div className="admin-profile-input">
                    <Phone size={18} />

                    <input
                      id="profile-phone"
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

                <div className="admin-profile-field full-width">
                  <label htmlFor="profile-photo">Profile Photo URL</label>

                  <div className="admin-profile-input">
                    <Camera size={18} />

                    <input
                      id="profile-photo"
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

                <div className="admin-profile-field full-width">
                  <label htmlFor="profile-bio">About Me</label>

                  <textarea
                    id="profile-bio"
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

              <div className="admin-profile-form-actions">
                <button
                  type="button"
                  className="admin-profile-cancel"
                  onClick={fetchProfile}
                  disabled={saving}
                >
                  Reset Changes
                </button>

                <button
                  type="submit"
                  className="admin-profile-save"
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
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminProfilePage;