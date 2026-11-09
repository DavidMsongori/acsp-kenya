
import { supabaseAdmin } from "../config/supabase.js";

// GET ALL CONTACT MESSAGES
export const getAllContactMessages = async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = supabaseAdmin
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      const allowedStatuses = ["new", "read", "replied", "archived"];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid contact message status.",
        });
      }

      query = query.eq("status", status);
    }

    if (search && String(search).trim()) {
      const term = String(search).trim().replace(/[,%()]/g, "");
      query = query.or(
        `name.ilike.%${term}%,email.ilike.%${term}%,subject.ilike.%${term}%`
      );
    }

    const { data, error } = await query;

    if (error) throw error;

    return res.status(200).json({
      success: true,
      count: data.length,
      messages: data,
    });
  } catch (error) {
    console.error("Get contact messages error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve contact messages.",
    });
  }
};

// GET SINGLE CONTACT MESSAGE
export const getContactMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from("contact_messages")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found.",
      });
    }

    // Automatically mark a new message as read when opened.
    if (data.status === "new") {
      const { data: updated, error: updateError } = await supabaseAdmin
        .from("contact_messages")
        .update({ status: "read" })
        .eq("id", id)
        .select("*")
        .single();

      if (updateError) throw updateError;

      return res.status(200).json({
        success: true,
        contactMessage: updated,
      });
    }

    return res.status(200).json({
      success: true,
      contactMessage: data,
    });
  } catch (error) {
    console.error("Get contact message error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve contact message.",
    });
  }
};

// UPDATE CONTACT MESSAGE STATUS
export const updateContactMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["new", "read", "replied", "archived"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be new, read, replied or archived.",
      });
    }

    const updates = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === "replied") {
      updates.replied_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from("contact_messages")
      .update(updates)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Contact message marked as ${status}.`,
      contactMessage: data,
    });
  } catch (error) {
    console.error("Update contact message status error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update contact message status.",
    });
  }
};

// DELETE CONTACT MESSAGE
export const deleteContactMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from("contact_messages")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact message deleted successfully.",
    });
  } catch (error) {
    console.error("Delete contact message error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to delete contact message.",
    });
  }
};
