import { supabaseAdmin } from "../config/supabase.js";

// GET ALL PUBLISHED ANNOUNCEMENTS
export const getPublishedAnnouncements = async (req, res) => {
  try {
    const { category, search } = req.query;

    let query = supabaseAdmin
      .from("announcements")
      .select(`
        id,
        title,
        slug,
        summary,
        category,
        featured_image,
        is_featured,
        published_at,
        created_at
      `)
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (category) {
      query = query.eq("category", category);
    }

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return res.status(200).json({
      success: true,
      count: data.length,
      announcements: data,
    });
  } catch (error) {
    console.error("Get published announcements error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve announcements.",
    });
  }
};

// GET A SINGLE PUBLISHED ANNOUNCEMENT BY SLUG
export const getPublishedAnnouncementBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const { data, error } = await supabaseAdmin
      .from("announcements")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found.",
      });
    }

    return res.status(200).json({
      success: true,
      announcement: data,
    });
  } catch (error) {
    console.error("Get announcement details error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve announcement details.",
    });
  }
};

// GET FEATURED ANNOUNCEMENTS
export const getFeaturedAnnouncements = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("announcements")
      .select(`
        id,
        title,
        slug,
        summary,
        category,
        featured_image,
        is_featured,
        published_at
      `)
      .eq("status", "published")
      .eq("is_featured", true)
      .order("published_at", { ascending: false })
      .limit(5);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      count: data.length,
      announcements: data,
    });
  } catch (error) {
    console.error("Get featured announcements error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve featured announcements.",
    });
  }
};