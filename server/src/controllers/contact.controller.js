
import { supabaseAdmin } from "../config/supabase.js";

export const submitContactMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide your name, email, subject and message.",
      });
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPhone = phone ? String(phone).trim() : null;
    const cleanSubject = String(subject).trim();
    const cleanMessage = String(message).trim();

    // Validate lengths
    if (
      cleanName.length > 120 ||
      cleanEmail.length > 255 ||
      (cleanPhone && cleanPhone.length > 30) ||
      cleanSubject.length > 200 ||
      cleanMessage.length > 10000
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more fields exceed the allowed length.",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    if (
      !cleanName ||
      !cleanSubject ||
      !cleanMessage
    ) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required fields.",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("contact_messages")
      .insert([
        {
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          subject: cleanSubject,
          message: cleanMessage,
        },
      ])
      .select("id, name, email, subject, status, created_at")
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: "Your message has been submitted successfully. Thank you for contacting ACSP-Kenya.",
      contactMessage: data,
    });
  } catch (error) {
    console.error("Submit contact message error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to submit your message at the moment. Please try again later.",
    });
  }
};
