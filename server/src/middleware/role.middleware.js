
import { supabaseAdmin } from "../config/supabase.js";

export const authorizeRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const { data, error } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", req.user.id)
        .in("role", allowedRoles);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to perform this action",
        });
      }

      req.userRoles = data.map((item) => item.role);

      next();
    } catch (error) {
      console.error("Authorization error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to verify user permissions",
      });
    }
  };
};
