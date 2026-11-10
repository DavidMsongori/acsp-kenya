import { supabaseAdmin } from "../config/supabase.js";

// ==========================================
// SUBMIT MEMBERSHIP APPLICATION
// ==========================================

export const submitMembershipApplication = async (req, res) => {
  try {
    const {
  membershipCategory = "ordinary",
  countyId,
  institutionName = "",
  institutionLocation = "",
  studentOrMemberId = "",
  applicationNotes = "",
} = req.body;

    const profileId = req.user.id;

    // Validate applicant-provided information.
    if (
      membershipCategory !== "ordinary" ||
      typeof institutionName !== "string" ||
      typeof institutionLocation !== "string" ||
      typeof studentOrMemberId !== "string" ||
      typeof applicationNotes !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid membership application information.",
      });
    }

    if (
      institutionName.length > 255 ||
      institutionLocation.length > 255 ||
      studentOrMemberId.length > 100 ||
      applicationNotes.length > 2000
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more application fields exceed the allowed length.",
      });
    }

    const parsedCountyId = Number(countyId);

if (!Number.isInteger(parsedCountyId) || parsedCountyId < 1) {
  return res.status(400).json({
    success: false,
    message: "Please select a valid county.",
  });
}

// Find the verified County Association for the selected county.
const { data: associations, error: associationError } = await supabaseAdmin
  .from("county_associations")
  .select("id")
  .eq("county_id", parsedCountyId)
  .eq("verification_status", "verified")
  .limit(2);

if (associationError) throw associationError;

if (!associations || associations.length === 0) {
  return res.status(400).json({
    success: false,
    message: "There is no verified County Association in the selected county yet.",
  });
}

if (associations.length > 1) {
  return res.status(409).json({
    success: false,
    message: "Multiple verified associations exist in this county. Please contact ACSP-Kenya administration.",
  });
}

const associationId = associations[0].id;

    // Confirm that the authenticated user has a profile.
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, phone, photo_url")
      .eq("id", profileId)
      .maybeSingle();

    if (profileError) throw profileError;

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Your user profile was not found. Please complete your profile first.",
      });
    }

    // Prevent duplicate membership applications.
    const { data: existingApplication, error: existingError } =
      await supabaseAdmin
        .from("membership_applications")
        .select("id, application_status, membership_number")
        .eq("profile_id", profileId)
        .maybeSingle();

    if (existingError) throw existingError;

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: "You have already submitted a membership application.",
        application: existingApplication,
      });
    }

    // Create the application using the authenticated profile ID.
    const { data, error } = await supabaseAdmin
      .from("membership_applications")
      .insert({
        profile_id: profileId,
        association_id: associationId,
        membership_category: membershipCategory.trim(),
        institution_name: institutionName.trim() || null,
        institution_location: institutionLocation.trim() || null,
        student_or_member_id: studentOrMemberId.trim() || null,
        application_notes: applicationNotes.trim() || null,
        application_status: "pending",
      })
      .select(`
        id,
        membership_category,
        institution_name,
        institution_location,
        student_or_member_id,
        application_notes,
        application_status,
        membership_number,
        created_at
      `)
      .single();

    if (error) {
      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          message: "You have already submitted a membership application.",
        });
      }

      throw error;
    }

    return res.status(201).json({
      success: true,
      message: "Membership application submitted successfully.",
      application: {
        ...data,
        applicant: profile,
      },
    });
  } catch (error) {
    console.error("Submit membership application error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to submit your membership application.",
    });
  }
};

// ==========================================
// GET MY MEMBERSHIP APPLICATION
// ==========================================

export const getMyMembershipApplication = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("membership_applications")
      .select(`
        id,
        membership_number,
        membership_category,
        institution_name,
        institution_location,
        student_or_member_id,
        application_notes,
        application_status,
        review_notes,
        reviewed_at,
        created_at,
        updated_at
      `)
      .eq("profile_id", req.user.id)
      .maybeSingle();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      hasApplication: Boolean(data),
      application: data,
    });
  } catch (error) {
    console.error("Get membership application error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve your membership application.",
    });
  }
};


// ==========================================
// SUBMIT INDIVIDUAL STUDENT MEMBERSHIP APPLICATION
// ==========================================

export const submitIndividualMembershipApplication = async (req, res) => {
  try {
    const {
      institutionName = "",
      institutionLocation = "",
      studentOrMemberId = "",
      applicationNotes = "",
    } = req.body;

    const profileId = req.user.id;

    // Validate applicant information.
    if (
      typeof institutionName !== "string" ||
      typeof institutionLocation !== "string" ||
      typeof studentOrMemberId !== "string" ||
      typeof applicationNotes !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid individual membership information.",
      });
    }

    if (!institutionName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide your institution name.",
      });
    }

    if (
      institutionName.length > 255 ||
      institutionLocation.length > 255 ||
      studentOrMemberId.length > 100 ||
      applicationNotes.length > 2000
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more application fields exceed the allowed length.",
      });
    }

    // Confirm that the authenticated user has a profile.
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, phone, photo_url")
      .eq("id", profileId)
      .maybeSingle();

    if (profileError) throw profileError;

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Your user profile was not found. Please complete your profile first.",
      });
    }

    // Prevent duplicate membership applications.
    const { data: existingApplication, error: existingError } =
      await supabaseAdmin
        .from("membership_applications")
        .select("id, application_type, application_status, membership_number")
        .eq("profile_id", profileId)
        .maybeSingle();

    if (existingError) throw existingError;

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: "You have already submitted a membership application.",
        application: existingApplication,
      });
    }

    // Create a free individual student application.
    // Application type is controlled by the server.
    const { data, error } = await supabaseAdmin
      .from("membership_applications")
      .insert({
        profile_id: profileId,
        association_id: null,
        application_type: "individual_student",
        membership_category: "ordinary",
        institution_name: institutionName.trim(),
        institution_location: institutionLocation.trim() || null,
        student_or_member_id: studentOrMemberId.trim() || null,
        application_notes: applicationNotes.trim() || null,
        application_status: "pending",
      })
      .select(`
        id,
        application_type,
        membership_category,
        institution_name,
        institution_location,
        student_or_member_id,
        application_notes,
        application_status,
        membership_number,
        created_at
      `)
      .single();

    if (error) {
      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          message: "You have already submitted a membership application.",
        });
      }

      throw error;
    }

    return res.status(201).json({
      success: true,
      message: "Individual student membership application submitted successfully.",
      application: {
        ...data,
        applicant: profile,
      },
    });
  } catch (error) {
    console.error(
      "Submit individual membership application error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to submit your individual membership application.",
    });
  }
};


// ==========================================
// GET MY INDIVIDUAL STUDENT APPLICATION
// ==========================================

export const getMyIndividualMembershipApplication = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("membership_applications")
      .select(`
        id,
        application_type,
        membership_number,
        membership_category,
        institution_name,
        institution_location,
        student_or_member_id,
        application_notes,
        application_status,
        review_notes,
        reviewed_at,
        created_at,
        updated_at
      `)
      .eq("profile_id", req.user.id)
      .eq("application_type", "individual_student")
      .maybeSingle();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      hasApplication: Boolean(data),
      application: data,
    });
  } catch (error) {
    console.error(
      "Get individual membership application error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve your individual membership application.",
    });
  }
};
