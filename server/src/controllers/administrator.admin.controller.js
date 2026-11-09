
import { supabaseAdmin } from "../config/supabase.js";

// ==========================================
// GET ADMINISTRATORS
// ==========================================

export const getAdministrators = async (req, res) => {
  try {
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from("user_roles")
      .select("id, user_id, role, assigned_by, role_source, role_source_id, created_at")
      .in("role", ["super_admin", "nec_admin"])
      .order("created_at", { ascending: false });

    if (rolesError) throw rolesError;

    const userIds = [...new Set((roles || []).map((item) => item.user_id))];

    if (userIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        administrators: [],
      });
    }

    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, phone, photo_url, bio")
      .in("id", userIds);

    if (profilesError) throw profilesError;

    const profileMap = new Map(
      (profiles || []).map((profile) => [profile.id, profile])
    );

    const authUsers = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage: 1000,
      });

      if (error) throw error;

      authUsers.push(...(data.users || []));
      hasMore = (data.users || []).length === 1000;
      page += 1;
    }

    const authMap = new Map(
      authUsers.map((user) => [user.id, user])
    );

    const administrators = (roles || []).map((roleRecord) => {
      const profile = profileMap.get(roleRecord.user_id) || {};
      const authUser = authMap.get(roleRecord.user_id);

      return {
        ...roleRecord,
        full_name: profile.full_name || "Unnamed Administrator",
        phone: profile.phone || "",
        photo_url: profile.photo_url || "",
        bio: profile.bio || "",
        email: authUser?.email || "",
        account_status: authUser
          ? authUser.email_confirmed_at
            ? "active"
            : "invited"
          : "unavailable",
        last_sign_in_at: authUser?.last_sign_in_at || null,
      };
    });

    return res.status(200).json({
      success: true,
      count: administrators.length,
      administrators,
    });
  } catch (error) {
    console.error("Get administrators error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve administrators.",
    });
  }
};

// ==========================================
// INVITE A SUPER ADMINISTRATOR
// ==========================================

export const inviteAdministrator = async (req, res) => {
  let invitedUserId = null;

  try {
    const {
      full_name,
      email,
      phone = "",
    } = req.body;

    if (!full_name?.trim() || !email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Full name and email address are required.",
      });
    }

    if (
      full_name.trim().length > 200 ||
      email.trim().length > 255 ||
      phone.trim().length > 30
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more fields exceed the permitted length.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address.",
      });
    }

    // Check whether this email already belongs to an account.
    const { data: existingUsers, error: usersError } =
      await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (usersError) throw usersError;

    const existingUser = existingUsers.users.find(
      (user) => user.email?.toLowerCase() === normalizedEmail
    );

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Send the administrator invitation.
    const { data: invitation, error: invitationError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(
        normalizedEmail,
        {
          data: {
            full_name: full_name.trim(),
          },
          ...(process.env.ADMIN_INVITE_REDIRECT_URL
            ? {
                redirectTo: process.env.ADMIN_INVITE_REDIRECT_URL,
              }
            : {}),
        }
      );

    if (invitationError) throw invitationError;

    invitedUserId = invitation.user?.id;

    if (!invitedUserId) {
      throw new Error("Supabase did not return the invited user account.");
    }

    // Create the user's profile.
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: invitedUserId,
        full_name: full_name.trim(),
        phone: phone.trim() || null,
      });

    if (profileError) throw profileError;

    // Assign manually managed Super Admin access.
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: invitedUserId,
        role: "super_admin",
        assigned_by: req.user.id,
        role_source: "manual",
        role_source_id: null,
      });

    if (roleError) throw roleError;

    // Record the invitation in the audit log.
    await supabaseAdmin.from("audit_logs").insert({
      user_id: req.user.id,
      action: "administrator_invited",
      entity_type: "administrator",
      entity_id: invitedUserId,
      module: "administrators",
      description: `Invited ${full_name.trim()} as a Super Administrator.`,
      details: {
        administrator_name: full_name.trim(),
        administrator_email: normalizedEmail,
        assigned_role: "super_admin",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Super Administrator invited successfully.",
      administrator: {
        id: invitedUserId,
        full_name: full_name.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        role: "super_admin",
        account_status: "invited",
      },
    });
  } catch (error) {
    console.error("Invite administrator error:", error.message);

    // Roll back a partially created account.
    if (invitedUserId) {
      await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", invitedUserId)
        .eq("role", "super_admin");

      await supabaseAdmin
        .from("profiles")
        .delete()
        .eq("id", invitedUserId);

      await supabaseAdmin.auth.admin.deleteUser(invitedUserId);
    }

    return res.status(500).json({
      success: false,
      message: "Unable to invite the administrator. Please try again.",
    });
  }
};
