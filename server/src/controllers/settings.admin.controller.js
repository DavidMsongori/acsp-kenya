
import { supabaseAdmin } from "../config/supabase.js";

const ALLOWED_SETTINGS = [
  "organisation_profile",
  "membership_settings",
  "website_settings",
  "notification_settings",
  "security_settings",
];

// ==========================================
// GET ALL SYSTEM SETTINGS
// ==========================================

export const getSystemSettings = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("system_settings")
      .select("id, setting_key, setting_value, description, updated_by, updated_at")
      .order("setting_key", { ascending: true });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      settings: data || [],
    });
  } catch (error) {
    console.error("Get system settings error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve system settings.",
    });
  }
};

// ==========================================
// UPDATE A SETTINGS GROUP
// ==========================================

export const updateSystemSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { setting_value } = req.body;

    if (!ALLOWED_SETTINGS.includes(key)) {
      return res.status(400).json({
        success: false,
        message: "Invalid settings category.",
      });
    }

    if (
      !setting_value ||
      typeof setting_value !== "object" ||
      Array.isArray(setting_value)
    ) {
      return res.status(400).json({
        success: false,
        message: "Settings must be provided as a valid object.",
      });
    }

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("system_settings")
      .select("setting_value")
      .eq("setting_key", key)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Settings category not found.",
      });
    }

    // Merge submitted values with existing values so that
    // unspecified configuration fields are preserved.
    const updatedValue = {
      ...existing.setting_value,
      ...setting_value,
    };

    const { data, error } = await supabaseAdmin
      .from("system_settings")
      .update({
        setting_value: updatedValue,
        updated_by: req.user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("setting_key", key)
      .select("id, setting_key, setting_value, description, updated_by, updated_at")
      .single();

    if (error) throw error;

    // Record the configuration change.
    const { error: auditError } = await supabaseAdmin
      .from("audit_logs")
      .insert({
        user_id: req.user.id,
        action: "system_setting_updated",
        entity_type: "system_setting",
        entity_id: String(data.id),
        module: "settings",
        description: `Updated system settings: ${key}`,
        details: {
          setting_key: key,
          updated_fields: Object.keys(setting_value),
        },
      });

    if (auditError) {
      console.error("Settings audit log error:", auditError.message);
    }

    return res.status(200).json({
      success: true,
      message: "System settings updated successfully.",
      setting: data,
    });
  } catch (error) {
    console.error("Update system settings error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update system settings.",
    });
  }
};
