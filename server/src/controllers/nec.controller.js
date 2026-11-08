import { supabaseAdmin } from "../config/supabase.js";

// ==========================================
// GET ALL COUNTY PRESIDENT APPLICATIONS
// ==========================================

export const getApplications = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("county_presidents")
      .select(`
        id,
        profile_id,
        association_id,
        status,
        application_status,
        is_active,
        term_start,
        term_end,
        review_notes,
        reviewed_at,
        reviewed_by,
        created_at,

        profiles!county_presidents_profile_id_fkey (
          id,
          full_name,
          phone,
          photo_url
        ),

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
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      count: data.length,
      applications: data,
    });
  } catch (error) {
    console.error("Get NEC applications error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve county president applications.",
    });
  }
};

// ==========================================
// MOVE APPLICATION TO UNDER REVIEW
// ==========================================

export const markApplicationUnderReview = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: application, error: fetchError } =
      await supabaseAdmin
        .from("county_presidents")
        .select("id, application_status")
        .eq("id", id)
        .maybeSingle();

    if (fetchError) throw fetchError;

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    if (
      !["pending", "under_review"].includes(
        application.application_status
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "This application can no longer be reviewed.",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("county_presidents")
      .update({
        application_status: "under_review",
        reviewed_by: req.user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    const { error: auditError } = await supabaseAdmin
      .from("audit_logs")
      .insert({
        user_id: req.user.id,
        action: "application_marked_under_review",
        entity_type: "county_president",
        entity_id: id,
        details: {
          previous_status: application.application_status,
          new_status: "under_review",
        },
      });

    if (auditError) throw auditError;

    return res.status(200).json({
      success: true,
      message: "Application marked as under review.",
      application: data,
    });
  } catch (error) {
    console.error("Mark application under review error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update application status.",
    });
  }
};

// ==========================================
// APPROVE OR REJECT APPLICATION
// ==========================================

export const reviewApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, reviewNotes = "" } = req.body;

    if (!["approved", "rejected"].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "Decision must be approved or rejected.",
      });
    }

    if (
      typeof reviewNotes !== "string" ||
      reviewNotes.length > 2000
    ) {
      return res.status(400).json({
        success: false,
        message: "Review notes must not exceed 2000 characters.",
      });
    }

    const { data, error } = await supabaseAdmin.rpc(
      "nec_review_application",
      {
        p_application_id: id,
        p_decision: decision,
        p_review_notes: reviewNotes,
        p_reviewer_id: req.user.id,
      }
    );

    if (error) {
      console.error("NEC review transaction error:", error);

      if (error.message?.includes("Application not found")) {
        return res.status(404).json({
          success: false,
          message: "Application not found.",
        });
      }

      if (
        error.message?.includes("already been decided") ||
        error.message?.includes("Invalid application decision")
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      throw error;
    }

    return res.status(200).json({
      success: true,
      message: `Application ${decision} successfully.`,
      application: data,
    });
  } catch (error) {
    console.error("Review application error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to complete application review.",
    });
  }
};

// ==========================================
// GET ALL COUNTY ASSOCIATIONS
// ==========================================

export const getAssociations = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("county_associations")
      .select(`
        id,
        county_id,
        association_name,
        acronym,
        email,
        phone,
        logo_url,
        verification_status,
        verification_notes,
        verified_at,
        verified_by,
        created_at,
        updated_at,

        counties (
          id,
          name,
          code
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      count: data.length,
      associations: data,
    });
  } catch (error) {
    console.error("Get NEC associations error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve county associations.",
    });
  }
};

// ==========================================
// VERIFY OR REJECT COUNTY ASSOCIATION
// ==========================================

export const verifyAssociation = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      decision,
      verificationNotes = "",
    } = req.body;

    if (!["verified", "rejected"].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "Decision must be verified or rejected.",
      });
    }

    if (
      typeof verificationNotes !== "string" ||
      verificationNotes.length > 2000
    ) {
      return res.status(400).json({
        success: false,
        message: "Verification notes must not exceed 2000 characters.",
      });
    }

    const { data, error } = await supabaseAdmin.rpc(
      "nec_verify_association",
      {
        p_association_id: id,
        p_decision: decision,
        p_verification_notes: verificationNotes,
        p_reviewer_id: req.user.id,
      }
    );

    if (error) {
      console.error("NEC association verification error:", error);

      if (error.message?.includes("Association not found")) {
        return res.status(404).json({
          success: false,
          message: "County association not found.",
        });
      }

      if (
        error.message?.includes("already been reviewed") ||
        error.message?.includes("already verified") ||
        error.message?.includes("Invalid association verification decision")
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      throw error;
    }

    return res.status(200).json({
      success: true,
      message: `County association ${decision} successfully.`,
      association: data,
    });
  } catch (error) {
    console.error("Verify association error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to complete association verification.",
    });
  }
};

// ==========================================
// VERIFY AND ACTIVATE COUNTY PRESIDENT
// ==========================================

export const verifyCountyPresident = async (req, res) => {
  try {
    const { id } = req.params;

    const { verificationNotes = "" } = req.body;

    if (
      typeof verificationNotes !== "string" ||
      verificationNotes.length > 2000
    ) {
      return res.status(400).json({
        success: false,
        message: "Verification notes must not exceed 2000 characters.",
      });
    }

    const { data, error } = await supabaseAdmin.rpc(
      "nec_verify_county_president",
      {
        p_president_id: id,
        p_verification_notes: verificationNotes,
        p_reviewer_id: req.user.id,
      }
    );

    if (error) {
      console.error("County President verification error:", error);

      if (
        error.message?.includes("not found")
      ) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message?.includes("must be approved") ||
        error.message?.includes("must be verified") ||
        error.message?.includes("already been verified") ||
        error.message?.includes("not eligible")
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "County President verified and activated successfully.",
      president: data,
    });
  } catch (error) {
    console.error("Verify County President error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to verify and activate County President.",
    });
  }
};