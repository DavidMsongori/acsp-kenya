
import { supabaseAdmin } from "../config/supabase.js";

// ==========================================
// GET NATIONAL SECRETARIAT DIRECTORY
// ==========================================

export const getSecretariatDirectory = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("national_secretariat_appointments")
      .select(`
        id,
        position,
        appointment_date,
        term_start,
        term_end,
        appointment_status,

        profiles!national_secretariat_appointments_profile_id_fkey (
          id,
          full_name,
          photo_url,
          bio
        )
      `)
      .eq("appointment_status", "active")
      .order("created_at", { ascending: true });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      count: data.length,
      members: data,
    });
  } catch (error) {
    console.error(
      "Get National Secretariat directory error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve the National Secretariat directory.",
    });
  }
};


// ==========================================
// APPOINT A NATIONAL SECRETARIAT MEMBER
// ==========================================

export const appointSecretariatMember = async (req, res) => {
  try {
    const {
      profileId,
      position,
      appointmentDate,
      termStart,
      termEnd,
      appointmentNotes = "",
    } = req.body;

    const approvedPositions = [
      "Executive Director (CEO)",
      "Deputy Executive Director – Administration and Operations",
      "Deputy Executive Director – Programs, Strategy and Institutional Relations",
      "Finance and Accounts Officer",
      "Communication and Digital Officer",
      "Partnerships and Resource Mobilization Officer",
      "Monitoring, Evaluation and Learning Officer",
      "County and Regional Officer",
      "Gender and Inclusion Officer",
      "Higher Institutions Liaison Officer",
    ];

    if (!profileId || !position) {
      return res.status(400).json({
        success: false,
        message: "Member profile and Secretariat position are required.",
      });
    }

    if (!approvedPositions.includes(position)) {
      return res.status(400).json({
        success: false,
        message: "Invalid National Secretariat position.",
      });
    }

    if (
      typeof appointmentNotes !== "string" ||
      appointmentNotes.length > 2000
    ) {
      return res.status(400).json({
        success: false,
        message: "Appointment notes cannot exceed 2000 characters.",
      });
    }

    const validDate = (value) =>
      value == null ||
      (
        /^\d{4}-\d{2}-\d{2}$/.test(value) &&
        !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) &&
        new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value
      );

    if (
      !validDate(appointmentDate) ||
      !validDate(termStart) ||
      !validDate(termEnd)
    ) {
      return res.status(400).json({
        success: false,
        message: "Appointment dates must be valid YYYY-MM-DD dates.",
      });
    }

    if (termStart && termEnd && termEnd < termStart) {
      return res.status(400).json({
        success: false,
        message: "Term end date cannot be earlier than term start date.",
      });
    }

    const { data, error } = await supabaseAdmin.rpc(
      "appoint_national_secretariat_member",
      {
        p_profile_id: profileId,
        p_position: position,
        p_appointment_date: appointmentDate || null,
        p_term_start: termStart || null,
        p_term_end: termEnd || null,
        p_appointment_notes: appointmentNotes,
        p_appointed_by: req.user.id,
      }
    );

    if (error) {
      console.error("Secretariat appointment transaction error:", error);

      if (error.message?.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message?.includes("already has an active") ||
        error.message?.includes("cannot be earlier") ||
        error.message?.includes("cannot exceed")
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      throw error;
    }

    return res.status(201).json({
      success: true,
      message: "National Secretariat member appointed successfully.",
      appointment: data.appointment,
      member: data.member,
    });
  } catch (error) {
    console.error("Appoint Secretariat member error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to complete the Secretariat appointment.",
    });
  }
};



// ==========================================
// SEARCH REGISTERED USERS FOR APPOINTMENT
// ==========================================

export const searchSecretariatCandidates = async (req, res) => {
  try {
    const searchTerm = req.query.q?.trim();

    if (!searchTerm || searchTerm.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Enter at least two characters to search.",
      });
    }

    if (searchTerm.length > 80) {
      return res.status(400).json({
        success: false,
        message: "Search term cannot exceed 80 characters.",
      });
    }

    // Prevent special PostgREST filter characters in search input.
    const safeTerm = searchTerm.replace(/[%_,().]/g, " ").trim();

    const { data: profiles, error: profileError } =
      await supabaseAdmin
        .from("profiles")
        .select("id, full_name, phone, photo_url")
        .or(
          `full_name.ilike.%${safeTerm}%,phone.ilike.%${safeTerm}%`
        )
        .order("full_name", { ascending: true })
        .limit(20);

    if (profileError) throw profileError;

    const { data: activeAppointments, error: appointmentError } =
      await supabaseAdmin
        .from("national_secretariat_appointments")
        .select("profile_id")
        .eq("appointment_status", "active");

    if (appointmentError) throw appointmentError;

    const appointedProfileIds = new Set(
      activeAppointments.map((item) => item.profile_id)
    );

    const candidates = profiles.filter(
      (profile) => !appointedProfileIds.has(profile.id)
    );

    return res.status(200).json({
      success: true,
      count: candidates.length,
      candidates,
    });
  } catch (error) {
    console.error(
      "Search Secretariat candidates error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to search registered users.",
    });
  }
};


// ==========================================
// GET NATIONAL SECRETARIAT APPOINTMENT HISTORY
// ==========================================

export const getSecretariatAppointments = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("national_secretariat_appointments")
      .select(`
        id,
        profile_id,
        position,
        appointment_date,
        term_start,
        term_end,
        appointment_status,
        appointment_notes,
        appointed_by,
        created_at,
        updated_at,

        profiles!national_secretariat_appointments_profile_id_fkey (
          id,
          full_name,
          phone,
          photo_url,
          bio
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      count: data.length,
      appointments: data,
    });
  } catch (error) {
    console.error(
      "Get Secretariat appointment history error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve Secretariat appointment history.",
    });
  }
};
