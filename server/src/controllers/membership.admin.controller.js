import { supabaseAdmin } from "../config/supabase.js";

// ==========================================
// GET ALL MEMBERSHIP APPLICATIONS
// ==========================================

export const getMembershipApplications = async (req, res) => {
  try {
    const { status } = req.query;

    const validStatuses = [
      "pending",
      "under_review",
      "approved",
      "rejected",
    ];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid membership application status.",
      });
    }

    let query = supabaseAdmin
      .from("membership_applications")
      .select(`
        id,
        profile_id,
        membership_number,
        membership_category,
        institution_name,
        institution_location,
        student_or_member_id,
        application_notes,
        application_status,
        review_notes,
        reviewed_by,
        reviewed_at,
        created_at,

        profiles!membership_applications_profile_id_fkey (
          id,
          full_name,
          phone,
          photo_url
        )
      `)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("application_status", status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return res.status(200).json({
      success: true,
      count: data.length,
      applications: data,
    });
  } catch (error) {
    console.error(
      "Get membership applications error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve membership applications.",
    });
  }
};

// ==========================================
// MOVE APPLICATION TO UNDER REVIEW
// ==========================================

export const markMembershipApplicationUnderReview = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const { data: application, error: fetchError } =
      await supabaseAdmin
        .from("membership_applications")
        .select("id, application_status")
        .eq("id", id)
        .maybeSingle();

    if (fetchError) throw fetchError;

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Membership application not found.",
      });
    }

    if (
      !["pending", "under_review"].includes(
        application.application_status
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "This membership application can no longer be reviewed.",
      });
    }

    if (application.application_status === "under_review") {
      return res.status(200).json({
        success: true,
        message: "Application is already under review.",
        application,
      });
    }

    const { data, error } = await supabaseAdmin
      .from("membership_applications")
      .update({
        application_status: "under_review",
      })
      .eq("id", id)
      .eq("application_status", "pending")
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(409).json({
        success: false,
        message: "Application status changed. Refresh and try again.",
      });
    }

    const { error: auditError } = await supabaseAdmin
      .from("audit_logs")
      .insert({
        user_id: req.user.id,
        action: "membership_application_marked_under_review",
        entity_type: "membership_application",
        entity_id: id,
        details: {
          previous_status: "pending",
          new_status: "under_review",
        },
      });

    if (auditError) throw auditError;

    return res.status(200).json({
      success: true,
      message: "Membership application marked as under review.",
      application: data,
    });
  } catch (error) {
    console.error(
      "Mark membership application under review error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to update membership application status.",
    });
  }
};

// ==========================================
// APPROVE OR REJECT MEMBERSHIP APPLICATION
// ==========================================

export const reviewMembershipApplication = async (req, res) => {
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
      "review_membership_application",
      {
        p_application_id: id,
        p_decision: decision,
        p_review_notes: reviewNotes,
        p_reviewer_id: req.user.id,
      }
    );

    if (error) {
      console.error(
        "Membership review transaction error:",
        error
      );

      if (error.message?.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: "Membership application not found.",
        });
      }

      if (
        error.message?.includes("already been decided") ||
        error.message?.includes("Invalid membership decision")
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
      message: `Membership application ${decision} successfully.`,
      application: data,
    });
  } catch (error) {
    console.error(
      "Review membership application error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to complete membership application review.",
    });
  }
};