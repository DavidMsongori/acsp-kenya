
import { supabaseAdmin } from "../config/supabase.js";

// GET /api/programmes
// Public: Retrieve all published national programmes and their activities.
export const getPublishedProgrammes = async (req, res) => {
  try {
    const { data: programmes, error: programmeError } =
      await supabaseAdmin
        .from("national_programmes")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

    if (programmeError) throw programmeError;

    if (!programmes.length) {
      return res.status(200).json({
        success: true,
        count: 0,
        programmes: [],
      });
    }

    const programmeIds = programmes.map((programme) => programme.id);

    const { data: activities, error: activityError } =
      await supabaseAdmin
        .from("programme_activities")
        .select("*, counties(id, name, code)")
        .in("programme_id", programmeIds)
        .eq("status", "published")
        .order("activity_date", { ascending: false });

    if (activityError) throw activityError;

    const result = programmes.map((programme) => ({
      ...programme,
      activities: activities.filter(
        (activity) => activity.programme_id === programme.id
      ),
    }));

    return res.status(200).json({
      success: true,
      count: result.length,
      programmes: result,
    });
  } catch (error) {
    console.error("Get published programmes error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve programmes.",
    });
  }
};


// GET /api/programmes/:id
// Public: Retrieve one published programme and its published activities.
export const getPublishedProgrammeById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: programme, error: programmeError } =
      await supabaseAdmin
        .from("national_programmes")
        .select("*")
        .eq("id", id)
        .eq("status", "published")
        .maybeSingle();

    if (programmeError) throw programmeError;

    if (!programme) {
      return res.status(404).json({
        success: false,
        message: "Programme not found.",
      });
    }

    const { data: activities, error: activityError } =
      await supabaseAdmin
        .from("programme_activities")
        .select("*, counties(id, name, code)")
        .eq("programme_id", id)
        .eq("status", "published")
        .order("activity_date", { ascending: false });

    if (activityError) throw activityError;

    return res.status(200).json({
      success: true,
      programme: {
        ...programme,
        activities,
      },
    });
  } catch (error) {
    console.error("Get programme details error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve programme details.",
    });
  }
};


// GET /api/programmes/counties/:countyId
// Public: Retrieve published programmes and activities in a county.
export const getPublishedCountyActivities = async (req, res) => {
  try {
    const { countyId } = req.params;

    const { data: activities, error } = await supabaseAdmin
      .from("programme_activities")
      .select(`
        *,
        counties(id, name, code),
        national_programmes!inner(
          id,
          title,
          description,
          cover_image_url,
          start_date,
          end_date,
          status
        )
      `)
      .eq("county_id", countyId)
      .eq("status", "published")
      .eq("national_programmes.status", "published")
      .order("activity_date", { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      countyId,
      count: activities.length,
      activities,
    });
  } catch (error) {
    console.error("Get county activities error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve county activities.",
    });
  }
};
