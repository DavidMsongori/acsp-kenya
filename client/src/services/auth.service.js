
import { supabase } from "../config/supabase";

// ==========================================
// Register Applicant
// ==========================================

export const registerUser = async ({
  fullName,
  email,
  phone,
  password,
}) => {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: {
        full_name: fullName.trim(),
        phone: phone.trim(),
      },
    },
  });

  if (error) {
    throw error;
  }

  if (!data.session) {
    throw new Error(
      "Registration completed, but no active session was created. Check that email confirmation is disabled in Supabase."
    );
  }

  return data;
};

// ==========================================
// Login
// ==========================================

export const loginUser = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    throw error;
  }

  return data;
};

// ==========================================
// Logout
// ==========================================

export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
};

// ==========================================
// Get Current User
// ==========================================

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user;
};

// ==========================================
// Get Current Session
// ==========================================

export const getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
};

// ==========================================
// Listen to Authentication Changes
// ==========================================

export const onAuthStateChange = (callback) => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(callback);

  return subscription;
};


// ==========================================
// Get User Roles
// ==========================================

export const getUserRoles = async (userId) => {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return data.map((item) => item.role);
};