
import { supabaseAdmin } from "../config/supabase.js";

// ==========================================
// GET LOGGED-IN COUNTY PRESIDENT PROFILE
// ==========================================

export const getAssociationProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Retrieve personal profile.
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, phone, photo_url, bio, created_at, updated_at")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) throw profileError;

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Your personal profile was not found.",
      });
    }

    // Retrieve County President application and association.
    const { data: president, error: presidentError } = await supabaseAdmin
      .from("county_presidents")
      .select(`
        id,
        status,
        application_status,
        term_start,
        term_end,
        review_notes,
        reviewed_at,
        created_at,
        county_associations (
          id,
          association_name,
          acronym,
          email,
          phone,
          logo_url,
          verification_status,
          counties (
            id,
            name,
            code
          )
        )
      `)
      .eq("profile_id", userId)
      .maybeSingle();

    if (presidentError) throw presidentError;

    // Retrieve authenticated account details.
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.getUserById(userId);

    if (authError) throw authError;

    return res.status(200).json({
      success: true,
      profile: {
        ...profile,
        email: authData.user?.email || "",
        role: "county_president",
        last_sign_in_at: authData.user?.last_sign_in_at || null,
      },
      application: president || null,
      association: president?.county_associations || null,
    });
  } catch (error) {
    console.error("Get County President profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve your account information.",
    });
  }
};

// ==========================================
// UPDATE PERSONAL PROFILE
// ==========================================

export const updateAssociationProfile = async (req, res) => {
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

    // Record the update in the audit log.
    const { error: auditError } = await supabaseAdmin
      .from("audit_logs")
      .insert({
        user_id: userId,
        action: "association_profile_updated",
        entity_type: "association_profile",
        entity_id: userId,
        module: "profile",
        description: "County President updated their personal profile.",
        details: {
          updated_fields: ["full_name", "phone", "photo_url", "bio"],
        },
      });

    if (auditError) {
      console.error("Profile audit log error:", auditError.message);
    }

    return res.status(200).json({
      success: true,
      message: "Your profile was updated successfully.",
      profile,
    });
  } catch (error) {
    console.error("Update County President profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update your profile.",
    });
  }
};
