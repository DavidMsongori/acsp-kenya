
import { useEffect, useState } from "react";
import {
  Building2,
  Users,
  Globe,
  Bell,
  ShieldCheck,
  Save,
  RefreshCw,
  Settings,
  Server,
  CheckCircle2,
} from "lucide-react";

import toast from "react-hot-toast";

import api from "../../services/api";
import AdminDashboardLayout from "../../components/layouts/admin/AdminDashboardLayout";

import "./SystemSettingsPage.css";

const SETTINGS_SECTIONS = [
  { key: "organisation_profile", label: "Organisation Profile", icon: Building2 },
  { key: "membership_settings", label: "Membership", icon: Users },
  { key: "website_settings", label: "Website", icon: Globe },
  { key: "notification_settings", label: "Notifications", icon: Bell },
  { key: "security_settings", label: "Security & Access", icon: ShieldCheck },
];

const SystemSettingsPage = () => {
  const [settings, setSettings] = useState({});
  const [activeSection, setActiveSection] = useState("organisation_profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);

      const response = await api.get("/admin/settings");

      const formattedSettings = {};

      (response.data.settings || []).forEach((item) => {
        formattedSettings[item.setting_key] = item.setting_value;
      });

      setSettings(formattedSettings);
    } catch (error) {
      console.error("Fetch system settings error:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to load system settings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateField = (key, field, value) => {
    setSettings((previous) => ({
      ...previous,
      [key]: {
        ...previous[key],
        [field]: value,
      },
    }));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);

      await api.put(
        `/admin/settings/${activeSection}`,
        {
          setting_value: settings[activeSection],
        }
      );

      toast.success("Settings saved successfully.");
      setLastUpdated(new Date());
      fetchSettings();
    } catch (error) {
      console.error("Save settings error:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to save settings."
      );
    } finally {
      setSaving(false);
    }
  };

  const currentSettings = settings[activeSection] || {};

  const renderInput = (label, field, type = "text") => (
    <div className="system-setting-field" key={field}>
      <label>{label}</label>
      <input
        type={type}
        value={currentSettings[field] ?? ""}
        onChange={(event) =>
          updateField(activeSection, field, event.target.value)
        }
      />
    </div>
  );

  const renderToggle = (label, field, description) => (
    <div className="system-setting-toggle" key={field}>
      <div>
        <strong>{label}</strong>
        <p>{description}</p>
      </div>

      <label className="system-switch">
        <input
          type="checkbox"
          checked={Boolean(currentSettings[field])}
          onChange={(event) =>
            updateField(activeSection, field, event.target.checked)
          }
        />
        <span className="system-switch-slider" />
      </label>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case "organisation_profile":
        return (
          <>
            <div className="system-settings-section-heading">
              <h3>Organisation Profile</h3>
              <p>Manage ACSP-Kenya's official identity and contact information.</p>
            </div>

            <div className="system-settings-grid">
              {renderInput("Organisation Name", "name")}
              {renderInput("Acronym", "acronym")}
              {renderInput("Contact Email", "email", "email")}
              {renderInput("Phone Number", "phone", "tel")}
              {renderInput("Website URL", "website", "url")}
              {renderInput("Postal / Physical Address", "address")}
              {renderInput("Logo URL", "logo_url", "url")}
            </div>
          </>
        );

      case "membership_settings":
        return (
          <>
            <div className="system-settings-section-heading">
              <h3>Membership Settings</h3>
              <p>Configure membership registration and fee information.</p>
            </div>

            <div className="system-settings-grid">
              {renderInput("Membership Fee (KES)", "membership_fee", "number")}
              {renderInput("Currency", "currency")}
            </div>

            {renderToggle(
              "Enable Membership Registration",
              "registration_enabled",
              "Allow members to submit membership registrations."
            )}
          </>
        );

      case "website_settings":
        return (
          <>
            <div className="system-settings-section-heading">
              <h3>Website Settings</h3>
              <p>Control public website availability and visibility.</p>
            </div>

            {renderToggle(
              "Maintenance Mode",
              "maintenance_mode",
              "Indicate that the website is undergoing maintenance."
            )}

            {renderToggle(
              "Public Registration",
              "public_registration",
              "Allow visitors to access public registration."
            )}

            {renderToggle(
              "Show Announcements",
              "show_announcements",
              "Display announcements on the public website."
            )}
          </>
        );

      case "notification_settings":
        return (
          <>
            <div className="system-settings-section-heading">
              <h3>Notification Preferences</h3>
              <p>Manage system notification preferences.</p>
            </div>

            {renderToggle(
              "Email Notifications",
              "email_notifications",
              "Enable system email notifications."
            )}

            {renderToggle(
              "New Member Notifications",
              "new_member_notifications",
              "Receive notifications when a new member registers."
            )}

            {renderToggle(
              "New Application Notifications",
              "new_application_notifications",
              "Receive notifications when an application is submitted."
            )}

            {renderToggle(
              "Contact Message Notifications",
              "contact_message_notifications",
              "Receive notifications when visitors submit contact messages."
            )}
          </>
        );

      case "security_settings":
        return (
          <>
            <div className="system-settings-section-heading">
              <h3>Security & Access</h3>
              <p>Manage administrator access and account security policies.</p>
            </div>

            {renderToggle(
              "Require Email Verification",
              "require_email_verification",
              "Require email verification where supported by the registration process."
            )}

            {renderToggle(
              "Allow Administrator Invitations",
              "allow_admin_invitations",
              "Allow Super Administrators to invite new administrators."
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="system-settings-page">
        <div className="system-settings-header">
          <div>
            <span className="system-settings-eyebrow">
              SYSTEM ADMINISTRATION
            </span>
            <h1>System Settings</h1>
            <p>
              Manage organisation information, membership, website
              preferences and system security.
            </p>
          </div>

          <button
            className="system-settings-refresh"
            onClick={fetchSettings}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        <div className="system-settings-notice">
          <CheckCircle2 size={20} />
          <div>
            <strong>Super Administrator Configuration</strong>
            <p>
              Changes made here affect the system configuration.
              Review settings carefully before saving.
            </p>
          </div>
        </div>

        <div className="system-settings-layout">
          <aside className="system-settings-sidebar">
            <div className="system-settings-sidebar-title">
              <Settings size={17} />
              Configuration
            </div>

            {SETTINGS_SECTIONS.map((section) => {
              const Icon = section.icon;

              return (
                <button
                  key={section.key}
                  className={
                    activeSection === section.key
                      ? "system-settings-nav active"
                      : "system-settings-nav"
                  }
                  onClick={() => setActiveSection(section.key)}
                >
                  <Icon size={18} />
                  <span>{section.label}</span>
                </button>
              );
            })}

            <div className="system-settings-sidebar-info">
              <Server size={19} />
              <div>
                <strong>ACSP-Kenya Platform</strong>
                <span>System configuration</span>
              </div>
            </div>
          </aside>

          <main className="system-settings-content">
            {loading ? (
              <div className="system-settings-loading">
                <RefreshCw className="system-settings-spin" size={24} />
                <p>Loading system settings...</p>
              </div>
            ) : (
              <>
                <div className="system-settings-form">
                  {renderSection()}
                </div>

                <div className="system-settings-footer">
                  <div>
                    {lastUpdated && (
                      <span>
                        Last saved: {lastUpdated.toLocaleTimeString()}
                      </span>
                    )}
                  </div>

                  <button
                    className="system-settings-save"
                    onClick={saveSettings}
                    disabled={saving}
                  >
                    <Save size={17} />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default SystemSettingsPage;
