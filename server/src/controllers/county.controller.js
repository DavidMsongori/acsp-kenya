
import { supabaseAdmin } from "../config/supabase.js";

export const getCounties = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("counties")
      .select("id, name, code")
      .order("id", { ascending: true });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      count: data.length,
      counties: data,
    });
  } catch (error) {
    console.error("Get counties error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve counties",
    });
  }
};
