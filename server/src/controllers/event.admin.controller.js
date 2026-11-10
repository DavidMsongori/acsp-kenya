
import { supabaseAdmin } from "../config/supabase.js";

// GET ALL EVENTS FOR ADMINISTRATION
export const getAllEvents = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("events")
      .select("*")
      .order("event_date", { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      count: data.length,
      events: data,
    });
  } catch (error) {
    console.error("Get all events error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve events.",
    });
  }
};

// CREATE A NEW EVENT
export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      venue,
      eventDate,
      eventEndDate,
      registrationDeadline,
      capacity,
      featuredImage,
      audience,
      category,
      county,
      registrationUrl,
    } = req.body;

    if (!title?.trim() || !eventDate) {
      return res.status(400).json({
        success: false,
        message: "Event title and event date are required.",
      });
    }

    const allowedAudiences = ["public", "members_only", "both"];

    if (audience && !allowedAudiences.includes(audience)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event audience.",
      });
    }

    const eventPayload = {
      title: title.trim(),
      description: description || null,
      venue: venue || null,
      event_date: eventDate,
      event_end_date: eventEndDate || null,
      registration_deadline: registrationDeadline || null,
      capacity: capacity ? Number(capacity) : null,
      featured_image: featuredImage || null,
      audience: audience || "public",
      category: category?.trim() || "other",
      county: county?.trim() || null,
      registration_url: registrationUrl?.trim() || null,
      publication_status: "draft",
      status: "upcoming",
      registration_open: true,
      created_by: req.user.id,
    };

    const { data, error } = await supabaseAdmin
      .from("events")
      .insert(eventPayload)
      .select("*")
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: "Event created successfully as a draft.",
      event: data,
    });
  } catch (error) {
    console.error("Create event error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create event.",
    });
  }
};

// UPDATE EVENT DETAILS
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      venue,
      eventDate,
      eventEndDate,
      registrationDeadline,
      capacity,
      featuredImage,
      audience,
      registrationOpen,
      category,
      county,
      registrationUrl,
    } = req.body;

    const allowedAudiences = ["public", "members_only", "both"];

    if (audience && !allowedAudiences.includes(audience)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event audience.",
      });
    }

    const updates = {};

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Event title cannot be empty.",
        });
      }

      updates.title = title.trim();
    }

    if (description !== undefined) updates.description = description;
    if (venue !== undefined) updates.venue = venue;
    if (eventDate !== undefined) updates.event_date = eventDate;
    if (eventEndDate !== undefined) {
      updates.event_end_date = eventEndDate || null;
    }
    if (registrationDeadline !== undefined) {
      updates.registration_deadline = registrationDeadline || null;
    }
    if (capacity !== undefined) {
      updates.capacity =
        capacity === "" || capacity === null ? null : Number(capacity);
    }
    if (featuredImage !== undefined) {
      updates.featured_image = featuredImage;
    }
    if (audience !== undefined) updates.audience = audience;
    if (registrationOpen !== undefined) {
      updates.registration_open = Boolean(registrationOpen);
    }
    if (category !== undefined) {
      updates.category = category.trim() || "other";
    }
    if (county !== undefined) {
      updates.county = county.trim() || null;
    }
    if (registrationUrl !== undefined) {
      updates.registration_url = registrationUrl.trim() || null;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No event details were provided for updating.",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("events")
      .update(updates)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event updated successfully.",
      event: data,
    });
  } catch (error) {
    console.error("Update event error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update event.",
    });
  }
};

// PUBLISH OR UNPUBLISH AN EVENT
export const updateEventPublicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { publicationStatus } = req.body;

    if (!["draft", "published"].includes(publicationStatus)) {
      return res.status(400).json({
        success: false,
        message: "Publication status must be draft or published.",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("events")
      .update({ publication_status: publicationStatus })
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        publicationStatus === "published"
          ? "Event published successfully."
          : "Event unpublished successfully.",
      event: data,
    });
  } catch (error) {
    console.error("Update event publication status error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update event publication status.",
    });
  }
};

// UPDATE EVENT STATUS
export const updateEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["upcoming", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event status.",
      });
    }

    const updates = { status };

    if (status === "cancelled") {
      updates.registration_open = false;
    }

    const { data, error } = await supabaseAdmin
      .from("events")
      .update(updates)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Event marked as ${status}.`,
      event: data,
    });
  } catch (error) {
    console.error("Update event status error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update event status.",
    });
  }
};

// DELETE AN EVENT
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from("events")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully.",
    });
  } catch (error) {
    console.error("Delete event error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to delete event.",
    });
  }
};
