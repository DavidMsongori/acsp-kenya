import { supabaseAdmin } from "../config/supabase.js";

// CHECK WHETHER THE REQUESTING USER IS AN APPROVED MEMBER
const isApprovedMember = async (userId) => {
  if (!userId) return false;

  const { data, error } = await supabaseAdmin
    .from("membership_applications")
    .select("id")
    .eq("profile_id", userId)
    .eq("application_status", "approved")
    .maybeSingle();

  if (error) throw error;

  return Boolean(data);
};

// CHECK WHETHER A VISITOR CAN ACCESS AN EVENT
const canAccessEvent = (event, isMember) => {
  if (event.audience === "public" || event.audience === "both") {
    return true;
  }

  if (event.audience === "members_only") {
    return isMember;
  }

  return false;
};

// GET /api/events
// PUBLIC: RETRIEVE PUBLISHED EVENTS VISIBLE TO THE VISITOR
export const getPublishedEvents = async (req, res) => {
  try {
    const { data: events, error } = await supabaseAdmin
      .from("events")
      .select("*")
      .eq("publication_status", "published")
      .order("event_date", { ascending: true });

    if (error) throw error;

    const isMember = req.user?.id
      ? await isApprovedMember(req.user.id)
      : false;

    const visibleEvents = events.filter((event) =>
      canAccessEvent(event, isMember)
    );

    return res.status(200).json({
      success: true,
      count: visibleEvents.length,
      events: visibleEvents,
    });
  } catch (error) {
    console.error("Get published events error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve events.",
    });
  }
};

// GET /api/events/:id
// PUBLIC: RETRIEVE ONE PUBLISHED EVENT
export const getPublishedEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: event, error } = await supabaseAdmin
      .from("events")
      .select("*")
      .eq("id", id)
      .eq("publication_status", "published")
      .maybeSingle();

    if (error) throw error;

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    const isMember = req.user?.id
      ? await isApprovedMember(req.user.id)
      : false;

    if (!canAccessEvent(event, isMember)) {
      return res.status(403).json({
        success: false,
        message: "This event is available to approved ACSP-Kenya members only.",
      });
    }

    return res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("Get event details error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve event details.",
    });
  }
};