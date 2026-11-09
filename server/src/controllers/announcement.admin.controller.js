import { supabaseAdmin } from "../config/supabase.js";

// GENERATE A URL-FRIENDLY SLUG
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

// GET ALL ANNOUNCEMENTS FOR ADMIN
export const getAllAnnouncements = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      count: data.length,
      announcements: data,
    });
  } catch (error) {
    console.error("Get all announcements error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve announcements.",
    });
  }
};

// CREATE ANNOUNCEMENT
export const createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      summary,
      content,
      featuredImage,
      category,
      isFeatured,
      status,
    } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof content !== "string" ||
      !content.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Announcement title and content are required.",
      });
    }

    const allowedCategories = [
      "news",
      "announcement",
      "press_release",
      "opportunity",
      "event",
      "notice",
    ];

    const allowedStatuses = ["draft", "published", "archived"];

    const selectedCategory = category || "news";
    const selectedStatus = status || "draft";

    if (!allowedCategories.includes(selectedCategory)) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement category.",
      });
    }

    if (!allowedStatuses.includes(selectedStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement status.",
      });
    }

    const payload = {
      title: title.trim(),
      slug: generateSlug(title),
      summary: summary || null,
      content: content.trim(),
      featured_image: featuredImage || null,
      category: selectedCategory,
      is_featured: Boolean(isFeatured),
      status: selectedStatus,
      published_at: selectedStatus === "published"
        ? new Date().toISOString()
        : null,
      author_id: req.user.id,
    };

    const { data, error } = await supabaseAdmin
      .from("announcements")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          message: "An announcement with this title already exists.",
        });
      }

      throw error;
    }

    return res.status(201).json({
      success: true,
      message: "Announcement created successfully.",
      announcement: data,
    });
  } catch (error) {
    console.error("Create announcement error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create announcement.",
    });
  }
};

// UPDATE ANNOUNCEMENT DETAILS
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      summary,
      content,
      featuredImage,
      category,
      isFeatured,
    } = req.body;

    const updates = {};

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Announcement title cannot be empty.",
        });
      }

      updates.title = title.trim();
      updates.slug = generateSlug(title);
    }

    if (summary !== undefined) updates.summary = summary;

    if (content !== undefined) {
      if (typeof content !== "string" || !content.trim()) {
        return res.status(400).json({
          success: false,
          message: "Announcement content cannot be empty.",
        });
      }

      updates.content = content.trim();
    }

    if (featuredImage !== undefined) {
      updates.featured_image = featuredImage;
    }

    if (category !== undefined) {
      const allowedCategories = [
        "news",
        "announcement",
        "press_release",
        "opportunity",
        "event",
        "notice",
      ];

      if (!allowedCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid announcement category.",
        });
      }

      updates.category = category;
    }

    if (isFeatured !== undefined) {
      if (typeof isFeatured !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "Featured status must be true or false.",
        });
      }

      updates.is_featured = isFeatured;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No announcement details were provided.",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("announcements")
      .update(updates)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          message: "An announcement with this title already exists.",
        });
      }

      throw error;
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Announcement updated successfully.",
      announcement: data,
    });
  } catch (error) {
    console.error("Update announcement error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update announcement.",
    });
  }
};

// UPDATE ANNOUNCEMENT PUBLICATION STATUS
export const updateAnnouncementStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["draft", "published", "archived"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be draft, published or archived.",
      });
    }

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("announcements")
      .select("id, published_at")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found.",
      });
    }

    const updates = { status };

    if (status === "published" && !existing.published_at) {
      updates.published_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from("announcements")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: `Announcement ${status} successfully.`,
      announcement: data,
    });
  } catch (error) {
    console.error("Update announcement status error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update announcement status.",
    });
  }
};

// DELETE ANNOUNCEMENT
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from("announcements")
      .delete()
      .eq("id", id)
      .select("id")
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
      message: "Announcement deleted successfully.",
    });
  } catch (error) {
    console.error("Delete announcement error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to delete announcement.",
    });
  }
};