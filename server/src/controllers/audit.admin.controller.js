import { supabaseAdmin } from "../config/supabase.js";

// ==========================================
// GET ALL AUDIT LOGS
// ==========================================

export const getAuditLogs = async (req, res) => {
  try {
    const {
      search,
      module,
      action,
      user_id,
      from,
      to,
      page = 1,
      limit = 20,
    } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(
      Math.max(parseInt(limit, 10) || 20, 1),
      100
    );

    const fromIndex = (pageNumber - 1) * pageSize;
    const toIndex = fromIndex + pageSize - 1;

    let query = supabaseAdmin
      .from("audit_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(fromIndex, toIndex);

    if (module) query = query.eq("module", module);
    if (action) query = query.eq("action", action);
    if (user_id) query = query.eq("user_id", user_id);

    if (from) query = query.gte("created_at", from);
    if (to) query = query.lte("created_at", to);

    if (search) {
      const safeSearch = search.replace(/[,%()]/g, "");
      if (safeSearch) {
        query = query.or(
          `user_name.ilike.%${safeSearch}%,user_email.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%,entity_type.ilike.%${safeSearch}%,action.ilike.%${safeSearch}%`
        );
      }
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return res.status(200).json({
      success: true,
      count: count || 0,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
      logs: data || [],
    });
  } catch (error) {
    console.error("Get audit logs error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve audit logs.",
    });
  }
};

// ==========================================
// GET AUDIT LOG STATISTICS
// ==========================================

export const getAuditLogStatistics = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("audit_logs")
      .select("id, action, module, created_at");

    if (error) throw error;

    const logs = data || [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLogs = logs.filter(
      (log) => new Date(log.created_at) >= today
    );

    const modules = new Set(
      logs.map((log) => log.module).filter(Boolean)
    );

    const actions = {};

    logs.forEach((log) => {
      actions[log.action] = (actions[log.action] || 0) + 1;
    });

    const mostCommonAction = Object.entries(actions).sort(
      (a, b) => b[1] - a[1]
    )[0];

    return res.status(200).json({
      success: true,
      statistics: {
        totalLogs: logs.length,
        todayLogs: todayLogs.length,
        modulesTracked: modules.size,
        mostCommonAction: mostCommonAction
          ? {
              action: mostCommonAction[0],
              count: mostCommonAction[1],
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Audit statistics error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve audit statistics.",
    });
  }
};

// ==========================================
// GET SINGLE AUDIT LOG
// ==========================================

export const getAuditLogById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from("audit_logs")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Audit log not found.",
      });
    }

    return res.status(200).json({
      success: true,
      log: data,
    });
  } catch (error) {
    console.error("Get audit log error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve audit log.",
    });
  }
};