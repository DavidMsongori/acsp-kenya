
import { supabaseAdmin } from "../config/supabase.js";

// ==========================================
// GET ALL NATIONAL PROGRAMMES (ADMIN)
// ==========================================


export const getAllProgrammes = async (req, res) => {
  try {
    const { data: programmes, error } = await supabaseAdmin
      .from("national_programmes")
      .select(`
        *,
        activities:programme_activities(*)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      count: programmes.length,
      programmes,
    });
  } catch (error) {
    console.error("Get all programmes error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve national programmes.",
    });
  }
};



// ==========================================
// CREATE NATIONAL PROGRAMME
// ==========================================

export const createProgramme = async (req, res) => {
  try {
    const {
      title,
      description,
      objectives,
      cover_image_url,
      start_date,
      end_date,
    } = req.body;

    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Programme title and description are required.",
      });
    }

    if (
      start_date &&
      end_date &&
      new Date(start_date) > new Date(end_date)
    ) {
      return res.status(400).json({
        success: false,
        message: "Programme end date cannot precede its start date.",
      });
    }

    const { data: programme, error } = await supabaseAdmin
      .from("national_programmes")
      .insert({
        title: title.trim(),
        description: description.trim(),
        objectives: objectives?.trim() || null,
        cover_image_url: cover_image_url || null,
        start_date: start_date || null,
        end_date: end_date || null,
        status: "draft",
        created_by: req.user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: "National programme created successfully.",
      programme,
    });
  } catch (error) {
    console.error("Create programme error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create national programme.",
    });
  }
};


// ==========================================
// UPDATE NATIONAL PROGRAMME
// ==========================================

export const updateProgramme = async (req, res) => {
  try {
    const { id } = req.params;

    const allowedFields = [
      "title",
      "description",
      "objectives",
      "cover_image_url",
      "start_date",
      "end_date",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.title !== undefined) {
      if (!updates.title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Programme title cannot be empty.",
        });
      }

      updates.title = updates.title.trim();
    }

    if (updates.description !== undefined) {
      if (!updates.description.trim()) {
        return res.status(400).json({
          success: false,
          message: "Programme description cannot be empty.",
        });
      }

      updates.description = updates.description.trim();
    }

    if (
      updates.start_date &&
      updates.end_date &&
      new Date(updates.start_date) > new Date(updates.end_date)
    ) {
      return res.status(400).json({
        success: false,
        message: "Programme end date cannot precede its start date.",
      });
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid programme fields were provided.",
      });
    }

    updates.updated_at = new Date().toISOString();

    const { data: programme, error } = await supabaseAdmin
      .from("national_programmes")
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!programme) {
      return res.status(404).json({
        success: false,
        message: "Programme not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "National programme updated successfully.",
      programme,
    });
  } catch (error) {
    console.error("Update programme error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update national programme.",
    });
  }
};


// ==========================================
// CHANGE PROGRAMME STATUS
// ==========================================

export const updateProgrammeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["draft", "published", "archived"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid programme status.",
      });
    }

    const { data: programme, error } = await supabaseAdmin
      .from("national_programmes")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!programme) {
      return res.status(404).json({
        success: false,
        message: "Programme not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Programme status changed to ${status}.`,
      programme,
    });
  } catch (error) {
    console.error("Update programme status error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update programme status.",
    });
  }
};


// ==========================================
// CREATE PROGRAMME ACTIVITY
// ==========================================

export const createProgrammeActivity = async (req, res) => {
  try {
    const { id: programmeId } = req.params;

    const {
      county_id,
      title,
      description,
      activity_date,
      location,
      image_urls,
    } = req.body;

    if (!county_id || !title?.trim() || !description?.trim() || !activity_date) {
      return res.status(400).json({
        success: false,
        message: "County, title, description and activity date are required.",
      });
    }

    if (
      image_urls !== undefined &&
      (!Array.isArray(image_urls) ||
        !image_urls.every((url) => typeof url === "string"))
    ) {
      return res.status(400).json({
        success: false,
        message: "Activity image URLs must be provided as an array.",
      });
    }

    const { data: programme, error: programmeError } =
      await supabaseAdmin
        .from("national_programmes")
        .select("id, status")
        .eq("id", programmeId)
        .maybeSingle();

    if (programmeError) throw programmeError;

    if (!programme) {
      return res.status(404).json({
        success: false,
        message: "National programme not found.",
      });
    }

    const { data: activity, error } = await supabaseAdmin
      .from("programme_activities")
      .insert({
        programme_id: programmeId,
        county_id,
        title: title.trim(),
        description: description.trim(),
        activity_date,
        location: location?.trim() || null,
        image_urls: image_urls || [],
        status: "draft",
        created_by: req.user.id,
      })
      .select("*, counties(id, name, code)")
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: "Programme activity created successfully.",
      activity,
    });
  } catch (error) {
    console.error("Create programme activity error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create programme activity.",
    });
  }
};


// ==========================================
// UPDATE PROGRAMME ACTIVITY
// ==========================================

export const updateProgrammeActivity = async (req, res) => {
  try {
    const { id: programmeId, activityId } = req.params;

    const allowedFields = [
      "county_id",
      "title",
      "description",
      "activity_date",
      "location",
      "image_urls",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.title !== undefined) {
      if (typeof updates.title !== "string" || !updates.title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Activity title cannot be empty.",
        });
      }

      updates.title = updates.title.trim();
    }

    if (updates.description !== undefined) {
      if (
        typeof updates.description !== "string" ||
        !updates.description.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Activity description cannot be empty.",
        });
      }

      updates.description = updates.description.trim();
    }

    if (
      updates.image_urls !== undefined &&
      (!Array.isArray(updates.image_urls) ||
        !updates.image_urls.every((url) => typeof url === "string"))
    ) {
      return res.status(400).json({
        success: false,
        message: "Activity image URLs must be provided as an array.",
      });
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid activity fields were provided.",
      });
    }

    updates.updated_at = new Date().toISOString();

    const { data: activity, error } = await supabaseAdmin
      .from("programme_activities")
      .update(updates)
      .eq("id", activityId)
      .eq("programme_id", programmeId)
      .select("*, counties(id, name, code)")
      .maybeSingle();

    if (error) throw error;

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Programme activity not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Programme activity updated successfully.",
      activity,
    });
  } catch (error) {
    console.error("Update programme activity error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update programme activity.",
    });
  }
};


// ==========================================
// CHANGE ACTIVITY STATUS
// ==========================================

export const updateProgrammeActivityStatus = async (req, res) => {
  try {
    const { id: programmeId, activityId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["draft", "published", "archived"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid activity status.",
      });
    }

    const { data: activity, error } = await supabaseAdmin
      .from("programme_activities")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", activityId)
      .eq("programme_id", programmeId)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Programme activity not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Activity status changed to ${status}.`,
      activity,
    });
  } catch (error) {
    console.error("Update activity status error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update activity status.",
    });
  }
};


// ==========================================
// GET ALL ACTIVITIES FOR AN ADMIN PROGRAMME
// ==========================================

export const getProgrammeActivities = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: programme, error: programmeError } =
      await supabaseAdmin
        .from("national_programmes")
        .select("id, title")
        .eq("id", id)
        .maybeSingle();

    if (programmeError) throw programmeError;

    if (!programme) {
      return res.status(404).json({
        success: false,
        message: "Programme not found.",
      });
    }

    const { data: activities, error } = await supabaseAdmin
      .from("programme_activities")
      .select("*, counties(id, name, code)")
      .eq("programme_id", id)
      .order("activity_date", { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      programme,
      count: activities.length,
      activities,
    });
  } catch (error) {
    console.error("Get admin programme activities error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve programme activities.",
    });
  }
};

export const deleteProgramme = async (req, res) => {
  try {
    const { id } = req.params;

    // Get the programme before deleting it.
    const { data: programme, error: fetchError } = await supabaseAdmin
      .from("national_programmes")
      .select("id, title, cover_image_url")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    if (!programme) {
      return res.status(404).json({
        success: false,
        message: "Programme not found.",
      });
    }

    // Delete the programme from the database.
    // Its activities are deleted automatically through ON DELETE CASCADE.
    const { error: deleteError } = await supabaseAdmin
      .from("national_programmes")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw deleteError;
    }

    // Remove the programme cover from Cloudinary, if one exists.
    if (programme.cover_image_url) {
      try {
        const parts = programme.cover_image_url.split("/upload/")[1];

        if (parts) {
          const publicId = parts
            .split("/")
            .filter((part) => !/^v\d+$/.test(part))
            .join("/")
            .replace(/\.[^/.]+$/, "");

          await deleteImage(publicId);
        }
      } catch (imageError) {
        console.error("Programme cover cleanup error:", imageError);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Programme and its activities deleted successfully.",
    });
  } catch (error) {
    console.error("Delete programme error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete programme.",
    });
  }
};