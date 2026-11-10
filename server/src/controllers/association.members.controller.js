
import { supabaseAdmin } from "../config/supabase.js";

// ==========================================
// GET MEMBERS BELONGING TO THE PRESIDENT'S
// OWN VERIFIED COUNTY ASSOCIATION
// ==========================================

export const getAssociationMembers = async (req, res) => {
  try {
    const profileId = req.user.id;

    // Find the logged-in County President's application.
    const { data: president, error: presidentError } = await supabaseAdmin
      .from("county_presidents")
      .select(`
        id,
        application_status,
        county_associations (
          id,
          association_name,
          verification_status,
          counties (
            id,
            name
          )
        )
      `)
      .eq("profile_id", profileId)
      .maybeSingle();

    if (presidentError) throw presidentError;

    if (!president || president.application_status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Your County President application is not approved.",
      });
    }

    const association = president.county_associations;

    if (!association || association.verification_status !== "verified") {
      return res.status(403).json({
        success: false,
        message: "Your County Association is not yet verified.",
      });
    }

    // Retrieve only applications assigned to this association.
    const { data: members, error: membersError } = await supabaseAdmin
      .from("membership_applications")
      .select(`
        id,
        membership_number,
        membership_category,
        institution_name,
        institution_location,
        student_or_member_id,
        application_status,
        created_at,
        profiles!membership_applications_profile_id_fkey (
          id,
          full_name,
          phone,
          photo_url
        )
      `)
      .eq("association_id", association.id)
      .order("created_at", { ascending: false });

    if (membersError) throw membersError;

    return res.status(200).json({
      success: true,
      association: {
        id: association.id,
        name: association.association_name,
        county: association.counties?.name || null,
      },
      total: members?.length || 0,
      members: members || [],
    });
  } catch (error) {
    console.error("Get association members error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve association members.",
    });
  }
};
