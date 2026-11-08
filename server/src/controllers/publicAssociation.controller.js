import { supabaseAdmin } from "../config/supabase.js";

// ==========================================
// GET VERIFIED COUNTY ASSOCIATIONS
// ==========================================

export const getVerifiedAssociations = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("county_associations")
      .select(`
        id,
        county_id,
        association_name,
        acronym,
        logo_url,
        verification_status,
        verified_at,

        counties (
          id,
          name,
          code
        )
      `)
      .eq("verification_status", "verified")
      .order("association_name", { ascending: true });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      count: data.length,
      associations: data,
    });
  } catch (error) {
    console.error("Get verified associations error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve verified county associations.",
    });
  }
};