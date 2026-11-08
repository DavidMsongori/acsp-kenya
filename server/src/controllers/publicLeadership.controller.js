import { supabaseAdmin } from "../config/supabase.js";

// ==========================================
// GET GENERAL ASSEMBLY MEMBERS
// ==========================================

export const getGeneralAssemblyMembers = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("county_presidents")
      .select(`
        id,
        profile_id,
        association_id,
        term_start,
        term_end,
        verified_at,

        profiles!county_presidents_profile_id_fkey (
          id,
          full_name,
          photo_url,
          bio
        ),

        county_associations!inner (
          id,
          association_name,
          acronym,
          logo_url,
          verification_status,

          counties (
            id,
            name,
            code
          )
        )
      `)
      .eq("application_status", "approved")
      .eq("status", "verified")
      .eq("is_active", true)
      .eq("county_associations.verification_status", "verified")
      .order("created_at", { ascending: true });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      count: data.length,
      members: data,
    });
  } catch (error) {
    console.error("Get General Assembly members error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve General Assembly members.",
    });
  }
};