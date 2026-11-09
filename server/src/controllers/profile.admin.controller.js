
import { supabaseAdmin } from "../config/supabase.js";

// ==========================================
// GET LOGGED-IN ADMINISTRATOR PROFILE
// ==========================================

export const getAdminProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, phone, photo_url, bio, created_at, updated_at")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Administrator profile not found.",
      });
    }

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.getUserById(userId);

    if (authError) throw authError;

    const { data: roles, error: rolesError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .in("role", ["super_admin", "nec_admin"]);

    if (rolesError) throw rolesError;

    return res.status(200).json({
      success: true,
      profile: {
        ...profile,
        email: authData.user?.email || "",
        role: roles?.[0]?.role || "",
        last_sign_in_at: authData.user?.last_sign_in_at || null,
      },
    });
  } catch (error) {
    console.error("Get admin profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve administrator profile.",
    });
  }
};

// ==========================================
// UPDATE LOGGED-IN ADMINISTRATOR PROFILE
// ==========================================

export const updateAdminProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { full_name, phone, photo_url, bio } = req.body;

    if (!full_name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Full name is required.",
      });
    }

    if (
      full_name.trim().length > 200 ||
      (phone && phone.length > 30) ||
      (photo_url && photo_url.length > 2000) ||
      (bio && bio.length > 2000)
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more profile fields exceed the permitted length.",
      });
    }

    if (photo_url && !/^https?:\/\/.+/i.test(photo_url)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid profile photo URL.",
      });
    }

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .update({
        full_name: full_name.trim(),
        phone: phone?.trim() || null,
        photo_url: photo_url?.trim() || null,
        bio: bio?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select("id, full_name, phone, photo_url, bio, created_at, updated_at")
      .single();

    if (error) throw error;

    // Record the profile update in the audit log.
    const { error: auditError } = await supabaseAdmin
      .from("audit_logs")
      .insert({
        user_id: userId,
        action: "admin_profile_updated",
        entity_type: "admin_profile",
        entity_id: userId,
        module: "profile",
        description: "Administrator updated their profile.",
        details: {
          updated_fields: ["full_name", "phone", "photo_url", "bio"],
        },
      });

    if (auditError) {
      console.error("Profile audit log error:", auditError.message);
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      profile,
    });
  } catch (error) {
    console.error("Update admin profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update administrator profile.",
    });
  }
};
