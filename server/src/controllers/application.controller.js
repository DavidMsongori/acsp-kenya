
import { supabaseAdmin } from "../config/supabase.js";

// ==========================================
// Submit County President Application
// ==========================================

export const submitApplication = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      countyId,
      associationName,
      acronym,
      associationEmail,
      associationPhone,
      profilePhotoUrl,
      associationLogoUrl,
      termStart,
      termEnd,
    } = req.body;

    // Validate required fields
    if (
      !fullName ||
      !countyId ||
      !associationName ||
      !profilePhotoUrl ||
      !associationLogoUrl
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required application information",
      });
    }

    // Validate county ID
    const parsedCountyId = Number(countyId);

    if (!Number.isInteger(parsedCountyId) || parsedCountyId < 1) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid county",
      });
    }

    // Validate term dates
    if (termStart && termEnd && termEnd < termStart) {
      return res.status(400).json({
        success: false,
        message: "Term end date cannot be earlier than term start date",
      });
    }

    // Verify that the selected county exists
    const { data: county, error: countyError } = await supabaseAdmin
      .from("counties")
      .select("id")
      .eq("id", parsedCountyId)
      .maybeSingle();

    if (countyError) {
      throw countyError;
    }

    if (!county) {
      return res.status(400).json({
        success: false,
        message: "The selected county does not exist",
      });
    }

    // Prevent duplicate applications by the same user
    const { data: existingApplication, error: existingError } =
      await supabaseAdmin
        .from("county_presidents")
        .select("id, application_status")
        .eq("profile_id", req.user.id)
        .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: "You already have a County President application",
        application: existingApplication,
      });
    }

    // Submit application through the atomic database function
    const { data, error } = await supabaseAdmin.rpc(
      "submit_county_president_application",
      {
        p_user_id: req.user.id,
        p_full_name: fullName.trim(),
        p_phone: phone?.trim() || null,
        p_photo_url: profilePhotoUrl,
        p_county_id: parsedCountyId,
        p_association_name: associationName.trim(),
        p_acronym: acronym?.trim() || null,
        p_association_email: associationEmail?.trim() || null,
        p_association_phone: associationPhone?.trim() || null,
        p_logo_url: associationLogoUrl,
        p_term_start: termStart || null,
        p_term_end: termEnd || null,
      }
    );

    if (error) {
      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          message:
            "An association with this name already exists in the selected county",
        });
      }

      throw error;
    }

    return res.status(201).json({
      success: true,
      message: "Your application has been submitted successfully",
      application: data,
    });
  } catch (error) {
    console.error("Submit application error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to submit your application",
    });
  }
};


// ==========================================
// Get Authenticated User's Application
// ==========================================

export const getMyApplication = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
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
      .eq("profile_id", req.user.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(200).json({
        success: true,
        hasApplication: false,
        application: null,
        message: "You have not submitted an application yet",
      });
    }

    return res.status(200).json({
      success: true,
      hasApplication: true,
      application: data,
    });
  } catch (error) {
    console.error("Get application error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve your application",
    });
  }
};
